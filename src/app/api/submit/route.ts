import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const RATE_LIMIT_SECONDS = 60;

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { country_code, country_name, display_name, session_id } = body;

    // Validate required fields
    if (!country_code || !country_name || !session_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate country code format (2 uppercase letters)
    if (!/^[A-Z]{2}$/.test(country_code)) {
      return NextResponse.json(
        { success: false, message: 'Invalid country code' },
        { status: 400 }
      );
    }

    // Validate display name length
    if (display_name && display_name.length > 24) {
      return NextResponse.json(
        { success: false, message: 'Display name too long (max 24 characters)' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const { data: recentSubmission } = await supabase
      .from('submissions')
      .select('created_at')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentSubmission) {
      const lastSubmitTime = new Date(recentSubmission.created_at).getTime();
      const now = Date.now();
      const secondsSinceLastSubmit = (now - lastSubmitTime) / 1000;

      if (secondsSinceLastSubmit < RATE_LIMIT_SECONDS) {
        const waitTime = Math.ceil(RATE_LIMIT_SECONDS - secondsSinceLastSubmit);
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${waitTime} seconds before submitting again`,
          },
          { status: 429 }
        );
      }
    }

    // Insert submission
    const { error: insertError } = await supabase.from('submissions').insert({
      country_code,
      country_name,
      display_name: display_name || null,
      session_id,
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Get updated stats
    const { data: stats, error: statsError } = await supabase
      .from('country_counts')
      .select('*');

    if (statsError) {
      console.error('Stats error:', statsError);
    }

    const total = stats?.reduce((sum, item) => sum + item.count, 0) || 0;

    return NextResponse.json({
      success: true,
      message: 'Submission recorded',
      stats: {
        countries: stats || [],
        total,
      },
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
