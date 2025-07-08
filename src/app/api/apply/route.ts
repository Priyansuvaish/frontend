import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const body = await req.json();

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/form-submissions?processid=myprocess&templateId=${process.env.TEMPLATE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized. Please log in again.' },
          { status: 401 }
        );
      }
    }
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
