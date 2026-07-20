import { randomUUID } from "node:crypto";

type LogLevel = "error" | "info" | "warn";
type LogDetails = Record<string, boolean | number | string | null | undefined>;

const sensitiveKey = /(authorization|body|cookie|email|password|secret|token)/i;
const requestIdPattern = /^[A-Za-z0-9_-]{8,80}$/;

export function getRequestId(request: Request) {
  const providedId = request.headers.get("x-request-id");
  return providedId && requestIdPattern.test(providedId)
    ? providedId
    : randomUUID();
}

export function createLogEntry(
  level: LogLevel,
  event: string,
  requestId: string,
  details: LogDetails = {},
) {
  const safeDetails = Object.fromEntries(
    Object.entries(details).filter(
      ([key, value]) => !sensitiveKey.test(key) && value !== undefined,
    ),
  );

  return {
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId,
    ...safeDetails,
  };
}

export function logServerEvent(
  level: LogLevel,
  event: string,
  requestId: string,
  details?: LogDetails,
) {
  const output = JSON.stringify(createLogEntry(level, event, requestId, details));
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.info(output);
}
