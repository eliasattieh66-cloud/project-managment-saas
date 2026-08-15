export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  const message =
    error.isOperational ? error.message : "Something went wrong.";

  return res.status(statusCode).json({
    status: "error",
    message,
  });
}