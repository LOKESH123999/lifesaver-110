import { Router } from 'express';
import { 
  handleVoiceWebhook, 
  handleStatusWebhook 
} from '../controllers/twilioController';

const router = Router();

// POST /api/twilio/voice - Twilio IVR webhook (public with secret validation)
router.post('/voice', handleVoiceWebhook);

// POST /api/twilio/status - Twilio call status webhook (public with secret validation)
router.post('/status', handleStatusWebhook);

export default router;
