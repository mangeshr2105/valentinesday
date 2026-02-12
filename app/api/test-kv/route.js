import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    // Test KV connection
    const testKey = 'kv_test_' + Date.now();
    const testValue = { message: 'KV is working!', timestamp: new Date().toISOString() };
    
    // Test write
    await kv.set(testKey, testValue);
    
    // Test read
    const readValue = await kv.get(testKey);
    
    // Check environment variables
    const envVars = {
      KV_REST_API_URL: process.env.KV_REST_API_URL ? 'Set' : 'Not set',
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV
    };
    
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
