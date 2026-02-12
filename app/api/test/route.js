import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Test API received:', body);
    
    return NextResponse.json({ 
      success: true, 
      message: 'API is working',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test API is working',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
}
