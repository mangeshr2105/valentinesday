import { NextRequest, NextResponse } from 'next/server';

// Memory storage for button stats (same approach as names-simple)
let memoryStats = [];

export async function POST(request) {
  try {
    const { name, stats } = await request.json();
    
    if (!name || !stats) {
      return NextResponse.json({ error: 'Name and stats are required' }, { status: 400 });
    }

    const newStatsEntry = {
      name,
      noPresses: stats.noPresses || 0,
      yesPressed: stats.yesPressed || false,
      lastUpdated: new Date().toISOString()
    };

    // Find existing entry for this name or create new one
    const existingIndex = memoryStats.findIndex(entry => entry.name === name);
    if (existingIndex >= 0) {
      // Update existing entry
      memoryStats[existingIndex] = newStatsEntry;
    } else {
      // Add new entry
      memoryStats.unshift(newStatsEntry);
    }

    // Keep only last 500 entries
    if (memoryStats.length > 500) {
      memoryStats = memoryStats.slice(0, 500);
    }

    // Try to use KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        await kv.set('button_stats', memoryStats);
      } catch (kvError) {
        console.log('KV not available, using memory storage for stats');
      }
    }

    console.log('Button stats saved:', newStatsEntry);

    return NextResponse.json({ 
      success: true, 
      message: 'Button stats saved successfully',
      entry: newStatsEntry,
      storage: process.env.KV_REST_API_URL ? 'kv' : 'memory'
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    let allStats = memoryStats;
    
    // Try to get from KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        const storedStats = await kv.get('button_stats');
        if (storedStats && storedStats.length > 0) {
          allStats = storedStats;
          memoryStats = storedStats; // Sync memory storage
        }
      } catch (kvError) {
        console.log('KV not available, using memory storage for stats');
      }
    }
    
    console.log('Button stats retrieved:', allStats);
    return NextResponse.json({ stats: allStats });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
