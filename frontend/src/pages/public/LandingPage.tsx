import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Save Lives. Donate Blood.
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            LifeSaver 110 connects blood donors with hospitals in emergency situations. 
            Join our mission to save lives through the power of community donation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              as="a" 
              href="/register/donor"
              variant="secondary" 
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              Register as Donor
            </Button>
            <Button 
              as="a" 
              href="/login"
              variant="primary"
            >
              Hospital Login
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Donor Registers</h3>
              <p className="text-gray-600">
                Blood donors register with their details, blood group, and consent to receive emergency calls.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Hospital Requests Blood</h3>
              <p className="text-gray-600">
                Hospitals create blood requests with patient details and urgency level when blood is needed.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Donor Gets Called on 110</h3>
              <p className="text-gray-600">
                Matching donors receive automated calls and can respond to save lives in critical situations.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose LifeSaver 110?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">24/7 Available</h3>
              <p className="text-gray-600 text-sm">Emergency blood matching anytime, anywhere</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Verified Donors</h3>
              <p className="text-gray-600 text-sm">All donors are verified and eligible</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Instant Calls</h3>
              <p className="text-gray-600 text-sm">Automated calls to matching donors</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Save Lives</h3>
              <p className="text-gray-600 text-sm">Make a real difference in emergencies</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Save Lives?
          </h2>
          <p className="text-xl mb-8">
            Join our community of life-saving heroes today.
          </p>
          <Link to="/register/donor">
            <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
              Register as Donor Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
