import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

// Zod Schema for validation
const verifyTokenSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = verifyTokenSchema.parse({ body });
    const { token } = validatedData.body;

    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    let user = await prisma.user.findUnique({ where: { uid } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          uid,
          email: email || "",
          name: name || null,
          photoURL: picture || null,
        },
      });
    }

    return NextResponse.json({ message: "Authenticated", user });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Token verification failed:", errorMessage);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
