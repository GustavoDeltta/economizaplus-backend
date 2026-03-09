import express from 'express';
import usersRouter from './modules/users/users.routes.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/users', usersRouter);

app.use(errorHandler);

export default app;
