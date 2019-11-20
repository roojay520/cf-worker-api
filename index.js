import { Router } from 'service-worker-router';

const initWorkerUrl = (name) => `https://${name}.fe.workers.dev`;
const initError = (status, statusText) => new Response(statusText, {
  status,
  statusText,
  headers: {
    'content-type': 'application/json',
  },
});
const init404Error = () => initError(404, 'Not found');

async function handleRequest(req) {
  const router = new Router();
  try {
    router.all('/:worker', async ({ params, request }) => {
      const { worker } = params;
      if (!worker) return init404Error();
      const url = initWorkerUrl(worker);
      const data = await fetch(url, request);
      return data;
    });

    router.all('*', () => init404Error());

    const result = router.handleRequest(req);
    const res = await result.handlerPromise;
    if (!res.ok) {
      return initError(res.status, res.statusText);
    }
    return res;
  } catch (error) {
    return init404Error();
  }
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
