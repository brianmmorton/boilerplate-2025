import express from 'express';
import {
	registerHandler,
	loginHandler,
	logoutHandler,
	forgotPasswordHandler,
	resetPasswordHandler,
	refreshTokensHandler,
	verifyEmailHandler,
	sendVerificationEmailHandler
} from './auth.handlers';

const router = express.Router();

router.post('/register', registerHandler.requestHandler);
router.post('/login', loginHandler.requestHandler);
router.post('/logout', logoutHandler.requestHandler);
router.post('/refresh-tokens', refreshTokensHandler.requestHandler);
router.post('/forgot-password', forgotPasswordHandler.requestHandler);
router.post('/reset-password', resetPasswordHandler.requestHandler);
router.post('/send-verification-email', sendVerificationEmailHandler.requestHandler);
router.post('/verify-email', verifyEmailHandler.requestHandler);

export default router;
