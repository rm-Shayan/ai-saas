// lib/helpers/verify-jwt.ts (Corrected)

import jwt from "jsonwebtoken";
// Remove this unused and confusing import
// import { decode } from "punycode"; 
import { IInvestorDocument } from "@/types/model.types";

/**
 * Verifies a JWT token using the provided secret.
 * Note: Changed to return a Promise<T> to match the 'await' usage in proxy.ts.
 * @param token JWT token string
 * @param secret Secret key to verify the token
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export async function verifyToken<T = IInvestorDocument>(
  token: string,
  secret: string
): Promise<T> {
  // Wrap the synchronous jwt.verify in a promise to match the async handler
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        // If verification fails (expired, invalid signature, etc.)
        // Reject the promise with a clear error message.
        console.error("JWT Verify Error:", err.message);
        return reject(new Error("Unauthorized: Invalid or expired token."));
      }

      // If verification succeeds, resolve the promise with the decoded payload
      console.log("Decoded JWT Payload:", decoded); // Now you log the correct variable!
      resolve(decoded as T);
    });
  });
}