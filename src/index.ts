import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import { errorMiddleware } from "./middlewares/error";

dotenv.config();

const app = express();

app.use(express.json());
app.use(routes);
app.use(errorMiddleware);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});