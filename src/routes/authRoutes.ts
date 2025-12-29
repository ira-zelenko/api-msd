import { Router } from 'express';
import { authController } from '../controllers/authController';
import { registrationLimiter } from '../middleware/rate-limit';

const router = Router();

router.post(
  '/register',
  registrationLimiter.middleware(),
  authController.register.bind(authController)
);

router.post(
  '/update-user-metadata',
  authController.updateUserMetadata.bind(authController)
);

router.post(
  '/resend-verification',
  registrationLimiter.middleware(),
  authController.resendVerificationEmail.bind(authController)
);

router.get('/health', authController.healthCheck.bind(authController));

export { router as authRoutes };
