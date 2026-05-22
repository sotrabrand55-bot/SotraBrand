const isProduction = process.env.NODE_ENV === "production";

const getMessage = (error) => {
  if (error instanceof Error) return error.message;
  return String(error || "Unknown error");
};

export const logInfo = (message, meta) => {
  if (isProduction) return;
  if (meta !== undefined) {
    console.log(message, meta);
    return;
  }
  console.log(message);
};

export const logError = (scope, error) => {
  if (isProduction) {
    console.error(`[${scope}] ${getMessage(error)}`);
    return;
  }
  console.error(`[${scope}]`, error);
};
