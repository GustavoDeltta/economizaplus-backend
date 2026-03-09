import { Router } from 'express';
import { registerHandler, loginHandler } from './users.controller.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;
