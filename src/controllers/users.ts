import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { HttpError } from "../utils/HttpError";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err: any) {
    return next(
      new HttpError("Fetching users failed, please try again later.", 500)
    );
  }
  res.status(200).json(users.map((user) => user.toObject({ getters: true })));
};
