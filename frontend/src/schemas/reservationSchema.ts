import { z } from 'zod';

export const reservationSchema = z.object({
  roomId: z.string().min(1, 'O nome da sala é obrigatório.'),
  date: z.string().min(1, 'A data é obrigatória.'),
  startTime: z.string().min(1, 'O horário de início é obrigatório.'),
  endTime: z.string().min(1, 'O horário de término é obrigatório.'),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

export type Reservation = ReservationFormData & {
  id: string;
  user: { id: string; name: string; email: string; };
};
