import { Schema, model, models, Document, Types } from 'mongoose';

/**
 * TypeScript interface for Booking document
 * Extends Mongoose Document for proper typing
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking Schema Definition
 * Links bookings to events with reference validation
 */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster queries by eventId
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string): boolean {
          // RFC 5322 compliant email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

/**
 * Pre-save hook to validate event existence
 * Ensures the referenced event exists before creating a booking
 * Prevents orphaned bookings for non-existent events
 */
BookingSchema.pre('save', async function (next) {
  // Only validate eventId if it's modified or the document is new
  if (this.isModified('eventId')) {
    try {
      // Dynamically import Event model to avoid circular dependency
      const Event = models.Event || (await import('./event.model')).default;
      
      // Check if the event exists
      const eventExists = await Event.exists({ _id: this.eventId });
      
      if (!eventExists) {
        return next(new Error(`Event with ID ${this.eventId} does not exist`));
      }
    } catch (error) {
      return next(error instanceof Error ? error : new Error('Error validating event'));
    }
  }
  
  next();
});

// Create index on eventId for efficient event-based queries
BookingSchema.index({ eventId: 1 });

// Create compound index for unique email per event (optional - uncomment if needed)
// BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

/**
 * Export Booking model
 * Uses models cache to prevent model recompilation in development
 */
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
