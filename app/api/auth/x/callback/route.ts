import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return new NextResponse(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: '${error}' }, '*');
              window.close();
            }
          </script>
          <p>Authentication failed: ${error}</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }

  // In a real app, you would exchange the code for tokens here
  // For this demo, we'll assume success if a code is present
  
  return new NextResponse(`
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'x' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
        <p>Authentication successful. This window should close automatically.</p>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}
