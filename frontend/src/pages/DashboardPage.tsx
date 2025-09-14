import React, { useReducer } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../contexts/AuthContext';
import { useReservations } from '../hooks/useReservations';
import { ReservationFormModal } from '../components/ReservationFormModal';
import type { Reservation } from '../types/reservation';
import type { ReservationFormData } from '../schemas/reservationSchema';

type ReservationFilters = { roomId: string; userName: string; date: string };


type ModalState = {
  viewMode: 'all' | 'mine';
  filters: ReservationFilters;
  appliedFilters: ReservationFilters
  isFormOpen: boolean;
  isDeleteOpen: boolean;
  isEditing: boolean;
  selectedReservation: Partial<Reservation> | null;
};
type ModalAction =
  | { type: 'SET_VIEW_MODE'; payload: 'all' | 'mine' }
  | { type: 'SET_FILTER'; payload: { name: keyof ReservationFilters; value: string } }
  | { type: 'APPLY_FILTER' }
  | { type: 'OPEN_CREATE' }
  | { type: 'OPEN_EDIT'; payload: Reservation }
  | { type: 'OPEN_DELETE'; payload: string }
  | { type: 'CLOSE' };

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'SET_VIEW_MODE': return { ...state, viewMode: action.payload, appliedFilters: { roomId: '', userName: '', date: '' } };
    case 'SET_FILTER': return { ...state, filters: { ...state.filters, [action.payload.name]: action.payload.value } };
    case 'APPLY_FILTER': return { ...state, viewMode: 'all', appliedFilters: state.filters };
    case 'OPEN_CREATE': return { ...state, isFormOpen: true, isEditing: false, selectedReservation: {} };
    case 'OPEN_EDIT': return { ...state, isFormOpen: true, isEditing: true, selectedReservation: action.payload };
    case 'OPEN_DELETE': return { ...state, isDeleteOpen: true, selectedReservation: { id: action.payload } };
    case 'CLOSE': return { viewMode: state.viewMode, filters: state.filters, appliedFilters: state.appliedFilters, isFormOpen: false, isDeleteOpen: false, isEditing: false, selectedReservation: null };
    default: return state;
  }
};

export function DashboardPage() {
  const { user } = useAuth();
  const [modalState, dispatch] = useReducer(modalReducer, {
    viewMode: 'all',
    filters: { roomId: '', userName: '', date: '' },
    appliedFilters: { roomId: '', userName: '', date: ''},
    isFormOpen: false,
    isDeleteOpen: false,
    isEditing: false,
    selectedReservation: null
  });

  const { reservations, isLoading, isError, createReservation, updateReservation, deleteReservation, isCreating, isUpdating, isDeleting } = useReservations(modalState.viewMode, modalState.appliedFilters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FILTER', payload: { name: e.target.name as keyof ReservationFilters, value: e.target.value }});
  };

  const onSubmit = (data: ReservationFormData) => {
    const dataToSend = {
      ...data,
      date: data.date,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
    };

    if (modalState.isEditing) {
      updateReservation(
        { id: modalState.selectedReservation!.id!, data: dataToSend },
        { onSuccess: () => dispatch({ type: 'CLOSE' }) }
      );
    } else {
      createReservation(
        dataToSend,
        { onSuccess: () => dispatch({ type: 'CLOSE' }) }
      );
    }
  };

  const confirmDelete = () => {
    deleteReservation(modalState.selectedReservation!.id!, {
      onSuccess: () => {
        dispatch({ type: 'CLOSE' });
      },
    });
  };

  const formatForInput = (dateStr: string) => new Date(dateStr).toISOString().slice(0, 16);

  if (isLoading) return <p className="text-center text-white">Carregando...</p>;
  if (isError) return <p className="text-center text-red-500">Erro ao carregar reservas.</p>;

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard de Reservas</h1>
      <div className='mb-4 flex gap-2'>
        <button
        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'all' })}
        className={`px-4 py-2 rounded ${modalState.viewMode === 'all' ? 'bg-sky-400' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Todas
        </button>
        <button
        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'mine' })}
        className={`px-4 py-2 rounded ${modalState.viewMode === 'mine' ? 'bg-sky-400' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Minhas Reservas
        </button>
        <button onClick={() => dispatch({ type: 'OPEN_CREATE' })} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded">
          Nova Reserva
        </button>
      </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3">Sala</th> <th className="text-left p-3">Data</th> <th className="text-left p-3">Horário</th> <th className="text-left p-3">Responsável</th> <th className="text-left p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservations?.map(res => (
                <tr key={res.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-3">{res.roomId}</td>
                  <td className="p-3">{typeof (res as any).date === 'string' ? (res as any).date.split('-').reverse().join('/') : new Date((res as any).date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">
                    {new Date(res.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(res.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3">{res.user.name}</td>
                  <td className="p-3">
                    {user?.userId === res.user.id && (
                      <div className="flex gap-2">
                        <button onClick={() => dispatch({ type: 'OPEN_EDIT', payload: res })} className="text-yellow-400 hover:underline text-sm">Editar</button>
                        <button onClick={() => dispatch({ type: 'OPEN_DELETE', payload: res.id })} className="text-red-500 hover:underline text-sm">Cancelar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

      <div className=''>
        {modalState.viewMode === 'all' && (
          <div className='flex flex-col md:flex-row flex-wrap gap-4 mb-6 bg-gray-800 p-4 rounded-lg'>
            <div className='flex-1 min-w-[200px]'>
              <label htmlFor="filterRoomId">Filtrar por Sala</label>
              <input
              type="text"
              id='filterRoomId'
              name='roomId'
              value={modalState.filters.roomId}
              onChange={handleFilterChange}
              className='w-full p-2 bg-gray-700 rounded border border-x-gray-600'
              />
            </div>

            <div className="flex-1 min-w-[200px]">
            <label htmlFor="filterUserName" >Filtrar por Nome do Usuário</label>
            <input
              type="text"
              id="filterUserName"
              name="userName"
              value={modalState.filters.userName}
              onChange={handleFilterChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            />
            </div>

            <div className='flex-1 min-w-[200pc]:'>
              <label htmlFor='filterDate'>Filtrar por Data</label>
              <input
               type="date"
               name="date"
               value={modalState.filters.date}
               onChange={handleFilterChange}
               className='w-full p-2 bg-gray-700 rounded border border-gray-600'
               />
            </div>
            <div className='flex w-full'>
              <button
                onClick={() => dispatch({ type: 'APPLY_FILTER' })}
                className='bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded h-10'
              >
                Filtrar
              </button>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>


      <ReservationFormModal
        isOpen={modalState.isFormOpen}
        isEditing={modalState.isEditing}
        initialData={{
          ...modalState.selectedReservation,
          date: modalState.selectedReservation?.date ? new Date(modalState.selectedReservation.date).toISOString().slice(0, 10) : '',
          startTime: modalState.selectedReservation?.startTime ? formatForInput(modalState.selectedReservation.startTime) : '',
          endTime: modalState.selectedReservation?.endTime ? formatForInput(modalState.selectedReservation.endTime) : '',
        }}
        onClose={() => dispatch({ type: 'CLOSE' })}
        onSubmit={onSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <Modal isOpen={modalState.isDeleteOpen} onRequestClose={() => dispatch({ type: 'CLOSE' })}
      className='bg-gray-800 rounded-lg shadow-md p-8 text-white w-full max-w-md mx-auto mt-20 outline-none'
      overlayClassName='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start pt-10'
      >
        <h2 className="text-2xl font-bold mb-4">Confirmar Cancelamento</h2>
        <p className="text-gray-300 mb-8">Tem certeza que deseja cancelar esta reserva?</p>
        <div className="flex justify-end gap-4">
          <button onClick={() => dispatch({ type: 'CLOSE' })} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Voltar</button>
          <button onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded">{isDeleting ? 'Cancelando...' : 'Sim, Cancelar'}</button>
        </div>
      </Modal>
    </div>
  );
}
