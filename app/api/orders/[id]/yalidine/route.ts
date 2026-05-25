// app/api/orders/[id]/yalidine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFromRequest } from "@/lib/auth";
import { createYalidineParcel, buildYalidinePayload } from "@/lib/services/yalidineService";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminFromRequest(req);

    // Fetch full order data
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        wilaya: true,
        commune: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.trackingCode) {
      return NextResponse.json(
        { error: "Order already has a tracking code", trackingCode: order.trackingCode },
        { status: 400 }
      );
    }

    if (!["pending", "processing"].includes(order.status)) {
      return NextResponse.json(
        { error: "Only pending or processing orders can be shipped" },
        { status: 400 }
      );
    }

    // Build Yalidine payload
    const shippingAddress = order.shippingAddress as {
      wilayaCode: number;
      commune: string;
      shippingType: string;
    };

    const payload = buildYalidinePayload({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      addressDetails: order.addressDetails,
      total: order.total,
      shippingAddress,
      items: order.items.map((i) => ({ titleAr: i.titleAr, quantity: i.quantity })),
    });

    // Push to Yalidine API
    const yalidineResponse = await createYalidineParcel(payload);

    // Update order with tracking info
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        trackingCode: yalidineResponse.tracking,
        yalidineId: yalidineResponse.order_id,
        status: "processing",
      },
    });

    return NextResponse.json({
      success: true,
      trackingCode: yalidineResponse.tracking,
      yalidineId: yalidineResponse.order_id,
      labelUrl: yalidineResponse.label_url,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Yalidine push error:", error);
    const message = error instanceof Error ? error.message : "Failed to push to Yalidine";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
