import { NextResponse } from "next/server";
import { z } from "zod";

import {
  applySessionCookie,
  createSessionToken,
  hashPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be at most 100 characters long")
    .transform((value) => value.trim())
    .optional(),
  email: z
    .string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Please provide a valid email address")
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { email, password, name } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name ?? null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  const response = NextResponse.json({ user }, { status: 201 });
  applySessionCookie(response, token);

  return response;
}
