import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', 'leave_application');
  params.append('scope', 'email openid');
  params.append('username', username);
  params.append('password', password);

  const response = await fetch('http://localhost:8081/realms/LeaveApplication/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    // credentials: 'include', // Uncomment if you want to forward cookies
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
} 