addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
    // Reenviar solicitud a tu backend en Render
    const backendUrl = 'https://your-backend-url.onrender.com/enhance';
    const modifiedRequest = new Request(backendUrl, {
      method: 'POST',
      body: request.body,
      headers: {
        'Content-Type': request.headers.get('Content-Type')
      }
    });
    
    const response = await fetch(modifiedRequest);
    return response;
  }
  
  return new Response('Método no permitido', { status: 405 });
}