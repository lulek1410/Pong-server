import { Router } from "express";
import multer from "multer";
import {
  getUser,
  getUsers,
  loginUser,
  registerUser,
} from "../controllers/users";
import { check } from "express-validator";

export const usersRouter = Router();
const upload = multer();

usersRouter.get("/", getUsers);

usersRouter.use(upload.none(), [
  check("email").isEmail(),
  check("password").isLength({ min: 6 }),
]);

usersRouter.post("/register", [check("name").notEmpty()], registerUser);
usersRouter.get("/:id", getUser);
usersRouter.post("/login", loginUser);
