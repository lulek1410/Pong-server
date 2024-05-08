import express from "express";

const app = express();

app.use(express.json());

var port = 5000;

app.listen(5000, () => {
  console.log("server listens at 5000");
});
