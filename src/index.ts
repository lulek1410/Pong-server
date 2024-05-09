import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "./utils/HttpError";

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

app.get("/", (req: Request, res: Response, next: NextFunction) =>
  res.send("It works")
);

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

app.listen(5000, () => {
  console.log("server listens at 5000");
});
