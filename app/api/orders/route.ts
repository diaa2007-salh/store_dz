// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/format";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search } },
        { trackingCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          wilaya: true,
          commune: true,
          items: { include: { product: { select: { images: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, ...checkoutData } = body;

    // Validate checkout data
    const validatedData = checkoutSchema.parse(checkoutData);

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Fetch wilaya for shipping price
    const wilaya = await prisma.wilaya.findUnique({
      where: { id: validatedData.wilayaId },
    });

    if (!wilaya || !wilaya.isActive) {
      return NextResponse.json({ error: "Invalid or inactive wilaya" }, { status: 400 });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const shippingCost =
      validatedData.shippingType === "home"
        ? wilaya.homeDeliveryPrice
        : wilaya.deskDeliveryPrice;

    const total = subtotal + shippingCost;

    // Fetch commune
    const commune = validatedData.communeId
      ? await prisma.commune.findUnique({ where: { id: validatedData.communeId } })
      : null;

    // Build shipping address snapshot
    const shippingAddress = {
      wilayaCode: wilaya.code,
      wilayaNameAr: wilaya.nameAr,
      wilayaNameFr: wilaya.nameFr,
      commune: commune?.nameAr || "",
      communeId: validatedData.communeId,
      shippingType: validatedData.shippingType,
      fullAddress: validatedData.addressDetails || "",
    };

    // Get session for user link
    const session = await getSessionFromRequest(req);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.userId || null,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail || null,
        wilayaId: wilaya.id,
        communeId: validatedData.communeId || null,
        shippingType: validatedData.shippingType,
        addressDetails: validatedData.addressDetails || null,
        subtotal,
        shippingCost,
        total,
        status: "pending",
        shippingAddress,
        notes: validatedData.notes || null,
        items: {
          create: items.map((item: {
            productId: string;
            titleAr: string;
            titleFr: string;
            titleEn: string;
            price: number;
            quantity: number;
            imageUrl?: string;
          }) => ({
            productId: item.productId,
            titleAr: item.titleAr,
            titleFr: item.titleFr,
            titleEn: item.titleEn,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl || null,
          })),
        },
      },
      include: {
        items: true,
        wilaya: true,
        commune: true,
      },
    });

    // Update product stock counts
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockCount: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Order POST error:", error);
    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json({ error: "Validation error", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
