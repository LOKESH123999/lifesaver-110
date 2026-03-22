import React, { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

interface FormData {
  hospitalName: string;
  officialEmail: string;
  password: string;
  address: string;
  city: string;
  area: string;
  contactNumber: string;
}

const HospitalRegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    hospitalName: '',
    officialEmail: '',
    password: '',
    address: '',
    city: '',
    area: '',
    contactNumber: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.hospitalName || !formData.officialEmail || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!formData.address || !formData.city || !formData.area) {
      setError('Please provide complete address information');
      return false;
    }
    if (!formData.contactNumber) {
      setError('Please provide contact number');
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
      const response = await api.post('/auth/register-hospital', formData);
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
            Registration Submitted!
          </h2>
          <p className="text-gray-600 mb-4">
            Your hospital registration has been submitted successfully. 
            Registration submitted. Awaiting admin verification.
            You will be redirected to the login page in 3 seconds.
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
            Register Your Hospital
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
                name="hospitalName"
                label="Hospital Name"
                value={formData.hospitalName}
                onChange={handleChange}
                required
                placeholder="Enter hospital name"
              />

              <Input
                type="email"
                name="officialEmail"
                label="Official Email"
                value={formData.officialEmail}
                onChange={handleChange}
                required
                placeholder="Enter official email"
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
                name="contactNumber"
                label="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                placeholder="Enter contact number"
              />
            </div>

            <Input
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter complete address"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Enter city"
              />

              <Input
                name="area"
                label="Area"
                value={formData.area}
                onChange={handleChange}
                required
                placeholder="Enter area"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Register Hospital
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

export default HospitalRegisterPage;
