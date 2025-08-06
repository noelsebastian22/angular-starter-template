export function extractErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';

  if (typeof error === 'string') return error;

  if (error instanceof Error && error.message) {
    return error.message;
  }

  // Handle errors like HttpErrorResponse with an "error" field that's a string
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { error?: unknown };
    if (typeof maybeError.error === 'string') {
      return maybeError.error;
    }
  }

  try {
    return JSON.stringify(error);
  } catch {
    return 'An unexpected error occurred';
  }
}
