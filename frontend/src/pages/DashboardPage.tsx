import { useEffect, useState } from 'react';
import api from '../services/api';

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

export function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/reservations')
    .then(response => {
      setReservations(response.data);
    })
    .catch(err => {
      console.error('Erro ao buscar reservas: ',err);
      setError('Não foi possível carregar as reservas.')
    })
    .finally(() => {
      setIsLoading(false);
    });

  }, []);

  if (isLoading) {
    return <p className='text-center text-white'>Carregando reservas...</p>;
  }

  if (error) {
    return <p className='text-center text-red-500'>{error}</p>;
  }

  return (
    <div className='text-white'>
      <h1 className='text-3xl font-bold mb-6'>Dashboard de Reservas</h1>

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
                    <td className='p-3'>{new Date(res.date).toLocaleDateString()}</td>
                    <td className='p-3'>
                      {new Date(res.startTime).toLocaleTimeString()} - {new Date(res.endTime).toLocaleTimeString()}
                    </td>
                    <td className='p-3'>{res.user.name} ({res.user.email})</td>
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
    </div>
  );
}
