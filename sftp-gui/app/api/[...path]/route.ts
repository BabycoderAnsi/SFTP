import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const API_BASE_URL = process.env.API_BASE_URL || 'https://localhost:8443';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function proxyRequest(
  req: NextRequest,
  method: string
): Promise<NextResponse> {
  const path = req.nextUrl.pathname.replace('/api', '');
  const searchParams = req.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}${path}${searchParams ? `?${searchParams}` : ''}`;

  const headers: HeadersInit = {};
  
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await req.text();
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      cache: 'no-store',
      // @ts-expect-error - Node.js fetch supports agent
      agent: httpsAgent,
    });

    const responseHeaders = new Headers();
    
    const contentTypeResp = response.headers.get('content-type');
    if (contentTypeResp) {
      responseHeaders.set('content-type', contentTypeResp);
    }
    
    const responseBody = await response.text();
    
    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: { 
          message: error instanceof Error ? error.message : 'Proxy request failed',
          code: 'PROXY_ERROR'
        }
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, 'GET');
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, 'POST');
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, 'PUT');
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req, 'PATCH');
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, 'DELETE');
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
