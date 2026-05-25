// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminFromRequest(req);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        wilaya: true,
        commune: true,
        user: { select: { email: true, firstName: true, lastName: true } },
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminFromRequest(req);
    const body = await req.json();

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: body.status,
        trackingCode: body.trackingCode,
        notes: body.notes,
      },
      include: { wilaya: true, commune: true, items: true },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
