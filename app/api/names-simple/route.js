import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage with persistence using Vercel's Edge Config fallback
let memoryStorage = [];

export async function POST(request) {
  try {
    const { name, buttonStats } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'Unknown',
      // Add button statistics
      noPresses: buttonStats?.noPresses || 0,
      yesPressed: buttonStats?.yesPressed || false
    };

    // Add to memory storage
    memoryStorage.unshift(newEntry);
    
    // Keep only last 100 names to prevent memory issues
    if (memoryStorage.length > 100) {
      memoryStorage = memoryStorage.slice(0, 100);
    }

    // Try to use KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        await kv.set('valentine_names', memoryStorage);
      } catch (kvError) {
        console.log('KV not available, using memory storage');
      }
    }

    console.log('Name with button stats saved:', newEntry);

    return NextResponse.json({ 
      success: true, 
      message: 'Name stored successfully',
      entry: newEntry,
      storage: 'memory'
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    let names = memoryStorage;

    // Try to get from KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        const storedNames = await kv.get('valentine_names');
        if (storedNames && storedNames.length > 0) {
          names = storedNames;
          memoryStorage = storedNames; // Sync memory storage
        }
      } catch (kvError) {
        console.log('KV not available, using memory storage');
      }
    }

    console.log('Names retrieved:', names);
    return NextResponse.json({ names });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    memoryStorage = [];

    // Try to clear KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        await kv.set('valentine_names', []);
      } catch (kvError) {
        console.log('KV not available, using memory storage');
      }
    }
    
    return NextResponse.json({ success: true, message: 'All names cleared successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
