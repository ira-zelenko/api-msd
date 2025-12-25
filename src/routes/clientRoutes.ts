import express from 'express';
import { jwtCheck, requireClientType } from '../middleware/auth';
import { proxyRequestToYSDAPI } from '../services/m2m.service';

const router = express.Router();

/**
 * GET /api/client
 * Fetch client data (contact info + carrier accounts)
 */
router.get('/client', jwtCheck, requireClientType, async (req, res) => {
  try {
    const response = await proxyRequestToYSDAPI(req, '/api/client');
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client data',
      message: error.message
    });
  }
});

/**
 * PUT /api/client
 * Update client data (contact info + carrier accounts)
 */
router.put('/client', jwtCheck, requireClientType, async (req, res) => {
  try {
    const response = await proxyRequestToYSDAPI(req, '/api/client');
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to update client data',
      message: error.message
    });
  }
});

export default router;
