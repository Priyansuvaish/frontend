import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const body = await req.json();
  console.log(body);
  console.log(authHeader);

  try {
    const response = await fetch('http://localhost:8082/api/form-submissions?templateId=2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    // 🛡️ Check if response has content
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text(); // fallback
    }

    return NextResponse.json({ data }, { status: response.status });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form submissions' },
      { status: 500 }
    );
  }
}
