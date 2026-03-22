import React, { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  donorType: 'student' | 'citizen';
  collegeName: string;
  studentId: string;
  bloodGroup: string;
  city: string;
  area: string;
  lastDonationDate: string;
  consentToCalls: boolean;
}

const DonorRegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    donorType: 'student',
    collegeName: '',
    studentId: '',
    bloodGroup: '',
    city: '',
    area: '',
    lastDonationDate: '',
    consentToCalls: false,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.phoneNumber) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!formData.bloodGroup) {
      setError('Please select your blood group');
      return false;
    }
    if (!formData.city || !formData.area) {
      setError('Please provide your city and area');
      return false;
    }
    if (formData.donorType === 'student' && (!formData.collegeName || !formData.studentId)) {
      setError('Please provide college name and student ID');
      return false;
    }
    if (!formData.consentToCalls) {
      setError('You must consent to receive emergency calls');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register-donor', formData);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Your account has been created successfully. You will be redirected to the login page.
          </p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-600">
            LifeSaver 110
          </h2>
          <h3 className="mt-2 text-xl text-gray-900">
            Register as Blood Donor
          </h3>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />

              <Input
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
              />

              <Input
                name="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donor Type
                </label>
                <select
                  name="donorType"
                  value={formData.donorType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="student">Student</option>
                  <option value="citizen" disabled>Citizen (Coming Soon)</option>
                </select>
              </div>

              <Input
                name="bloodGroup"
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </Input>
            </div>

            {formData.donorType === 'student' && (
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  name="collegeName"
                  label="College Name"
                  value={formData.collegeName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your college name"
                />

                <Input
                  name="studentId"
                  label="Student ID"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  placeholder="Enter your student ID"
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Enter your city"
              />

              <Input
                name="area"
                label="Area"
                value={formData.area}
                onChange={handleChange}
                required
                placeholder="Enter your area"
              />
            </div>

            <Input
              type="date"
              name="lastDonationDate"
              label="Last Donation Date (Optional)"
              value={formData.lastDonationDate}
              onChange={handleChange}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                name="consentToCalls"
                id="consentToCalls"
                checked={formData.consentToCalls}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="consentToCalls" className="ml-2 block text-sm text-gray-700">
                I agree to receive emergency blood request calls on my phone
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Register as Donor
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DonorRegisterPage;
