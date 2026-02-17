import { NextRequest, NextResponse } from 'next/server';
import Event, { IEvent } from '@/database/event.model';
import connectDB from '@/lib/mongodb';

/**
 * Route segment config for Next.js
 */
type RouteParams = {
  params: Promise<{ slug: string }>;
};

/**
 * API Response type for consistent response structure
 */
interface ApiResponse {
  message: string;
  event?: IEvent;
  error?: string;
}

/**
 * Validates the slug parameter format
 * Slugs should be lowercase, alphanumeric with hyphens only
 */
function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its unique slug
 *
 * @param request - Next.js request object
 * @param context - Route context containing dynamic params
 * @returns JSON response with event data or error message
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    // Extract slug from dynamic route params
    const { slug } = await context.params;

    // Validate slug presence
    if (!slug || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Validation error', error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const normalizedSlug = slug.toLowerCase().trim();
    if (!isValidSlug(normalizedSlug)) {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Invalid slug format. Slug must be lowercase alphanumeric with hyphens only',
        },
        { status: 400 }
      );
    }

    // Establish database connection
    await connectDB();

    // Query event by slug
    const event = await Event.findOne({ slug: normalizedSlug }).lean<IEvent>();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: 'Not found', error: `Event with slug '${normalizedSlug}' does not exist` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Event fetched successfully', event },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (server-side only)
    console.error('[GET /api/events/[slug]]', error);

    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
