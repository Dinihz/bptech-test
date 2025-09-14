import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema } from '../schemas/authSchema';
import type { LoginFormData } from '../schemas/authSchema';
import api from '../services/api';

const loginUser = async (data: LoginFormData) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const { access_token } = data;
      login(access_token);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('E-mail ou senha inválidos.');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md text-white">
        <h1 className="text-4xl font-bold text-center mb-12">Login</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <input
              type="email"
              placeholder="E-mail"
              {...register('email')}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Senha"
              {...register('password')}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="p-3 bg-sky-600 rounded font-bold hover:bg-sky-500 disabled:bg-gray-500"
          >
            {mutation.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-sky-400 hover:underline">
            Crie uma agora
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
