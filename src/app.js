import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.options("", cors(corsConfig));
app.use(cors(corsConfig));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import taskRouter from "./routes/task.route.js";

app.use("/auth", userRouter);
app.use("/tasks", taskRouter);

export { app };
