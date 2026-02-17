import { Schema, model, models, Document } from 'mongoose';

/**
 * TypeScript interface for Event document
 * Extends Mongoose Document for proper typing
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event Schema Definition
 * Includes validation rules and automatic timestamps
 */
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Event overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Event image is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Event mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be online, offline, or hybrid',
      },
      lowercase: true,
    },
    audience: {
      type: String,
      required: [true, 'Event audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Event agenda is required'],
      validate: {
        validator: (array: string[]) => array.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Event organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Event tags are required'],
      validate: {
        validator: (array: string[]) => array.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

/**
 * Pre-save hook for slug generation and date/time normalization
 * - Generates URL-friendly slug from title (only when title changes)
 * - Normalizes date to ISO format (YYYY-MM-DD)
 * - Standardizes time format (HH:MM)
 */
EventSchema.pre('save', async function () {
  // Generate slug only if title is modified or document is new
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }

  // Validate and normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified('date')) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(this.date)) {
      // Attempt to parse and convert to ISO format
      const parsedDate = new Date(this.date);
      if (isNaN(parsedDate.getTime())) {
        return new Error('Invalid date format. Expected ISO format (YYYY-MM-DD)');
      }
      this.date = parsedDate.toISOString().split('T')[0];
    }
  }

  // Validate and normalize time format (HH:MM)
  if (this.isModified('time')) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(this.time)) {
      // Attempt to parse time
      const timeParts = this.time.match(/^(\d{1,2}):(\d{2})$/);
      if (!timeParts) {
        return new Error('Invalid time format. Expected HH:MM (24-hour format)');
      }
      const hours = parseInt(timeParts[1], 10);
      const minutes = parseInt(timeParts[2], 10);
      if (hours > 23 || minutes > 59) {
        return new Error('Invalid time. Hours must be 0-23 and minutes 0-59');
      }
      this.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

});

// Create unique index on slug for efficient lookups
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Export Event model
 * Uses models cache to prevent model recompilation in development
 */
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
