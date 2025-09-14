import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import toast from "react-hot-toast";
import type { Reservation } from "../types/reservation";
import type { ReservationFormData } from "../schemas/reservationSchema";

interface ReservationFilters {
  roomId?: string;
  userName?: string;
  date?: string;
}

const fetchReservations = async (viewMode: 'all' | 'mine', filters: ReservationFilters): Promise<Reservation[]> => {
  let url = viewMode === 'mine' ? '/reservations/mine' : '/reservations'

  if (viewMode == 'all') {
    const params = new URLSearchParams();
    if (filters.roomId) params.append('roomId', filters.roomId);
    if (filters.userName) params.append('userName', filters.userName);
    if (filters.date) params.append('date', filters.date);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const { data } = await api.get(url);
  return data;
};

const createReservation = (data: ReservationFormData) => api.post('/reservations', data);
const updateReservation = ({ id, data }: { id: string; data: ReservationFormData }) => api.patch(`/reservations/${id}`, data);
const deleteReservation = (id: string) => api.delete(`/reservations/${id}`);

export function useReservations(viewMode: 'all' | 'mine', filters: ReservationFilters) {
  const queryClient = useQueryClient();

  const extractErrorMessage = (error: unknown): string => {
    const anyErr = error as any;
    const rawMessage = anyErr?.response?.data?.message ?? anyErr?.message ?? 'Ocorreu um erro ao processar sua solicitação.';
    if (Array.isArray(rawMessage)) {
      return rawMessage.join(', ');
    }
    return String(rawMessage);
  };

  const { data: reservations, isLoading, isError } = useQuery({
    queryKey: ['reservations', viewMode, filters],
    queryFn: () => fetchReservations(viewMode, filters),
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  };

  const createMutation = useMutation({
    mutationFn: createReservation,
    ...mutationOptions,
    onSuccess: () => {
      toast.success('Reserva criada com sucesso!');
      mutationOptions.onSuccess();
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateReservation,
    ...mutationOptions,
    onSuccess: () => {
      toast.success('Reserva atualizada com sucesso!');
      mutationOptions.onSuccess();
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReservation,
    ...mutationOptions,
    onSuccess: () => {
      toast.success('Reserva cancelada com sucesso!');
      mutationOptions.onSuccess();
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  return {
    reservations,
    isLoading,
    isError,
    createReservation: createMutation.mutate,
    updateReservation: updateMutation.mutate,
    deleteReservation: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
