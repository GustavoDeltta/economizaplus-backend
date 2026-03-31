import "dotenv/config";
import "express-async-errors";
import express from "express";
import routes from "./routes";
import { errorHandler } from "./shared/middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use(routes);
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});