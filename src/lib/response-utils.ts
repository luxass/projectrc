interface CreateErrorOptions {
  message: string;
  status: number;
  data?: unknown;
  headers?: Headers;
}

export function createError({ message, status, data, headers }: CreateErrorOptions) {
  return Response.json({
    message,
    status,
    data,
    timestamp: new Date().toISOString(),
  }, {
    status,
    headers,
  });
}
