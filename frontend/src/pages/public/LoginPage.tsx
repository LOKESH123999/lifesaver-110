import React, { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

interface FormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email: formData.email, password: formData.password });
      const { token: newToken, user: newUser } = response.data.data;
      
      login(newToken, newUser);
      // Navigation will be handled by AuthContext and routing
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-600">
            LifeSaver 110
          </h2>
          <h3 className="mt-2 text-xl text-gray-900">
            Sign in to your account
          </h3>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <Input
              type="email"
              name="email"
              label="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register/donor"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register as Donor
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Hospital?{' '}
              <Link
                to="/register/hospital"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register Hospital
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
