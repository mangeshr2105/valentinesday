import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Find existing entry and mark yes as pressed
    let found = false;
    
    // Try to get from KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        let names = await kv.get('valentine_names') || [];
        
        const existingIndex = names.findIndex(entry => entry.name === name.trim());
        if (existingIndex >= 0) {
          names[existingIndex].yesPressed = true;
          names[existingIndex].lastUpdated = new Date().toISOString();
          await kv.set('valentine_names', names);
          found = true;
          console.log('Yes button tracked via KV for:', name.trim());
        }
      } catch (kvError) {
        console.log('KV not available for yes tracking');
      }
    }
    
    // Fallback to memory storage
    if (!found) {
      // This is a simple approach - we'll use a global memory store
      global.yesButtonTracking = global.yesButtonTracking || {};
      global.yesButtonTracking[name.trim()] = {
        yesPressed: true,
        timestamp: new Date().toISOString()
      };
      console.log('Yes button tracked via memory for:', name.trim());
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Yes button tracked successfully',
      name: name.trim()
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
