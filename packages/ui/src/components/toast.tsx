import { type ToasterProps, toast, useSonner } from "sonner";

export * from "./sonner";

/**
 * Closes all currently displayed toasts
 */
const closeAllToasts = (): void => {
  const toasts = toast.getToasts();
  toasts.map((t) => toast.dismiss(t.id));
};

/**
 * Closes a specific toast by ID
 * @param id - The toast ID to dismiss
 */
const closeToast = (id: string | number): void => {
  toast.dismiss(id);
};

/**
 * Closes multiple toasts by their IDs
 * @param ids - Array of toast IDs to dismiss
 */
const closeToasts = (ids: (string | number)[]): void => {
  ids.map((id) => toast.dismiss(id));
};

/**
 * Gets the count of currently displayed toasts
 * @returns number of active toasts
 */
const getToastCount = (): number => {
  return toast.getToasts().length;
};

/**
 * Checks if there are any active toasts
 * @returns true if there are active toasts, false otherwise
 */
const hasActiveToasts = (): boolean => {
  return getToastCount() > 0;
};

/**
 * Toast helper functions with consistent styling
 */
const toastHelpers = {
  success: (message: string, options?: Parameters<typeof toast.success>[1]) => {
    return toast.success(message, {
      duration: 4000,
      ...options,
    });
  },

  error: (message: string, options?: Parameters<typeof toast.error>[1]) => {
    return toast.error(message, {
      duration: 6000,
      ...options,
    });
  },

  warning: (message: string, options?: Parameters<typeof toast.warning>[1]) => {
    return toast.warning(message, {
      duration: 5000,
      ...options,
    });
  },

  info: (message: string, options?: Parameters<typeof toast.info>[1]) => {
    return toast.info(message, {
      duration: 4000,
      ...options,
    });
  },

  loading: (message: string, options?: Parameters<typeof toast.loading>[1]) => {
    return toast.loading(message, {
      duration: Infinity,
      ...options,
    });
  },
};

export {
  toast,
  useSonner,
  useSonner as useToast,
  closeAllToasts,
  closeToast,
  closeToasts,
  getToastCount,
  hasActiveToasts,
  toastHelpers,
  type ToasterProps,
};
