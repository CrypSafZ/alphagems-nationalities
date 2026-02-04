import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

export async function GET() {
  try {
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Database not configured', countries: [], total: 0 },
        { status: 503 }
      );
    }

    const { data: stats, error } = await supabase
      .from('country_counts')
      .select('*');

    if (error) {
      console.error('Stats error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    const total = stats?.reduce((sum, item) => sum + item.count, 0) || 0;

    return NextResponse.json({
      success: true,
      countries: stats || [],
      total,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
