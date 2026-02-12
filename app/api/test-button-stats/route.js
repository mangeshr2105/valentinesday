import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Test data for button stats
    const testData = {
      name: 'Test User',
      stats: {
        noPresses: 5,
        yesPressed: true
      }
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/button-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Test button stats created',
      testData,
      result
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
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/button-stats`);
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Current button stats',
      stats: data.stats,
      count: data.stats ? data.stats.length : 0
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
