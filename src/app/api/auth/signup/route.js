import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// CORS Preflight Handler
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// POST Handler for Signup
export async function POST(req) {
  try {
    const { name, email, password } = await req.json();


    // Validate input
    if (!name || !email || !password || typeof password !== "string") {
      return Response.json({ error: "Invalid input" }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ error: "User already exists" }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return Response.json({ message: "User created" }, {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return Response.json({ error: "Internal Server Error" }, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
