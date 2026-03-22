import express from 'express';
import { registerDonor, registerHospital, login } from '../controllers/authController';
import { validateDonorRegistration, validateHospitalRegistration, validateLogin } from '../middleware/validation';

const router = express.Router();

router.post('/register-donor', validateDonorRegistration, registerDonor);
router.post('/register-hospital', validateHospitalRegistration, registerHospital);
router.post('/login', validateLogin, login);

export default router;
