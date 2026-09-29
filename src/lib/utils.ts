export { cn } from "cn";

/**
 * Extracts a human-readable error message from API errors,
 * including FastAPI/Pydantic validation errors (`detail` array of objects),
 * standard API error payloads, or generic Error instances.
 */
export function getErrorMessage(err: unknown, fallbackMessage = "An unexpected error occurred"): string {
  if (!err) return fallbackMessage;

  // Check for RTK Query / fetch response error structure
  const errorObj = err as any;
  const detail = errorObj?.data?.detail ?? errorObj?.detail;

  // If detail is FastAPI/Pydantic validation error array: [{ msg, loc, type, input }, ...]
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "";
          if (field && item.msg) {
            return `${field}: ${item.msg}`;
          }
          return item.msg || JSON.stringify(item);
        }
        return String(item);
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join("; ");
    }
  }

  // If detail is an object
  if (detail && typeof detail === "object") {
    if (detail.msg) return String(detail.msg);
    if (detail.message) return String(detail.message);
    try {
      return JSON.stringify(detail);
    } catch {
      return fallbackMessage;
    }
  }

  // If detail is a plain string
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  // Check error message in standard fields
  if (typeof errorObj?.data?.message === "string" && errorObj.data.message.trim()) {
    return errorObj.data.message;
  }

  if (typeof errorObj?.data?.error === "string" && errorObj.data.error.trim()) {
    return errorObj.data.error;
  }

  if (typeof errorObj?.error === "string" && errorObj.error.trim()) {
    return errorObj.error;
  }

  if (typeof errorObj?.message === "string" && errorObj.message.trim()) {
    return errorObj.message;
  }

  return fallbackMessage;
}
