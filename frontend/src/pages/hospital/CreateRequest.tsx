import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

interface FormData {
  patientCode: string;
  bloodGroupRequired: string;
  unitsRequired: number;
  urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  city: string;
  area: string;
}

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    patientCode: '',
    bloodGroupRequired: '',
    unitsRequired: 1,
    urgencyLevel: 'MEDIUM',
    city: '',
    area: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'unitsRequired' ? parseInt(value) || 1 : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.patientCode) {
      setError('Please enter patient code');
      return false;
    }
    if (!formData.bloodGroupRequired) {
      setError('Please select blood group required');
      return false;
    }
    if (!formData.unitsRequired || formData.unitsRequired < 1) {
      setError('Please enter valid number of units required');
      return false;
    }
    if (!formData.city || !formData.area) {
      setError('Please provide city and area');
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
      const response = await api.post('/hospitals/blood-requests', formData);
      if (response.data.success) {
        navigate('/hospital/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create blood request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Blood Request
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details to find matching blood donors
          </p>
        </div>

        <Card className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <Input
                name="patientCode"
                label="Patient Code"
                value={formData.patientCode}
                onChange={handleChange}
                required
                placeholder="Enter patient code (e.g., P001)"
              />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group Required
                  </label>
                  <select
                    name="bloodGroupRequired"
                    value={formData.bloodGroupRequired}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
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
                </div>

                <Input
                  type="number"
                  name="unitsRequired"
                  label="Units Required"
                  value={formData.unitsRequired}
                  onChange={handleChange}
                  min="1"
                  required
                  placeholder="Number of units needed"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="HIGH">HIGH - Critical Emergency</option>
                    <option value="MEDIUM">MEDIUM - Urgent</option>
                    <option value="LOW">LOW - Routine</option>
                  </select>
                </div>

                <div></div> {/* Empty div for grid alignment */}
              </div>

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
                  placeholder="Enter area/locality"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Important Information
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Make sure patient code is unique and trackable</li>
                  <li>• Higher urgency levels will prioritize donor matching</li>
                  <li>• Location helps find nearby available donors</li>
                  <li>• You'll be able to track donor responses in real-time</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  loading={loading}
                  disabled={loading}
                >
                  Create Blood Request
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/hospital/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateRequest;
