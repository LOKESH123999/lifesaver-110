import { Router } from 'express';
import { registerDonor, registerHospital, login } from '../controllers/authController';

const router = Router();

// Donor registration
router.post('/register-donor', registerDonor);

// Hospital registration  
router.post('/register-hospital', registerHospital);

// Login for all users
router.post('/login', login);

export default router;
