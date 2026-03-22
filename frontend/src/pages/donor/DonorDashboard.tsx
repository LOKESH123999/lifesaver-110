import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { type Donor } from '../../types';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const DonorDashboard: React.FC = () => {
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDonorProfile();
  }, []);

  const fetchDonorProfile = async () => {
    try {
      const response = await api.get('/donors/profile');
      setDonor(response.data.data);
    } catch (error) {
      console.error('Failed to fetch donor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEligibility = async (isEligible: boolean) => {
    if (!donor) return;
    
    setUpdating(true);
    try {
      await api.patch('/donors/eligibility', { isEligible });
      setDonor(prev => prev ? { ...prev, isEligible } : null);
    } catch (error) {
      console.error('Failed to update eligibility:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updateConsent = async (consentToCalls: boolean) => {
    if (!donor) return;
    
    setUpdating(true);
    try {
      await api.patch('/donors/consent', { consentToCalls });
      setDonor(prev => prev ? { ...prev, consentToCalls } : null);
    } catch (error) {
      console.error('Failed to update consent:', error);
    } finally {
      setUpdating(false);
    }
  };

  const isEligibleBasedOnLastDonation = (): boolean => {
    if (!donor?.lastDonationDate) return true;
    
    const lastDonation = new Date(donor.lastDonationDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 90;
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
            Welcome, {donor?.fullName || 'Donor'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your blood donation profile and availability
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <Card className="md:col-span-2 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Profile
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{donor?.fullName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium text-primary-600">{donor?.bloodGroup}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{donor?.city}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="font-medium">{donor?.area}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{donor?.phoneNumber}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Last Donation</p>
                <p className="font-medium">
                  {donor?.lastDonationDate 
                    ? new Date(donor.lastDonationDate).toLocaleDateString()
                    : 'Never donated'
                  }
                </p>
              </div>
              
              {donor?.donorType === 'student' && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">College</p>
                    <p className="font-medium">{donor?.collegeName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-medium">{donor?.studentId}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Status Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Eligibility Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  isEligibleBasedOnLastDonation()
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isEligibleBasedOnLastDonation() ? 'Eligible' : 'Not Eligible'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  donor?.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {donor?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Availability Settings
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Available to Donate</h3>
                <p className="text-sm text-gray-500">
                  Toggle your availability for blood donation
                </p>
              </div>
              
              <button
                onClick={() => updateEligibility(!donor?.isEligible)}
                disabled={updating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  donor?.isEligible ? 'bg-primary-600' : 'bg-gray-200'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    donor?.isEligible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Receive Emergency Calls</h3>
                <p className="text-sm text-gray-500">
                  Get automated calls for emergency blood requests
                </p>
              </div>
              
              <button
                onClick={() => updateConsent(!donor?.consentToCalls)}
                disabled={updating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  donor?.consentToCalls ? 'bg-primary-600' : 'bg-gray-200'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    donor?.consentToCalls ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {updating && (
            <div className="mt-4 text-sm text-gray-500">
              Updating your settings...
            </div>
          )}
        </Card>

        {/* Information Card */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Important Information
          </h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Eligibility:</strong> You must wait at least 90 days between blood donations.
            </p>
            <p>
              <strong>Emergency Calls:</strong> When a hospital requests your blood group, you'll receive an automated call.
            </p>
            <p>
              <strong>Response:</strong> You can respond to calls with YES (available), NO (unavailable), or ignore for no response.
            </p>
            <p>
              <strong>Availability:</strong> Keep your availability status updated to help us match donors efficiently.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DonorDashboard;
