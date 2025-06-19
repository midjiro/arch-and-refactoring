import { Ticket, ITicket } from '../models/tickets';
import { IUserDocument } from '../models/user';

export interface BookingStrategy {
  book(ticket: ITicket, user: IUserDocument): Promise<ITicket>;
}

export class OrdinaryBookingStrategy implements BookingStrategy {
  async book(ticket: ITicket, user: IUserDocument): Promise<ITicket> {
    if (ticket.status !== 'available') {
      throw new Error('Квиток недоступний для бронювання');
    }
    ticket.status = 'booked';
    ticket.bookedBy = user.id;
    await ticket.save();
    return ticket;
  }
}

export class VipBookingStrategy implements BookingStrategy {
  async book(ticket: ITicket, user: IUserDocument): Promise<ITicket> {
    if (ticket.status !== 'available') {
      throw new Error('VIP квиток недоступний для бронювання');
    }
    ticket.status = 'booked';
    ticket.bookedBy = user.id;
    await ticket.save();
    return ticket;
  }
}
