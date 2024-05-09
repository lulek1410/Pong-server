import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "./utils/HttpError";
import mongoose from "mongoose";
import { usersRouter } from "./routes/users";

const app = express();

app.use(express.json());

var port = 5000;

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.get("/api", (req: Request, res: Response, next: NextFunction) =>
  res.send("It works")
);

app.use("/api/users", usersRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  throw new HttpError("Path not found", 404);
});

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.errorCode || 500)
    .json({ message: error.message || "An unknown error occured" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7tr11tj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() =>
    app.listen(5000, () => {
      console.log("server listens at 5000");
    })
  )
  .catch((err) => console.log(err));
