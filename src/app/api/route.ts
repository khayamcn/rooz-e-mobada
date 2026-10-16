import { NextResponse } from "next/server";

// This is a demo API route. Static export requires explicit static mode.
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}
