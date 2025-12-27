type RequestHandler<T extends string> = (
  req: Bun.BunRequest<T>,
) => Promise<Response> | Response;

const LOGGING_ENABLED = !!process.env.LOG_REQUESTS;

export function tracedHandler<T extends string>(handler: RequestHandler<T>) {
  if (!LOGGING_ENABLED) return handler;

  return async function (req: Bun.BunRequest<T>) {
    const method = req.method.toUpperCase();
    const url = new URL(req.url);
    const path = url.pathname;

    const start = new Date();
    console.log(`[START] ${method} ${path} at ${start.toTimeString()}`);
    const result = await handler(req);
    const end = new Date();
    const diffS = Math.round(end.getTime() - start.getTime()) / 1000;
    console.log(
      `[COMPLETE] ${method} ${path} after ${diffS}s (at ${end.toTimeString()})`,
    );
    return result;
  };
}
