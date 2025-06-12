import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight request
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers,
  });
}

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();
    console.log("Login body:", { email, password });

    if (typeof email !== "string" || typeof password !== "string") {
      return new Response(JSON.stringify({ error: "Invalid input types" }), {
        status: 400,
        headers,
      });
    }

    const user = await User.findOne({ email });
    console.log("Found user:", user);

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers,
      });
    }

    if (!process.env.JWT_SECRET) {
      return new Response(JSON.stringify({ error: "JWT secret missing" }), {
        status: 500,
        headers,
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Set token in HTTP-only cookie
    cookies().set("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return new Response(JSON.stringify({ message: "Login successful" }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return new Response(JSON.stringify({ error: "Login failed" }), {
      status: 500,
      headers,
    });
  }
}
