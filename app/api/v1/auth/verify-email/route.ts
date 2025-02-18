import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * Handles the POST request to verify an email address.
 * 
 * This function expects a JSON body containing an `email` field. It generates a 
 * verification token and sets an expiration time for the token. The token and 
 * expiration time are then saved to the user's record in the database.
 * 
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object containing the result of the operation.
 * 
 * @throws {Error} - If there is an error processing the request or interacting with the database.
 * 
 * Response:
 * - 200: If the email verification token is successfully generated and saved.
 * - 400: If the email is not provided in the request body.
 * - 404: If the user is not found or there is a database error.
 * - 500: If there is an unknown error processing the request.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestBody = await request.json();
    const { email } = requestBody;
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const token = uuidv4();
    const expire = new Date(Date.now() + 3600 * 1000 * (Number(process.env.EMAIL_TOKEN_EXPIRATION_TIME) || 1));

    try {
      const user = await db.user.update({
        where: { email },
        data: { 
          emailVerificationToken: token,
          emailVerificationExpiry: expire 
        },
      });

      return NextResponse.json({
        success: true,
        token: user.emailVerificationToken
      });
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: "User not found or database error" 
        },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error("Endpoint error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}