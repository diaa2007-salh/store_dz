// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFromRequest } from "@/lib/auth";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);
    const body = await req.json();
    const data = settingsSchema.parse(body);

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 400 });
  }
}
