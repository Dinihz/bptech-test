import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail ] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password})
      const { access_token } = response.data

      login(access_token);
      navigate('/dashboard');

    } catch (err) {
      setError('E-mail ou senha inválidos.');
      console.error('Erro de login: ', err)
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className='w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>Login</h1>

        <form onSubmit={handleLogin} className='flex flex-col gap-4'>
          <input
          type='email'
          placeholder='E-mail'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400'
          />
          <input
          type='password'
          placeholder='Senha'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400'
          />

          {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

          <button
          type='submit'
          disabled={isLoading}
          className='p-3 bg-sky-600 rounded font-bold hover:bg-sky-500 disabled:bg-gray-500'
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
