export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  const response = {
    status: "error",
    message: error.isOperational ? error.message : "Something went wrong.",
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  return res.status(statusCode).json(response);
}