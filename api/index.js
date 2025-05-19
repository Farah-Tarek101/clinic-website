// api/index.js
import Server from "serverless-http";
import app from "../backend/app.js";

export const handler = Server(app);
