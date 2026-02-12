import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage with persistence using Vercel's Edge Config fallback
let memoryStorage = [];

export async function POST(request) {
  try {
    const { name, buttonStats, updateOnly } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // If this is just a button stats update, find and update existing entry
    if (updateOnly) {
      const existingIndex = memoryStorage.findIndex(entry => entry.name === name.trim());
      if (existingIndex >= 0) {
        // Update existing entry with new button stats
        const oldEntry = memoryStorage[existingIndex];
        memoryStorage[existingIndex] = {
          ...memoryStorage[existingIndex],
          noStateChanges: buttonStats?.noStateChanges !== undefined ? buttonStats.noStateChanges : memoryStorage[existingIndex].noStateChanges || 0,
          yesPressed: buttonStats?.yesPressed !== undefined ? buttonStats.yesPressed : memoryStorage[existingIndex].yesPressed,
          lastUpdated: new Date().toISOString()
        };

        console.log('Button stats updated for existing entry:');
        console.log('Before:', oldEntry);
        console.log('After:', memoryStorage[existingIndex]);
        console.log('Received buttonStats:', buttonStats);

        // Try to use KV if available
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
          try {
            const { kv } = await import('@vercel/kv');
            await kv.set('valentine_names', memoryStorage);
          } catch (kvError) {
            console.log('KV not available, using memory storage');
          }
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Button stats updated successfully',
          entry: memoryStorage[existingIndex],
          storage: 'memory'
        });
      } else {
        console.log('No existing entry found for name:', name.trim());
        console.log('Current memoryStorage:', memoryStorage.map(e => e.name));
      }
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
      noStateChanges: buttonStats?.noStateChanges || 0,
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

    // Check for global yes tracking data and merge it
    if (global.yesButtonTracking) {
      console.log('Found global yes tracking data:', global.yesButtonTracking);
      names = names.map(entry => {
        const yesData = global.yesButtonTracking[entry.name];
        if (yesData && yesData.yesPressed) {
          return {
            ...entry,
            yesPressed: true,
            lastUpdated: yesData.timestamp
          };
        }
        return entry;
      });
    }

    console.log('Names retrieved with yes tracking:', names);
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
