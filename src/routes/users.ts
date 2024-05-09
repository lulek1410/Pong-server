import { Router } from "express";
import { getUsers } from "../controllers/users";

export const usersRouter = Router();

usersRouter.get("/", getUsers);
