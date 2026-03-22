import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { type BloodRequest, type CallLog } from '../../types';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

type TabType = 'YES' | 'NO' | 'NO_RESPONSE';

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('NO_RESPONSE');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  useEffect(() => {
    // Auto-refresh every 15 seconds if status is CALLING
    const interval = setInterval(() => {
      if (request?.status === 'CALLING') {
        fetchRequestDetails();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [request?.status]);

  const fetchRequestDetails = async () => {
    try {
      const response = await api.get(`/hospitals/requests/${id}`);
      setRequest(response.data.data);
      
      // Fetch call logs if they exist
      if (response.data.data.callLogIds && response.data.data.callLogIds.length > 0) {
        const callLogsResponse = await api.get(`/hospitals/requests/${id}/call-logs`);
        setCallLogs(callLogsResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch request details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (status: 'FULFILLED' | 'CLOSED') => {
    if (!request) return;
    
    setUpdating(true);
    try {
      await api.patch(`/hospitals/requests/${request._id}/status`, { status });
      setRequest(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Failed to update request status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const matchDonors = async () => {
    if (!request) return;
    
    setUpdating(true);
    try {
      const response = await api.post(`/hospitals/requests/${request._id}/match-donors`, {
        autoCreateCallLogs: true
      });
      
      if (response.data.success) {
        setRequest(prev => prev ? { 
          ...prev, 
          status: 'CALLING',
          matchedDonors: response.data.data.matchedDonors,
          callLogIds: response.data.data.callLogIds
        } : null);
        
        // Fetch call logs
        const callLogsResponse = await api.get(`/hospitals/requests/${request._id}/call-logs`);
        setCallLogs(callLogsResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to match donors:', error);
    } finally {
      setUpdating(false);
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

  const getDonorsByResponse = (response: TabType) => {
    if (!request?.matchedDonors) return [];
    
    return request.matchedDonors.filter(donor => {
      const callLog = callLogs.find(log => log.donorId === donor.donorId);
      if (!callLog) return response === 'NO_RESPONSE';
      return callLog.response === response;
    });
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

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Blood Request Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              The requested blood request could not be found.
            </p>
            <Button onClick={() => navigate('/hospital/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const shortlistedDonors = getDonorsByResponse('YES');
  const declinedDonors = getDonorsByResponse('NO');
  const noResponseDonors = getDonorsByResponse('NO_RESPONSE');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Request Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Patient: {request.patientCode}
                </h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getUrgencyColor(request.urgencyLevel)}`}>
                  {request.urgencyLevel}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Blood Group</p>
                  <p className="font-medium text-primary-600 text-lg">{request.bloodGroupRequired}</p>
                </div>
                <div>
                  <p className="text-gray-500">Units Required</p>
                  <p className="font-medium text-lg">{request.unitsRequired}</p>
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium">{request.city}, {request.area}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">
                    {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {request.status === 'PENDING' && (
                <Button
                  onClick={matchDonors}
                  loading={updating}
                  disabled={updating}
                >
                  Start Calling Donors
                </Button>
              )}
              
              {(request.status === 'CALLING' || request.status === 'PENDING') && (
                <Button
                  variant="danger"
                  onClick={() => updateRequestStatus('CLOSED')}
                  loading={updating}
                  disabled={updating}
                >
                  Close Request
                </Button>
              )}
              
              {request.status === 'CALLING' && shortlistedDonors.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => updateRequestStatus('FULFILLED')}
                  loading={updating}
                  disabled={updating}
                >
                  Mark as Fulfilled
                </Button>
              )}
            </div>
          </div>
          
          {request.status === 'CALLING' && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
              <p className="text-sm text-purple-700">
                <strong>Auto-refresh enabled:</strong> This page will automatically refresh every 15 seconds to show real-time donor responses.
              </p>
            </div>
          )}
        </Card>

        {/* Donor Response Tabs */}
        <Card className="p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {(['NO_RESPONSE', 'YES', 'NO'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'YES' && `Shortlisted (${shortlistedDonors.length})`}
                  {tab === 'NO' && `Declined (${declinedDonors.length})`}
                  {tab === 'NO_RESPONSE' && `No Response (${noResponseDonors.length})`}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            {activeTab === 'YES' && shortlistedDonors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No donors have accepted the request yet.
              </div>
            )}
            
            {activeTab === 'NO' && declinedDonors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No donors have declined the request yet.
              </div>
            )}
            
            {activeTab === 'NO_RESPONSE' && noResponseDonors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                All donors have responded.
              </div>
            )}

            {/* Donor Cards */}
            {activeTab === 'YES' && shortlistedDonors.map((donor) => (
              <Card key={donor.donorId} className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="grid md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium">{donor.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Blood Group</p>
                        <p className="font-medium text-primary-600">{donor.bloodGroup}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Area</p>
                        <p className="font-medium">{donor.area}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{donor.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Donation</p>
                        <p className="font-medium">
                          {donor.lastDonationDate 
                            ? new Date(donor.lastDonationDate).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Accepted
                    </span>
                  </div>
                </div>
              </Card>
            ))}

            {activeTab === 'NO' && declinedDonors.map((donor) => (
              <Card key={donor.donorId} className="p-4 bg-red-50 border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="grid md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium">{donor.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Blood Group</p>
                        <p className="font-medium text-primary-600">{donor.bloodGroup}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Area</p>
                        <p className="font-medium">{donor.area}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{donor.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Donation</p>
                        <p className="font-medium">
                          {donor.lastDonationDate 
                            ? new Date(donor.lastDonationDate).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Declined
                    </span>
                  </div>
                </div>
              </Card>
            ))}

            {activeTab === 'NO_RESPONSE' && noResponseDonors.map((donor) => (
              <Card key={donor.donorId} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="grid md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium">{donor.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Blood Group</p>
                        <p className="font-medium text-primary-600">{donor.bloodGroup}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Area</p>
                        <p className="font-medium">{donor.area}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{donor.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Donation</p>
                        <p className="font-medium">
                          {donor.lastDonationDate 
                            ? new Date(donor.lastDonationDate).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      No Response
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RequestDetail;
