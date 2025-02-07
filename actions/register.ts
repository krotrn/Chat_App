"use server";

import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { registerSchema } from "@/schemas/registerSchema";
import { NextResponse } from "next/server";
import { z } from "zod";

export const register = async (credentials: z.infer<typeof registerSchema>) => {
  const parsedData = registerSchema.safeParse(credentials);

  if (!parsedData.success) {
    return NextResponse.json(
      new ApiResponse({ statusCode: 400, message: "Invalid Field" })
    );
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedData.data),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError({ statusCode: res.status, message: data.message });
    }

    return data; // Successfully registered
  } catch (error) {
    return NextResponse.json(
      new ApiResponse({ statusCode: 500, message: (error as Error).message })
    );
  }
};
