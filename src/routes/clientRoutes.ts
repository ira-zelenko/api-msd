import express from 'express';
import { jwtCheck, requireClientType } from '../middleware/auth';
import { proxyRequestToYSDAPI } from '../services/m2m.service';
import { getClientById } from "../controllers/clientController";

const router = express.Router();

/**
 * Fetch client data by ID
 */
router.get('/clients/:id', jwtCheck, requireClientType, getClientById);

/**
 * Update client data
 */
router.put('/clients/:id', jwtCheck, requireClientType, async (req, res) => {
  try {
    const { id } = req.params;

    const response = await proxyRequestToYSDAPI(req, `/clients/${id}`);
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
