import React from 'react';
import LoginForm from '../../components/ui/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <LoginForm />
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block w-1/2 bg-blue-600">
        <div className="h-full w-full bg-cover bg-center" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80")',
          backgroundBlendMode: 'overlay',
        }}>
          <div className="h-full w-full bg-blue-600 bg-opacity-50 flex items-center justify-center p-12">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>
              <p className="text-xl">Sign in to continue your journey with us.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}