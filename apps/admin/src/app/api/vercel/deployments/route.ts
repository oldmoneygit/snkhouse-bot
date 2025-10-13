import { NextRequest, NextResponse } from "next/server";
import { vercelAPI } from "@/lib/vercel-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("📥 Fetching Vercel deployments...");

    const deployments = await vercelAPI.getDeployments(limit);

    console.log(`✅ Fetched ${deployments.length} deployments`);

    return NextResponse.json({
      success: true,
      deployments,
      count: deployments.length,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("❌ Error in /api/vercel/deployments:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        deployments: [],
        count: 0,
      },
      { status: 500 },
    );
  }
}
