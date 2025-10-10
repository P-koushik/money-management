import { NextResponse } from "next/server";

export async function POST() {
  try {
    // For Firebase auth, logout is handled on the client side
    // This endpoint can be used for any server-side cleanup if needed
    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Logout error:", errorMessage);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
