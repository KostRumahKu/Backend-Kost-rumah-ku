import morgan from "morgan";

const ENV = process.env.NODE_ENV || "development";
const sensitiveField =
  /(password|passwd|sandi|token|secret|authorization|api[-_]?key|credential)/i;

function redactSensitiveFields(value) {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveFields);
  }

  if (value && typeof value === "object" && !Buffer.isBuffer(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, fieldValue]) => [
        key,
        sensitiveField.test(key)
          ? "[REDACTED]"
          : redactSensitiveFields(fieldValue),
      ]),
    );
  }

  return value;
}

function formatBody(body) {
  if (body === undefined || body === null || body === "") {
    return "(empty)";
  }

  if (Buffer.isBuffer(body)) {
    return `[binary data: ${body.length} bytes]`;
  }

  let value = body;
  if (typeof body === "string") {
    try {
      value = JSON.parse(body);
    } catch {
      return body;
    }
  }

  try {
    return JSON.stringify(redactSensitiveFields(value), null, 2);

    /*kalau mau password nya gak nampil di log panggil function nya kayak di atas.
    kalau mau di tampilin hapus pakai yang bawah*/
    
    // return JSON.stringify((value), null, 2); 
  } catch (error) {
    return `[unserializable body: ${error.message}]`;
  }
}

export const loggerSetup = (app) => {
  if (ENV === "production") {
    app.use(morgan("combined"));
    return;
  }

  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    const originalSend = res.send;
    res.send = function (body) {
      res.locals.responseBody = body;
      return originalSend.call(this, body);
    };

    res.on("finish", () => {
      const responseTime = Number(process.hrtime.bigint() - startedAt) / 1e6;
      console.log(
        [
          `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime.toFixed(3)} ms`,
          "Request body:",
          formatBody(req.body),
          "Response body:",
          formatBody(res.locals.responseBody),
        ].join("\n"),
      );
    });

    next();
  });
};
