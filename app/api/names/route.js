import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'names.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read existing names
function readNames() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading names:', error);
  }
  return [];
}

// Write names to file
function writeNames(names) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(names, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing names:', error);
    return false;
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const names = readNames();
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
    writeNames(names);

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
    const names = readNames();
    return NextResponse.json({ names });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const success = writeNames([]);
    if (success) {
      return NextResponse.json({ success: true, message: 'All names cleared successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to clear names' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
