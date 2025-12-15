import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.get('/check-email-verified', authController.checkEmailVerified.bind(authController));
router.get('/health', authController.healthCheck.bind(authController));

export { router as authRoutes };

