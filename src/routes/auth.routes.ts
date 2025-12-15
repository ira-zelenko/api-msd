import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/register
 * Public endpoint for user registration
 * Creates user in Auth0 and returns tokens + user data
 */
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res)); // ADD THIS LINE


/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => authController.healthCheck(req, res));

export { router as authRoutes };
