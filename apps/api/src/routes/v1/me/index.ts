import express from 'express';
import userRoute from './user/user.route';

const router = express.Router();

const routes = [
	{
		path: '/user',
		route: userRoute
	},
];

routes.forEach((route) => {
	router.use(route.path, route.route);
});

export default router;
