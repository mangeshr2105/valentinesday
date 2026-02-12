import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables first
    const envVars = {
      KV_REST_API_URL: process.env.KV_REST_API_URL ? 'Set' : 'Not set',
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV
    };

    // Only try KV if environment variables are set
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'KV environment variables not set',
        environment: envVars,
        message: 'Please add KV storage to your Vercel project'
      });
    }

    // Dynamically import KV only when needed
    const { kv } = await import('@vercel/kv');
    
    // Test KV connection
    const testKey = 'kv_test_' + Date.now();
    const testValue = { message: 'KV is working!', timestamp: new Date().toISOString() };
    
    // Test write
    await kv.set(testKey, testValue);
    
    // Test read
    const readValue = await kv.get(testKey);
    
    return NextResponse.json({
      success: true,
      test: {
        wrote: testValue,
        read: readValue,
        match: JSON.stringify(testValue) === JSON.stringify(readValue)
      },
      environment: envVars,
      message: 'KV test completed'
    });
    
  } catch (error) {
    console.error('KV Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      environment: {
        KV_REST_API_URL: process.env.KV_REST_API_URL ? 'Set' : 'Not set',
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
