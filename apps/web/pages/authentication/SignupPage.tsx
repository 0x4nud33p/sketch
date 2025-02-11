import React from 'react';
import SignupForm from '../../components/ui/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <SignupForm />
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block w-1/2 bg-blue-600">
        <div className="h-full w-full bg-cover bg-center" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80")',
          backgroundBlendMode: 'overlay',
        }}>
          <div className="h-full w-full bg-blue-600 bg-opacity-50 flex items-center justify-center p-12">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
              <p className="text-xl">Discover amazing features and connect with people around the world.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}