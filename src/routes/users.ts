import { Router } from "express";
import multer from "multer";
import { getUsers, registerUser } from "../controllers/users";

export const usersRouter = Router();
const upload = multer();

usersRouter.use(upload.none());

usersRouter.get("/", getUsers);

usersRouter.post("/register", registerUser);
