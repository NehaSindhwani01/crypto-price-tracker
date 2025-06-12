import jwt from "jsonwebtoken";

export function getSessionFromToken(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
}
