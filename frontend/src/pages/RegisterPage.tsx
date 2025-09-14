import { useState} from 'react'
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { AxiosError } from 'axios';
import { AuthLayout } from '../layouts/AuthLayout';
import { toast } from 'react-hot-toast';

const EyeIcon = ({ closed }: { closed: boolean }) => (
  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
    {closed ? (
      <path strokeLinecap='round' strokeLinejoin='round' d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88' />
    ) : (
      <path strokeLinecap='round' strokeLinejoin='round' d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z' />
    )}
    <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
  </svg>
);

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if(!name || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await toast.promise(
        api.post('/users', { name, email, password }),
        {
          loading: 'Criando conta...',
          success: 'Cadastro realizado com sucesso! Faça o login para continuar.',
          error: (err) => {
            const axiosError = err as AxiosError<{ message?: string } | undefined>;
            const message = axiosError?.response?.data?.message;
            return message || 'Não foi possível criar a conta. Tente novamente.';
          },
        }
      );

      navigate('/login');

    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      if (axiosError.response && axiosError.response.status === 409) {
        setError(axiosError.response.data?.message || 'E-mail já cadastrado.');
      } else {
        setError('Ocorreu um erro ao tentar cadastrar. Tente novamente.');
      }
      console.error('Erro de cadastro:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className='w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md text-white'>
        <h1 className='text-2xl font-bold text-center mb-6'>Criar Conta</h1>

        <form onSubmit={handleRegister} className='flex flex-col gap-4'>
          <input
            type='text'
            placeholder='Nome Completo'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400'
          />

          <input
            type='email'
            placeholder='E-mail'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400'
          />

          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Senha (mínimo 8 caracteres)'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400'
            />
            <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400'>
              <EyeIcon closed={showPassword} />
            </button>
          </div>


          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Confirme a senha'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400'
            />
          </div>

          {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

          <button
          type='submit'
          disabled={isLoading}
          className='p-3 bg-sky-600 rounded font-bold hover:bg-sky-500 disabled:bg-gray-500'
          >
            {isLoading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-400 mt-4'>
          Já tem uma conta?{' '}
          <Link to='/login' className='text-sky-400 hover:underline'>
            Faça o login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
