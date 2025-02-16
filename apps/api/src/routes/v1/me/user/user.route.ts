import express from 'express';
import { getUserHandler } from './user.handler';

const router = express.Router();

router.route('/').get(getUserHandler.requestHandler);

export default router;
