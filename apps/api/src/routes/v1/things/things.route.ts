import express from 'express';
import { createThingHandler } from './things.handlers';

const router = express.Router();

router.route('/').post(createThingHandler.requestHandler);

export default router;
