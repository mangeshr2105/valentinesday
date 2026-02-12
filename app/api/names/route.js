import { NextRequest, NextResponse } from 'next/server';

// Use Vercel KV for storage (works on free plan)
const kv = {
  async get(key) {
    // For Vercel deployment, use environment variable or fallback to memory
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const response = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          },
        });
        const data = await response.json();
        return data.result ? JSON.parse(data.result) : null;
      } catch (error) {
        console.error('KV get error:', error);
        return null;
      }
    }
    // Fallback for local development
    return null;
  },
  
  async set(key, value) {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          },
          body: JSON.stringify(value),
        });
        return true;
      } catch (error) {
        console.error('KV set error:', error);
        return false;
      }
    }
    // Fallback for local development - use file system
    return false;
  }
};

export async function POST(request) {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get existing names from KV
    let names = [];
    const storedNames = await kv.get('valentine_names');
    if (storedNames) {
      names = storedNames;
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

    // Store back to KV
    const success = await kv.set('valentine_names', names);
    
    if (!success && process.env.NODE_ENV === 'development') {
      // Fallback to file system for local development
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
      } catch (error) {
        console.error('File system fallback error:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Name stored successfully',
      entry: newEntry 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Try to get from KV first
    let names = await kv.get('valentine_names');
    
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
      } catch (error) {
        console.error('File system fallback error:', error);
      }
    }
    
    names = names || [];
    return NextResponse.json({ names });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear in KV
    const success = await kv.set('valentine_names', []);
    
    // Fallback to file system for development
    if (!success && process.env.NODE_ENV === 'development') {
      try {
        const fs = require('fs');
        const path = require('path');
        const dataFile = path.join(process.cwd(), 'data', 'names.json');
        
        fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
      } catch (error) {
        console.error('File system fallback error:', error);
      }
    }
    
    return NextResponse.json({ success: true, message: 'All names cleared successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
