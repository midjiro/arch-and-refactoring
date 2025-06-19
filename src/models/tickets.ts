import mongoose, { Document, Schema } from 'mongoose';

export type TicketStatus = 'available' | 'booked' | 'cancelled';
export type TicketType = 'vip' | 'ordinary';

export interface ITicket extends Document {
  movieTitle: string;
  sessionTime: Date;
  seatNumber: string;
  price: number;
  type: TicketType;
  bookedBy?: string | null;
  status: TicketStatus;
}

const ticketSchema = new Schema<ITicket>({
  movieTitle: { type: String, required: true },
  sessionTime: { type: Date, required: true },
  seatNumber: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['vip', 'ordinary'], required: true },
  bookedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled'],
    default: 'available',
  },
});

export const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
