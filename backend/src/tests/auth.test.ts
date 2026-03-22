import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User, Donor, Hospital } from '../models';
import { hashPassword } from '../utils/auth';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register-hospital', () => {
    it('should create hospital and user successfully', async () => {
      const hospitalData = {
        hospitalName: 'Test Hospital',
        officialEmail: 'test@hospital.com',
        address: '123 Test Street',
        city: 'Test City',
        area: 'Test Area',
        contactNumber: '+1234567890',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register-hospital')
        .send(hospitalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.hospitalId).toBeDefined();
      expect(response.body.data.role).toBe('HOSPITAL');
      expect(response.body.data.token).toBeDefined();

      // Verify hospital was created
      const hospital = await Hospital.findById(response.body.data.hospitalId);
      expect(hospital).toBeTruthy();
      if (hospital) {
        expect(hospital.hospitalName).toBe('Test Hospital');
        expect(hospital.isVerified).toBe(false);
      }

      // Verify user was created
      const user = await User.findById(response.body.data.userId);
      expect(user).toBeTruthy();
      if (user) {
        expect(user.email).toBe('test@hospital.com');
        expect(user.role).toBe('HOSPITAL');
        expect(user.hospitalId?.toString()).toBe(response.body.data.hospitalId);
      }
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register-hospital')
        .send({
          hospitalName: 'Test Hospital',
          // missing other required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should return 409 for duplicate email', async () => {
      // First create a hospital
      const hospitalData = {
        hospitalName: 'Test Hospital',
        officialEmail: 'duplicate@hospital.com',
        address: '123 Test Street',
        city: 'Test City',
        area: 'Test Area',
        contactNumber: '+1234567890',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register-hospital')
        .send(hospitalData);

      // Try to create with same email
      const response = await request(app)
        .post('/api/auth/register-hospital')
        .send(hospitalData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test hospital and user for login tests
      const hospital = new Hospital({
        hospitalName: 'Test Hospital',
        officialEmail: 'test@hospital.com',
        address: '123 Test Street',
        city: 'Test City',
        area: 'Test Area',
        contactNumber: '+1234567890',
        isVerified: false
      });
      await hospital.save();

      const user = new User({
        email: 'test@hospital.com',
        passwordHash: await hashPassword('password123'),
        role: 'HOSPITAL',
        hospitalId: hospital._id
      });
      await user.save();
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@hospital.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.role).toBe('HOSPITAL');
      expect(response.body.data.hospitalId).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@hospital.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@hospital.com'
          // missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });
});
