import { toast } from "react-toastify";

/**
 * Show a green “Success” toast.
 * @param {string} message – fallbacks to generic copy.
 */
export const showSuccess = (message = "Operation completed successfully.") =>
  toast.success(message, { position: "top-right" });

/**
 * Show a red “Error” toast.
 * @param {string} message – fallbacks to generic copy.
 */
export const showError = (message = "Something went wrong.") =>
  toast.error(message, { position: "top-right" });
