// app/api/wilayas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") !== "false";

    const wilayas = await prisma.wilaya.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: { communes: { orderBy: { nameAr: "asc" } } },
      orderBy: { code: "asc" },
    });

    return NextResponse.json(wilayas);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);
    const body = await req.json();
    const { wilayas } = body; // Array of { id, homeDeliveryPrice, deskDeliveryPrice, isActive }

    const results = await Promise.all(
      wilayas.map((w: { id: string; homeDeliveryPrice: number; deskDeliveryPrice: number; isActive: boolean }) =>
        prisma.wilaya.update({
          where: { id: w.id },
          data: {
            homeDeliveryPrice: w.homeDeliveryPrice,
            deskDeliveryPrice: w.deskDeliveryPrice,
            isActive: w.isActive,
          },
        })
      )
    );

    return NextResponse.json({ success: true, updated: results.length });
  } catch {
    return NextResponse.json({ error: "Failed to update wilayas" }, { status: 500 });
  }
}
