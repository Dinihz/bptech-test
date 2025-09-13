import React from 'react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-gray-900 flex flex-col items-center justify-center'>
      <div className='w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md text-white'>
        {children}
      </div>
    </div>
  );
}
