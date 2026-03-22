import { Router } from 'express';
import { 
  createBloodRequest, 
  getBloodRequests, 
  getBloodRequestById, 
  findMatchingDonorsForRequest 
} from '../controllers/bloodRequestController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/hospitals/requests - Create blood request (HOSPITAL only)
router.post('/requests', 
  authorize(['HOSPITAL', 'ADMIN']), 
  createBloodRequest
);

// GET /api/hospitals/requests - Get blood requests (HOSPITAL or ADMIN)
router.get('/requests', 
  authorize(['HOSPITAL', 'ADMIN']), 
  getBloodRequests
);

// GET /api/hospitals/requests/:id - Get single blood request
router.get('/requests/:id', 
  authorize(['HOSPITAL', 'ADMIN']), 
  getBloodRequestById
);

// POST /api/hospitals/requests/:id/match-donors - Match donors for request
router.post('/requests/:id/match-donors', 
  authorize(['HOSPITAL', 'ADMIN']), 
  findMatchingDonorsForRequest
);

export default router;
