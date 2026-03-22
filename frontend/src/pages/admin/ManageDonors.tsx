import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { type Donor } from '../../types';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const ManageDonors: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await api.get('/admin/donors');
      setDonors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDonorStatus = async (donorId: string, currentStatus: boolean) => {
    setUpdating(donorId);
    try {
      await api.patch(`/admin/donors/${donorId}/status`, { isActive: !currentStatus });
      setDonors(prev => 
        prev.map(d => d._id === donorId ? { ...d, isActive: !currentStatus } : d)
      );
    } catch (error) {
      console.error('Failed to update donor status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getUniqueCities = () => {
    const cities = [...new Set(donors.map(donor => donor.city))];
    return cities.sort();
  };

  const filteredDonors = donors.filter(donor => {
    const matchesBloodGroup = !bloodGroupFilter || donor.bloodGroup === bloodGroupFilter;
    const matchesCity = !cityFilter || donor.city === cityFilter;
    return matchesBloodGroup && matchesCity;
  });

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
            Manage Donors
          </h1>
          <p className="text-gray-600 mt-2">
            Activate or deactivate donor accounts
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Blood Group
              </label>
              <select
                value={bloodGroupFilter}
                onChange={(e) => setBloodGroupFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Blood Groups</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by City
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Cities</option>
                {getUniqueCities().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Donors Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Donation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {bloodGroupFilter || cityFilter ? 'No donors found matching your filters.' : 'No donors registered yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredDonors.map((donor) => (
                    <tr key={donor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {donor.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donor.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donor.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                          {donor.bloodGroup}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {donor.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donor.area}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {donor.donorType}
                        </div>
                        {donor.donorType === 'student' && (
                          <div className="text-sm text-gray-500">
                            {donor.collegeName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          donor.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {donor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donor.lastDonationDate 
                          ? new Date(donor.lastDonationDate).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant={donor.isActive ? 'danger' : 'primary'}
                          size="sm"
                          onClick={() => toggleDonorStatus(donor._id, donor.isActive)}
                          loading={updating === donor._id}
                          disabled={updating !== null}
                        >
                          {donor.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Total Donors</div>
            <div className="text-2xl font-bold text-gray-900">{donors.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {donors.filter(d => d.isActive).length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Inactive</div>
            <div className="text-2xl font-bold text-red-600">
              {donors.filter(d => !d.isActive).length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Eligible</div>
            <div className="text-2xl font-bold text-primary-600">
              {donors.filter(d => d.isEligible).length}
            </div>
          </Card>
        </div>

        {/* Blood Group Distribution */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Blood Group Distribution</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {bloodGroups.map(group => {
              const count = donors.filter(d => d.bloodGroup === group).length;
              const percentage = donors.length > 0 ? (count / donors.length) * 100 : 0;
              return (
                <div key={group} className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{count}</div>
                  <div className="text-sm text-gray-500">{group}</div>
                  <div className="text-xs text-gray-400">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManageDonors;
