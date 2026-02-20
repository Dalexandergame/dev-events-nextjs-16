'use client'

import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { useState } from "react"

 
const BookEvent = ({ eventId, slug }: { eventId: string; slug: string; }) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const { success } = await createBooking({ eventId, slug, email });

            if(success) {
                setSubmitted(true);
                posthog.capture('event booked', {
                    eventId,
                    slug,
                    email
                });
            } else {
                console.error('Failed to create booking');
                posthog.captureException('Booking creation failed');
            }
        } catch (error) {
            console.error('Failed to create booking', error);
            posthog.captureException(error);
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <div id="book-event">
        {submitted ? (
            <p className="text-sm">Thank you for booking your spot!</p>
        ): (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email}
                        placeholder="Enter your email address"
                        onChange={(e) => setEmail(e.target.value)}
                        required />
                </div>

                <button type="submit" className="button-submit" disabled={isSubmitting || submitted}>
                    {isSubmitting ? "Booking..." : "Book Now"}
                </button>
            </form>
        )}
    </div>
  )
}

export default BookEvent
