import express from "express";
import { deleteUserById, getUserById, getUsers } from "../db/users";
import { constants } from "node:http2";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers();

    return res.status(constants.HTTP_STATUS_OK).json(users);
  } catch (error) {
    console.error(error);
    return res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    const deleteUSer = await deleteUserById(id);

    return res.json(deleteUSer);
  } catch (error) {
    console.error(error);
    return res.status(constants.HTTP_STATUS_BAD_REQUEST);
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    if (!username) return res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);

    const user = await getUserById(id);

    user.username = username;
    await user.save();

    return res.status(constants.HTTP_STATUS_OK).json(user).end();
  } catch (error) {
    console.error(error);
    return res.status(constants.HTTP_STATUS_BAD_REQUEST);
  }
};
