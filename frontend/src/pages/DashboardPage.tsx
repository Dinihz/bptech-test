import { useEffect, useState} from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Modal from 'react-modal'
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AxiosError } from 'axios';

Modal.setAppElement('#root')

type Reservation = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type FormData = {
  date: string; startTime: string; endTime: string; roomId: string;
};

export function DashboardPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({ date: '', startTime: '', endTime: '', roomId: ''});

  const fetchReservations = () => {
    setIsLoading(true);
    api.get('/reservations')
    .then(response => setReservations(response.data))
    .catch(err => {
      console.error('Erro ao buscar reservas: ', err);
      setError('Não foi possível carregar as reservas.');
    })
    .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const openCreateModal = () => {
    setFormData({ date: '', startTime: '', endTime: '', roomId: '' })
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/reservations', {
        ...formData,
        date: new Date(formData.date).toISOString(),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      });
      alert('Reserva criada com sucesso!');
      closeModal();
      fetchReservations();
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string | string[] }>;
      const message = Array.isArray(axiosError.response?.data.message)
      ? axiosError.response?.data.message.join(',')
      : axiosError.response?.data.message;
      alert(`Erro ao criar a reserva: ${message || 'Verifique os dados e tente novamente.'}`);
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        await api.delete(`/reservations/${id}`);
        alert('Reserva cancelada com sucesso!')
        fetchReservations();
      } catch (err) {
        alert('Erro ao cancelar a reserva. Tente novamente.');
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return <p className='text-center text-white'>Carregando reservas...</p>;
  }

  if (error) {
    return <p className='text-center text-red-500'>{error}</p>;
  }

  return (
    <div className='text-white'>
      <div className="flex justify-between items-center mb-4">
      <h1 className='text-3xl font-bold mb-6'>Dashboard de Reservas</h1>
      <button
        onClick={openCreateModal}
        className='bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded'
      >
        Nova Reserva
      </button>
      </div>

      <div className='bg-gray-800 p-6 rounded-lg shadow-md'>
        <h2 className='text-xl mb-4'>Todas as Reservas</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead>
              <tr className='border-b border-gray-700'>
                <th className='text-left p-3'>Sala</th>
                <th className='text-left p-3'>Data</th>
                <th className='text-left p-3'>Horário</th>
                <th className='text-left p-3'>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length > 0 ? (
                reservations.map(res => (
                  <tr key={res.id} className='border-b border-gray-700 hover:bg-gray-700'>
                    <td className='p-3'>{res.roomId}</td>
                    <td className='p-3'>{new Date(res.date).toLocaleDateString('pt-BR')}</td>
                    <td className='p-3'>
                      {new Date(res.startTime).toLocaleTimeString()} - {new Date(res.endTime).toLocaleTimeString()}
                    </td>
                    <td className='p-3'>{res.user.name} ({res.user.email})</td>
                    <td className='p-3'>
                    {user?.userId === res.user.id && (
                      <div className='flex gap-2'>
                        <button className='text-yellow-400 hover:underline'>Editar</button>
                        <button onClick={() => handleDelete(res.id)} className='text-red-500 hover:underline'>Cancelar</button>
                      </div>
                    )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className='text-center p-3'>Nenhuma reserva encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel='Formulário de Reserva'
        className='bg-gray-800 rounded-lg shadow-md p-8 text-white w-full max-w-lg mx-auto mt-20 outline-none'
        overlayClassName='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start pt-10'
      >
        <h2 className='text-2xl font-bold mb-6'>Nova Reserva</h2>
        <form onSubmit={handleFormSubmit} className='flex flex-col gap-4'>
          <div>
            <label htmlFor="roomId" className='block text-sm font-medium text-white mb-1'>
              Qual o nome da sala?
            </label>
          <input type='text' name='roomId' value={formData.roomId} onChange={handleFormChange} placeholder='Nome da Sala' className='p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400' />
          </div>


          <div>
          <label htmlFor="date" className='block text-sm font-medium text-white mb-1'>
            Qual a Data da Reserva?
          </label>
          <input type='date' name='date' value={formData.date} onChange={handleFormChange} className='p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400' />
          </div>

          <div>
          <label htmlFor="startTime" className='block text-sm font-medium text-white mb-1'>
            Horário de Início:
          </label>
          <input type='datetime-local' name='startTime' value={formData.startTime} onChange={handleFormChange} className='p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400' />
          </div>


          <div>
          <label htmlFor="endTime" className='block text-sm font-medium text-white mb-1'>
            Horário de Término:
          </label>
          <input type='datetime-local' name='endTime' value={formData.endTime} onChange={handleFormChange} className='p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400' />
          </div>

          <div className='flex justify-end gap-4 mt-6'>
            <button type='button' onClick={closeModal} className='bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded'>
              Cancelar
            </button>
            <button type='submit' className='bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded'>
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
