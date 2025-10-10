import { env } from "@/config/env";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebaseAdmin.projectId,
      clientEmail: env.firebaseAdmin.clientEmail,
      privateKey: env.firebaseAdmin.privateKey?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = admin.auth();
