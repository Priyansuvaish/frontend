import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8082';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    console.log('GET /api/form-templates - Authorization header present:', !!authHeader);
    console.log('GET /api/form-templates - Authorization header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');
    console.log('GET /api/form-templates - All request headers:', Object.fromEntries(req.headers.entries()));

    const backendHeaders: Record<string, string> = {};
    if (authHeader) {
      backendHeaders['Authorization'] = authHeader;
    }
    console.log('GET /api/form-templates - Backend headers being sent:', backendHeaders);

    const response = await fetch(`${BACKEND_URL}/api/form-templates`, {
      headers: backendHeaders,
    });

    console.log('GET /api/form-templates - Backend response status:', response.status);
    console.log('GET /api/form-templates - Backend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.log('GET /api/form-templates - Backend 401 error response:', errorText);
        return NextResponse.json(
          { error: 'Unauthorized. Please log in again.' },
          { status: 401 }
        );
      }
      if (response.status === 403) {
        const errorText = await response.text();
        console.log('GET /api/form-templates - Backend 403 error response:', errorText);
        return NextResponse.json(
          { error: 'Access forbidden. Please check your permissions.' },
          { status: 403 }
        );
      }
      const errorText = await response.text();
      console.log('GET /api/form-templates - Backend error response:', errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching form templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form templates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json();
    console.log('POST /api/form-templates - Authorization header present:', !!authHeader);
    console.log('POST /api/form-templates - Authorization header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');

    const response = await fetch(`${BACKEND_URL}/api/form-templates`, {
      method: 'POST',
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('POST /api/form-templates - Backend response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.log('POST /api/form-templates - Backend 401 error response:', errorText);
        return NextResponse.json(
          { error: 'Unauthorized. Please log in again.' },
          { status: 401 }
        );
      }
      if (response.status === 403) {
        const errorText = await response.text();
        console.log('POST /api/form-templates - Backend 403 error response:', errorText);
        return NextResponse.json(
          { error: 'Access forbidden. Please check your permissions.' },
          { status: 403 }
        );
      }
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating form template:', error);
    return NextResponse.json(
      { error: 'Failed to create form template' },
      { status: 500 }
    );
  }
}
