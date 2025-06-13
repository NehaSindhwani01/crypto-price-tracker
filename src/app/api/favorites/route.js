import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    const token = (await cookies()).get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { favorites: user.favorites || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/favorites error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const token = (await cookies()).get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { coinId } = await req.json();
    if (!coinId) {
      return NextResponse.json(
        { error: "coinId is required" },
        { status: 400 }
      );
    }

    let status;
    if (user.favorites.includes(coinId)) {
      user.favorites = user.favorites.filter((id) => id !== coinId);
      status = "removed";
    } else {
      user.favorites.push(coinId);
      status = "added";
    }

    await user.save();

    return NextResponse.json(
      { status, favorites: user.favorites },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/favorites error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}