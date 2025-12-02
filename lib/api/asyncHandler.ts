import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./ApiError";
import { ApiResponse } from "./ApiResponse";

// Define the type for your controller function
type RouteHandler = (req: NextRequest, context?: any) => Promise<NextResponse | ApiResponse>;

/**
 * A utility wrapper for Next.js Route Handlers that handles
 * asynchronous operations, error catching, and standardizes responses.
 *
 * It automatically handles:
 * 1. Success responses returned as 'ApiResponse' objects.
 * 2. Errors thrown as 'ApiError' objects.
 * 3. Common Mongoose errors (Validation and Duplicate Key).
 * 4. Generic internal server errors (500).
 *
 * @param handler The actual controller function (req, context) => Promise<NextResponse | ApiResponse>
 * @returns An async function that Next.js can execute
 */
export const asynchandler = (handler: RouteHandler) => {
  return async (req: NextRequest, context?: any) => {
    try {
      // Execute the actual controller logic
       
      const result = await handler(req, context);

      // --- NEW LOGIC: Handle ApiResponse Success Objects ---
      if (result instanceof ApiResponse) {
        // If the controller returns an ApiResponse, structure the response
        // using its properties and convert it to a Next.js NextResponse object.
        return NextResponse.json(
          {
            success: result.success,
            message: result.message,
            data: result.data,
          },
          { status: result.statusCode }
        );
      }

      // If it's a standard NextResponse (or anything else), just return it
      return result as NextResponse;

    } catch (error: any) {
      console.error("API Error caught by handler:", error);

      // 1. Handle Custom ApiError (manually thrown)
      if (error instanceof ApiError) {
        return NextResponse.json(
          { success: false, message: error.message, errors: error.errors || [] },
          { status: error.statusCode }
        );
      }

      // 2. Handle Mongoose Duplicate Key Error (E.g., duplicate email)
      if (error.code === 11000 && error.keyValue) {
        const field = Object.keys(error.keyValue)[0];
        return NextResponse.json(
          { success: false, message: `Duplicate value entered for ${field}.` },
          { status: 409 } // Conflict
        );
      }

      // 3. Handle Mongoose Validation Errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map(
          (val: any) => val.message
        );
        return NextResponse.json(
          { success: false, message: "Validation Error", errors: messages },
          { status: 400 } // Bad Request
        );
      }

      // 4. Handle Generic/Unknown Errors
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Internal Server Error",
        },
        { status: 500 }
      );
    }
  };
};