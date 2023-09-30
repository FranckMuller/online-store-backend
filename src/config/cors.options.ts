const allowedOrigins = ["http://localhost:3500", "http://localhost:3000"];

export const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("not allowed by cors"));
    }
  },
};
