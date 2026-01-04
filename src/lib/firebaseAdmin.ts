import "server-only";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
        // If environment variable is missing, fallback to local file for dev
        JSON.stringify(require("../../serviceAccountKey.json"))
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
  }
}

export const dbAdmin = admin.firestore();
