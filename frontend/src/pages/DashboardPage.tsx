import { useEffect, useState} from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Modal from 'react-modal'
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

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
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
};

export function DashboardPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({ date: '', startTime: '', endTime: '', roomId: ''});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);

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
    setIsEditing(false);
    setFormData({ date: '', startTime: '', endTime: '', roomId: '' })
    setIsFormModalOpen(true);
  };

  const openEditModal = (reservation: Reservation) => {
    setIsEditing(true);
    const formatForInputl = (dateStr: string) => new Date(dateStr).toISOString().slice(0, 16);

    setFormData({
      id: reservation.id,
      roomId: reservation.roomId,
      date: new Date(reservation.date).toISOString().slice(0, 10),
      startTime: formatForInputl(reservation.startTime),
      endTime: formatForInputl(reservation.endTime),
    });
    setIsFormModalOpen(true);
  }

  const closeFormModal = () => setIsFormModalOpen(false);

  const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const { id } = formData;
    const payload = {
      roomId: formData.roomId,
      date: new Date(formData.date).toISOString(),
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };
    const request = isEditing
      ? api.patch(`/reservations/${id}`, payload)
      : api.post('/reservations', payload);
    try {
      await toast.promise(request, {
        loading: 'Salvando...',
        success: `Reserva ${isEditing ? 'atualizada' : 'criada'} com sucesso!`,
        error: (err) => {
          const axiosError = err as AxiosError<{ message: string | string[] }>;
          const message = Array.isArray(axiosError.response?.data.message)
            ? axiosError.response?.data.message.join(', ')
            : axiosError.response?.data.message;
          return `Erro: ${message || 'Tente novamente.'}`;
        },
      });
      closeFormModal();
      fetchReservations();
    } catch (_err) {}
  }

  const openDeleteModal = (id: string) => {
    setReservationToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setReservationToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    const request = api.delete(`/reservations/${reservationToDelete}`);
    try {
      await toast.promise(request, {
        loading: 'Cancelando...',
        success: 'Reserva cancelada com sucesso!',
        error: 'Não foi possível cancelar a reserva.',
      });
      fetchReservations();
    } catch (_err) {
    } finally {
      closeDeleteModal();
    }
  }

  if (isLoading) {
    return <p className='text-center text-white'>Carregando reservas...</p>;
  }

  if (error) {
    return <p className='text-center text-red-500'>{error}</p>;
  }

  return (
    <div className='text-white'>
      <div className="flex justify-between items-center mb-4">
      <h1 className='text-3xl font-bold'>Dashboard de Reservas</h1>
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
                        <button onClick={() =>openEditModal(res)} className='text-yellow-400 hover:underline'>Editar</button>
                        <button onClick={() => openDeleteModal(res.id)} className='text-red-500 hover:underline'>Cancelar</button>
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
        isOpen={isFormModalOpen}
        onRequestClose={closeFormModal}
        contentLabel='Formulário de Reserva'
        className='bg-gray-800 rounded-lg shadow-md p-8 text-white w-full max-w-lg mx-auto mt-20 outline-none'
        overlayClassName='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start pt-10'
      >
        <h2 className='text-2xl font-bold mb-6'>{isEditing ? 'Editar Reserva' : 'Criar Nova Reserva'}</h2>
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
            <button type='button' onClick={closeFormModal} className='bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded'>
              Cancelar
            </button>
            <button type='submit' className='bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded'>
              Salvar
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel='Confirmar Cancelamento'
        className='bg-gray-800 rounded-lg shadow-md p-8 text-white w-full max-w-md mx-auto mt-20 outline-none'
        overlayClassName='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start pt-10'
      >
        <h2 className='text-2xl font-bold mb-4'>Confirmar Cancelamento</h2>
        <p className='text-gray-300 mb-8'>Tem certeza que deseja cancelar esta reserva?</p>
        <div className='flex justify-end gap-4'>
          <button onClick={closeDeleteModal} className='bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded'>
            Voltar
          </button>
          <button onClick={confirmDelete} className='bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded'>
            Sim, Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}
