import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { registrationLimiter } from '../middleware/rate-limit';

const router = Router();

// Apply rate limiting to registration
router.post(
  '/register',
  registrationLimiter.middleware(),
  authController.register.bind(authController)
);

// Health check
router.get('/health', authController.healthCheck.bind(authController));

export { router as authRoutes };
