import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', (req, res) => authController.register(req, res));
router.get('/health', (req, res) => authController.healthCheck(req, res));

export { router as authRoutes };
