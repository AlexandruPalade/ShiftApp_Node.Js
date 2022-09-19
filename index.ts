import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";

import userRouter from "./routes/user.route";
import shiftRouter from "./routes/shift.route";
import commentRouter from "./routes/comment.route";

import { setup } from "./utils/mongoSetup";
import { Config } from "./types";
import { tokenGuard } from "./middlewares/tokenGuard.middleware";

const config = require("config") as Config;

const { PORT } = config;

setup();
const app = express();

app.use(morgan("common"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/user", userRouter);
app.use(tokenGuard);
app.use("/api/shift", shiftRouter);
app.use("/api/comment", commentRouter);

app.listen(PORT);
