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

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      status: "error",
      message: "Request body is too large.",
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON in request body.",
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
