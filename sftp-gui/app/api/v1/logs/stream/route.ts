import { NextRequest } from 'next/server';
import https from 'https';

const API_BASE_URL = process.env.API_BASE_URL || 'https://localhost:8443';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
    req.nextUrl.searchParams.get('token');
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/logs/stream`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
        // @ts-expect-error - Node.js fetch supports agent
        agent: httpsAgent,
      });

      if (!response.ok) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to connect to log stream', status: response.status })}\n\n`));
        await writer.close();
        return;
      }

      if (!response.body) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`));
        await writer.close();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        await writer.write(encoder.encode(chunk));
      }

      await writer.close();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
