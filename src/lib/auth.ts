import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";

const BCRYPT_SALT_ROUNDS = 12;
const { cookieName, cookieMaxAge, jwtSecret } = env.auth;

function requireJwtSecret(): string {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
}

export type SessionTokenPayload = {
  userId: string;
  email: string;
  name?: string | null;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function createSessionToken(payload: SessionTokenPayload): string {
  return jwt.sign(payload, requireJwtSecret(), {
    expiresIn: cookieMaxAge,
  });
}

export function parseSessionToken(token: string): SessionTokenPayload | null {
  try {
    return jwt.verify(token, requireJwtSecret()) as SessionTokenPayload;
  } catch (error) {
    console.error("Failed to verify session token", error);
    return null;
  }
}

export function applySessionCookie(
  response: NextResponse,
  token: string,
): NextResponse {
  response.cookies.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: cookieMaxAge,
  });

  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: cookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function getSessionFromCookies(): Promise<SessionTokenPayload | null> {
  const store = cookies();
  const token = store.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  return parseSessionToken(token);
}

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSessionFromCookies();

  if (!session?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  return user;
}
