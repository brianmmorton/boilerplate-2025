import express from 'express';
import authRouter from './auth/auth.route';
import meRouter from './me';
import thingsRouter from './things/things.route';

const router = express.Router();

const defaultRoutes = [
	{
		path: '/auth',
		router: authRouter
	},
	{
		path: '/me',
		router: meRouter
	},
	{
		path: '/things',
		router: thingsRouter
	}
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.router);
});

export default router;
