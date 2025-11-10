export enum ErrorCode {
  BadRequest = 400,
  Unauthenticated = 401,
  Forbidden = 403,
  NotFound = 404,
}

export type RequestError = {
  status: ErrorCode;
  message: string;
};

export function errorResponse(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return new Response(error.message, { status: error.status });
  } else if (typeof error === "string") {
    console.error("Unexpected error:", error);
    return new Response(error, { status: 500 });
  } else {
    console.error("Unexpected error:", error);
    return new Response("Unexpected error.", { status: 500 });
  }
}
