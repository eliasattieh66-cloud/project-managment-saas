import multer from "multer";

export function errorHandler(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File is too large. The maximum size is 10 MB."
        : "File upload failed.";

    return res.status(400).json({
      status: "error",
      message,
    });
  }

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
