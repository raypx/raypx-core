/**
 * Common validation utilities
 */

/**
 * Validates email format using regex pattern
 * @param email - Email address to validate
 * @returns true if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns true if URL format is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if string is not empty after trimming
 * @param value - String to validate
 * @returns true if string is not empty
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}
