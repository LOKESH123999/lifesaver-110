import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { type Hospital } from '../../types';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';

const ManageHospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/admin/hospitals');
      setHospitals(response.data.data);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveHospital = async (hospitalId: string) => {
    setUpdating(hospitalId);
    try {
      await api.patch(`/admin/hospitals/${hospitalId}/verify`);
      setHospitals(prev => 
        prev.map(h => h._id === hospitalId ? { ...h, isVerified: true } : h)
      );
    } catch (error) {
      console.error('Failed to approve hospital:', error);
    } finally {
      setUpdating(null);
    }
  };

  const revokeHospital = async (hospitalId: string) => {
    setUpdating(hospitalId);
    try {
      await api.patch(`/admin/hospitals/${hospitalId}/revoke`);
      setHospitals(prev => 
        prev.map(h => h._id === hospitalId ? { ...h, isVerified: false } : h)
      );
    } catch (error) {
      console.error('Failed to revoke hospital:', error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Manage Hospitals
          </h1>
          <p className="text-gray-600 mt-2">
            Approve or revoke hospital registrations
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 mb-6">
          <Input
            name="search"
            placeholder="Search by hospital name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-0"
          />
        </Card>

        {/* Hospitals Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Official Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHospitals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No hospitals found matching your search.' : 'No hospitals registered yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredHospitals.map((hospital) => (
                    <tr key={hospital._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {hospital.hospitalName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hospital.area}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {hospital.officialEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {hospital.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {hospital.contactNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          hospital.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {hospital.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(hospital.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {hospital.isVerified ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => revokeHospital(hospital._id)}
                            loading={updating === hospital._id}
                            disabled={updating !== null}
                          >
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            onClick={() => approveHospital(hospital._id)}
                            loading={updating === hospital._id}
                            disabled={updating !== null}
                          >
                            Approve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Total Hospitals</div>
            <div className="text-2xl font-bold text-gray-900">{hospitals.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Verified</div>
            <div className="text-2xl font-bold text-green-600">
              {hospitals.filter(h => h.isVerified).length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Pending Approval</div>
            <div className="text-2xl font-bold text-yellow-600">
              {hospitals.filter(h => !h.isVerified).length}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageHospitals;
