import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8082';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get('authorization');
    const response = await fetch(`${BACKEND_URL}/api/form-templates/${id}`, {
      headers: authHeader ? { 'Authorization': authHeader } : {},
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.log('GET /api/form-templates/[id] - Backend 401 error response:', errorText);
        return NextResponse.json(
          { error: 'Unauthorized. Please log in again.' },
          { status: 401 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Form template not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching form template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const { id } = await params;
    console.log('PUT request for template ID:', id);
    console.log('Authorization header present:', !!authHeader);
    console.log('Authorization header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');
    
    const response = await fetch(`${BACKEND_URL}/api/form-templates/${id}`, {
      method: 'PUT',
      headers: {...(authHeader ? { 'Authorization': authHeader } : {}),
      'Content-Type': 'application/json',},
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.log('PUT /api/form-templates/[id] - Backend 401 error response:', errorText);
        return NextResponse.json(
          { error: 'Unauthorized. Please log in again.' },
          { status: 401 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Form template not found' },
          { status: 404 }
        );
      }
      if (response.status === 403) {
        const errorText = await response.text();
        console.log('Backend 403 error response:', errorText);
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
    console.error('Error updating form template:', error);
    return NextResponse.json(
      { error: 'Failed to update form template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get('authorization');
    const response = await fetch(`${BACKEND_URL}/api/form-templates/${id}`, {
      method: 'DELETE',
      headers: {...(authHeader ? { 'Authorization': authHeader } : {}),
      'Content-Type': 'application/json',},
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.log('DELETE /api/form-templates/[id] - Backend 401 error response:', errorText);
        return NextResponse.json(
          { error: 'Unauthorized. Please log in again.' },
          { status: 401 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Form template not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting form template:', error);
    return NextResponse.json(
      { error: 'Failed to delete form template' },
      { status: 500 }
    );
  }
} 