// app/api/wilayas/[id]/communes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communes = await prisma.commune.findMany({
      where: { wilayaId: params.id },
      orderBy: { nameAr: "asc" },
    });
    return NextResponse.json(communes);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
