import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get existing names from KV if available
    let names = [];
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        const storedNames = await kv.get('valentine_names');
        if (storedNames) {
          names = storedNames;
        }
      } catch (kvError) {
        console.error('KV get error:', kvError);
      }
    }

    const newEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'Unknown'
    };

    names.unshift(newEntry);
    
    // Keep only last 1000 names to prevent storage bloat
    if (names.length > 1000) {
      names = names.slice(0, 1000);
    }

    // Store back to KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        await kv.set('valentine_names', names);
      } catch (kvError) {
        console.error('KV set error:', kvError);
        // Fallback to file system for local development
        if (process.env.NODE_ENV === 'development') {
          try {
            const fs = require('fs');
            const path = require('path');
            const dataDir = path.join(process.cwd(), 'data');
            
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
            }
            
            fs.writeFileSync(
              path.join(dataDir, 'names.json'),
              JSON.stringify(names, null, 2)
            );
          } catch (fsError) {
            console.error('File system fallback error:', fsError);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Name stored successfully',
      entry: newEntry,
      storage: process.env.KV_REST_API_URL ? 'kv' : 'none'
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    let names = [];
    
    // Try to get from KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        const storedNames = await kv.get('valentine_names');
        if (storedNames) {
          names = storedNames;
        }
      } catch (kvError) {
        console.error('KV get error:', kvError);
      }
    }
    
    // Fallback to file system for development
    if (!names && process.env.NODE_ENV === 'development') {
      try {
        const fs = require('fs');
        const path = require('path');
        const dataFile = path.join(process.cwd(), 'data', 'names.json');
        
        if (fs.existsSync(dataFile)) {
          const data = fs.readFileSync(dataFile, 'utf8');
          names = JSON.parse(data);
        }
      } catch (fsError) {
        console.error('File system fallback error:', fsError);
      }
    }
    
    return NextResponse.json({ names });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear in KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        await kv.set('valentine_names', []);
      } catch (kvError) {
        console.error('KV delete error:', kvError);
        
        // Fallback to file system for development
        if (process.env.NODE_ENV === 'development') {
          try {
            const fs = require('fs');
            const path = require('path');
            const dataFile = path.join(process.cwd(), 'data', 'names.json');
            
            fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
          } catch (fsError) {
            console.error('File system fallback error:', fsError);
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, message: 'All names cleared successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
