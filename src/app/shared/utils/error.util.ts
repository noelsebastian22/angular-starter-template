export function extractErrorMessage(error: any): string {
  if (!error) return 'Unknown error';

  if (typeof error === 'string') return error;

  if (error.message) return error.message;

  if (error.error && typeof error.error === 'string') return error.error;

  try {
    return JSON.stringify(error);
  } catch {
    return 'An unexpected error occurred';
  }
}
