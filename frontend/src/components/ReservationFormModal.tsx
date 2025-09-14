import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSchema } from '../schemas/reservationSchema';
import type { ReservationFormData } from '../schemas/reservationSchema';
import { useEffect } from 'react';

interface ReservationFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  initialData?: Partial<ReservationFormData>;
  onClose: () => void;
  onSubmit: (data: ReservationFormData) => void;
  isSubmitting: boolean;
}

export function ReservationFormModal({ isOpen, isEditing, initialData, onClose, onSubmit, isSubmitting }: ReservationFormModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { roomId: '', date: '', startTime: '', endTime: '' });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Formulário de Reserva"
      className="bg-gray-800 rounded-lg shadow-md p-8 text-white w-full max-w-lg mx-auto mt-20 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start pt-10"
    >
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Reserva' : 'Criar Nova Reserva'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-300 mb-1">Nome da sala</label>
          <input id="roomId" {...register('roomId')} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          {errors.roomId && <p className="text-red-500 text-sm mt-1">{errors.roomId.message}</p>}
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Data da Reserva</label>
          <input id="date" type="date" {...register('date')} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-1">Horário de Início</label>
          <input id="startTime" type="datetime-local" {...register('startTime')} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-1">Horário de Término</label>
          <input id="endTime" type="datetime-local" {...register('endTime')} className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400" />
          {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  );
}
