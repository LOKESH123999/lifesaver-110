import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User, Donor, Hospital, BloodRequest } from '../models';
import { hashPassword } from '../utils/auth';

describe('Blood Request Endpoints', () => {
  let hospitalUser: any;
  let hospital: any;
  let hospitalId: string;
  let authToken: string;

  beforeEach(async () => {
    // Create a test hospital and user using real registration endpoint
    const registrationResponse = await request(app)
      .post('/api/auth/register-hospital')
      .send({
        hospitalName: 'Test Hospital',
        officialEmail: 'test@hospital.com',
        address: '123 Test Street',
        city: 'Test City',
        area: 'Test Area',
        contactNumber: '+1234567890',
        password: 'password123'
      })
      .expect(201);

    hospitalId = registrationResponse.body.data.hospitalId;
    authToken = registrationResponse.body.data.token;

    // Get hospital and user for reference
    hospital = await Hospital.findById(hospitalId);
    hospitalUser = await User.findOne({ email: 'test@hospital.com' }).populate('hospitalId');
  });

  describe('POST /api/hospitals/requests', () => {
    it('should create blood request successfully', async () => {
      const requestData = {
        patientCode: 'P001',
        bloodGroupRequired: 'A+',
        unitsRequired: 2,
        urgencyLevel: 'HIGH',
        city: 'Test City',
        area: 'Test Area'
      };

      const response = await request(app)
        .post('/api/hospitals/requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patientCode).toBe('P001');
      expect(response.body.data.bloodGroupRequired).toBe('A+');
      expect(response.body.data.unitsRequired).toBe(2);
      expect(response.body.data.urgencyLevel).toBe('HIGH');
      expect(response.body.data.status).toBe('PENDING');

      // Verify request was created
      const bloodRequest = await BloodRequest.findById(response.body.data._id);
      expect(bloodRequest).toBeTruthy();
      if (bloodRequest) {
        expect(bloodRequest.patientCode).toBe('P001');
        expect(bloodRequest.hospitalId.toString()).toBe(hospitalId);
      }
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/hospitals/requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bloodGroupRequired: 'A+',
          // missing other required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/hospitals/requests')
        .send({
          patientCode: 'P001',
          bloodGroupRequired: 'A+',
          unitsRequired: 2,
          urgencyLevel: 'HIGH',
          city: 'Test City',
          area: 'Test Area'
        })
        .expect(401);
    });
  });

  describe('POST /api/hospitals/requests/:id/match-donors', () => {
    let bloodRequest: any;
    let donors: any[] = [];

    beforeEach(async () => {
      // Create test donors
      const donorData = [
        {
          fullName: 'Donor One',
          email: 'donor1@test.com',
          phoneNumber: '+1234567890',
          donorType: 'citizen',
          city: 'Test City',
          area: 'Test Area',
          bloodGroup: 'A+',
          isEligible: true,
          isActive: true,
          consentToCalls: true
        },
        {
          fullName: 'Donor Two',
          email: 'donor2@test.com',
          phoneNumber: '+1234567891',
          donorType: 'student',
          collegeName: 'Test College',
          studentId: 'ST001',
          city: 'Test City',
          area: 'Test Area',
          bloodGroup: 'A+',
          isEligible: true,
          isActive: true,
          consentToCalls: true
        }
      ];

      donors = await Donor.insertMany(donorData);

      // Create a blood request
      bloodRequest = new BloodRequest({
        hospitalId: hospitalId,
        requestedByUserId: hospitalUser._id,
        patientCode: 'P001',
        bloodGroupRequired: 'A+',
        unitsRequired: 2,
        urgencyLevel: 'HIGH',
        city: 'Test City',
        area: 'Test Area',
        status: 'PENDING'
      });
      await bloodRequest.save();
    });

    it('should return matched donors successfully', async () => {
      const response = await request(app)
        .post(`/api/hospitals/requests/${bloodRequest._id}/match-donors`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ autoCreateCallLogs: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requestId).toBe(bloodRequest._id.toString());
      expect(response.body.data.matchedDonors).toHaveLength(2);
      expect(response.body.data.matchedDonors[0].fullName).toBe('Donor One');
      expect(response.body.data.matchedDonors[1].fullName).toBe('Donor Two');
      expect(response.body.data.callLogIds).toHaveLength(2);
      expect(response.body.data.matchedDonors[0].twilioCallUrl).toBeDefined();
    });

    it('should return 404 for non-existent request', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post(`/api/hospitals/requests/${fakeId}/match-donors`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ autoCreateCallLogs: true })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 403 for unauthorized hospital access', async () => {
      // Create a different hospital and user
      const otherHospital = new Hospital({
        hospitalName: 'Other Hospital',
        officialEmail: 'other@hospital.com',
        address: '123 Other Street',
        city: 'Other City',
        area: 'Other Area',
        contactNumber: '+1234567899',
        isVerified: false
      });
      await otherHospital.save();

      const otherUser = new User({
        email: 'other@hospital.com',
        passwordHash: await hashPassword('password123'),
        role: 'HOSPITAL',
        hospitalId: otherHospital._id
      });
      await otherUser.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@hospital.com',
          password: 'password123'
        });

      const otherToken = loginResponse.body.data.token;

      const response = await request(app)
        .post(`/api/hospitals/requests/${bloodRequest._id}/match-donors`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ autoCreateCallLogs: true })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });
  });

  afterEach(async () => {
    await Donor.deleteMany({});
    await BloodRequest.deleteMany({});
  });
});
