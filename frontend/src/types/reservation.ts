export type Reservation = {
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


