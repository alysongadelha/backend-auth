import express from "express";
import { get, merge } from "lodash";
import { constants } from "node:http2";
import { getUserBySessionToken } from "../db/users";

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["ALYSON-AUTH"];

    if (!sessionToken) return res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);

    const existingUser = await getUserBySessionToken(sessionToken);

    if (!existingUser) return res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);

    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
  }
};

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, "identity._id") as string;

    if (!currentUserId) return res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);

    if (currentUserId.toString() !== id)
      return res.sendStatus(constants.HTTP_STATUS_FORBIDDEN);

    return next();
  } catch (error) {
    console.error(error);
    res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
  }
};
