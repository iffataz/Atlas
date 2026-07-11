// Tagged, timestamped server-side error logging — enough context to trace a
// failure in Vercel logs without an external logging service.
export function logError(context: string, err: unknown) {
  const message =
    err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  console.error(`[${new Date().toISOString()}] [${context}] ${message}`);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }
}
