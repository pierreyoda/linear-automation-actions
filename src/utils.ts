/**
 * Allows uniform error handling across the codebase.
 *
 * Does inherit from `Error` for now.
 */
export const instantiateError = (message: string): Error => new Error(`linear-automation-actions error: ${message}`);
