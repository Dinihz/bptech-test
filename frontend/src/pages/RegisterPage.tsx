import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '../layouts/AuthLayout';
import { registerSchema } from '../schemas/authSchema';
import type { RegisterFormData } from '../schemas/authSchema';
import api from '../services/api';
import { AxiosError } from 'axios';
import { PasswordInput } from '../components/PasswordInput';

const registerUser = async (data: RegisterFormData) => {
  const { name, email, password } = data;
  const response = await api.post('/users', { name, email, password });
  return response.data;
};

export function RegisterPage() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Cadastro realizado com sucesso! Faça o login.');
      navigate('/login');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.data?.message) {
        toast.error(axiosError.response.data.message);
      } else {
        toast.error('Não foi possível realizar o cadastro. Tente novamente.');
      }
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    mutation.mutate(data);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-md text-white">
        <h1 className="text-4xl font-bold text-center mb-12">Criar Conta</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Nome Completo"
              {...register('name')}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

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
            <PasswordInput
              placeholder="Senha"
              register={register('password')}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <PasswordInput
              placeholder="Confirme a Senha"
              register={register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="p-3 bg-sky-600 rounded font-bold hover:bg-sky-500 disabled:bg-gray-500"
          >
            {mutation.isPending ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-sky-400 hover:underline">
            Faça o login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
