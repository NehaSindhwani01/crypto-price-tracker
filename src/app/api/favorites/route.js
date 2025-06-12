import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    await dbConnect();

    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); // ✅ FIXED HERE

    if (!user) {
      console.error("User not found for ID:", decoded.userId);
      return NextResponse.json({ favorites: [] }, { status: 404 });
    }

    return NextResponse.json({ favorites: user.favorites || [] }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/favorites:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); // ✅ FIXED HERE

    if (!user) {
      console.error("User not found for ID:", decoded.userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { coinId } = body;

    if (!coinId) {
      return NextResponse.json({ error: "coinId is required" }, { status: 400 });
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

    return NextResponse.json({ status, favorites: user.favorites }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/favorites:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
