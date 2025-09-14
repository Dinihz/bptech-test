import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setIsOpen(false);
    navigate('/login');
  }

  return (
    <nav className='bg-gray-800 text-white shadow-md'>
      <div className='max-w-9xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex-shrink-0'>
            <Link to='/' className='text-2xl font-bold text-white'>
              AgendFácil
            </Link>
          </div>

          <div className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-4'>
              {isAuthenticated ? (
                <>
              <Link to='/dashboard' className='hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium'>
                Dashboard
              </Link>
              <button onClick={handleLogout} className='hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium'>
                Logout
              </button>
                </>
              ) : (
                <>
              <Link to='/login' className='hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium'>
                Login
              </Link>
              <Link to='/register' className='hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium'>
                Cadastro
              </Link>
                </>
              )}
            </div>
          </div>

          <div className='-mr-2 flex md:hidden'>
            <button
              onClick={() => setIsOpen(!isOpen)}
              type='button'
              className='bg-gray-900 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
              aria-controls='mobile-menu'
              aria-expanded='false'
            >
              <span className='sr-only'>Open main menu</span>
              {!isOpen ? (
                <svg className='block h-6 w-6' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16' />
                </svg>
              ) : (
                <svg className='block h-6 w-6' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='md:hidden' id='mobile-menu'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
              {isAuthenticated ? (
                <>
              <Link to='/dashboard' className='hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium'>
                Dashboard
              </Link>
              <button onClick={handleLogout} className='w-full text-left hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium'>
                Logout
              </button>
                </>
              ) : (
                <>
              <Link to='/login' className='hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium'>
                Login
              </Link>
              <Link to='/register' className='hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium'>
                Cadastro
              </Link>
                </>
              )}
          </div>
        </div>
      )}
    </nav>
  );
}
