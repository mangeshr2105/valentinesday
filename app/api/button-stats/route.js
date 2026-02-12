import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, stats } = await request.json();
    
    if (!name || !stats) {
      return NextResponse.json({ error: 'Name and stats are required' }, { status: 400 });
    }

    // Get existing stats or create new entry
    let allStats = [];
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        const storedStats = await kv.get('button_stats');
        if (storedStats) {
          allStats = storedStats;
        }
      } catch (kvError) {
        console.error('KV get error:', kvError);
      }
    }

    // Find existing entry for this name or create new one
    const existingIndex = allStats.findIndex(entry => entry.name === name);
    const newStatsEntry = {
      name,
      noPresses: stats.noPresses || 0,
      yesPressed: stats.yesPressed || false,
      lastUpdated: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Update existing entry
      allStats[existingIndex] = newStatsEntry;
    } else {
      // Add new entry
      allStats.unshift(newStatsEntry);
    }

    // Keep only last 500 entries
    if (allStats.length > 500) {
      allStats = allStats.slice(0, 500);
    }

    // Save to KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        await kv.set('button_stats', allStats);
      } catch (kvError) {
        console.error('KV set error:', kvError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Button stats saved successfully',
      entry: newStatsEntry 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    let allStats = [];
    
    // Try to get from KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        const storedStats = await kv.get('button_stats');
        if (storedStats) {
          allStats = storedStats;
        }
      } catch (kvError) {
        console.error('KV get error:', kvError);
      }
    }
    
    return NextResponse.json({ stats: allStats });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
