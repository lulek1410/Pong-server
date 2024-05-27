import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs/dist/bcrypt.js";

import { IUser, User } from "../models/User";

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

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }
  const userData: IUser = req.body;
  let user = await User.findOne({ email: userData.email });
  try {
    user = await User.findOne({ email: userData.email });
  } catch (e) {
    return next(new HttpError("Sign up failed. Please try again later.", 500));
  }

  if (user) {
    return next(new HttpError("User with that email already exists.", 422));
  }

  let hashedPassword;
  try {
    console.log(userData);
    hashedPassword = await bcrypt.hash(userData.password, 12);
  } catch (e) {
    console.log(e);
    return next(
      new HttpError("User creation failed. Please try again later.", 500)
    );
  }

  const newUser = new User({
    ...userData,
    password: hashedPassword,
    friends: [],
  });

  try {
    await newUser.save();
  } catch (e) {
    console.log(e);
    return next(
      new HttpError("Could not save the new user. Please try again later.", 500)
    );
  }

  res.status(200).json({ userId: newUser.id, name: newUser.name });
};
