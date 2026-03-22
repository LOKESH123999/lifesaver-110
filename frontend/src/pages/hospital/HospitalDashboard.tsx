import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { type BloodRequest, type Hospital } from '../../types';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const HospitalDashboard: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitalData();
    fetchBloodRequests();
  }, []);

  const fetchHospitalData = async () => {
    try {
      const response = await api.get('/hospitals/profile');
      setHospital(response.data.data);
    } catch (error) {
      console.error('Failed to fetch hospital profile:', error);
    }
  };

  const fetchBloodRequests = async () => {
    try {
      const response = await api.get('/hospitals/blood-requests');
      setRequests(response.data.data);
    } catch (error) {
      console.error('Failed to fetch blood requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CALLING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FULFILLED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {hospital?.hospitalName || 'Hospital'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your blood requests and track donor responses
          </p>
        </div>

        <div className="mb-6">
          <Link to="/hospital/request/new">
            <Button variant="primary">
              New Blood Request
            </Button>
          </Link>
        </div>

        {requests.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Blood Requests Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first blood request to start finding matching donors.
            </p>
            <Link to="/hospital/request/new">
              <Button variant="primary">
                Create Blood Request
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Link
                key={request._id}
                to={`/hospital/request/${request._id}`}
                className="block"
              >
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Patient: {request.patientCode}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(request.urgencyLevel)}`}>
                          {request.urgencyLevel}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Blood Group</p>
                          <p className="font-medium text-primary-600">{request.bloodGroupRequired}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Units Required</p>
                          <p className="font-medium">{request.unitsRequired}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Location</p>
                          <p className="font-medium">{request.city}, {request.area}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Created</p>
                          <p className="font-medium">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {request.matchedDonors && request.matchedDonors.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{request.matchedDonors.length}</span> donors matched
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
