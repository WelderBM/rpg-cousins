/**
 * Sanitizes an object for Firestore by removing nested arrays.
 * Firestore does not support arrays containing other arrays.
 * This function recursively walks through the object/array and:
 * 1. If it finds an array as an element of another array, it flattens it or removes it.
 * 2. Specifically targets the 'requirements' field known to be a nested array in T20 data.
 */
export function sanitizeForFirestore(data: any): any {
  if (data === null || data === undefined) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    // If this array contains other arrays, Firestore will reject it.
    // We flatten it one level and recurse.
    if (data.some((item) => Array.isArray(item))) {
      return sanitizeForFirestore(data.flat());
    }
    return data.map((item) => sanitizeForFirestore(item));
  }

  // Handle objects
  if (typeof data === "object") {
    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeForFirestore(data[key]);
      }
    }
    return sanitized;
  }

  return data;
}
