import express from "express";
import { constants } from "node:http2";
import { createUser, getUserByEmail } from "../db/users";
import { authentication, random } from "../helpers";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.sendStatus(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY);
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) return res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res.status(constants.HTTP_STATUS_OK).json(user).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.sendStatus(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY);
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (!user) return res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      return res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }

    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );

    await user.save();

    res.cookie("ALYSON-AUTH", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    return res.status(constants.HTTP_STATUS_OK).json(user).end();
  } catch (error) {
    console.error(error);
    res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
  }
};
