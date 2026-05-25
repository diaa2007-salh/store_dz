// lib/validations/index.ts
import { z } from "zod";

export const phoneRegex = /^(05|06|07)[0-9]{8}$/;

export const checkoutSchema = z.object({
  customerName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  customerPhone: z.string().regex(phoneRegex, "رقم الهاتف غير صحيح (مثال: 0661234567)"),
  customerEmail: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  wilayaId: z.string().min(1, "الرجاء اختيار الولاية"),
  communeId: z.string().optional(),
  addressDetails: z.string().optional(),
  shippingType: z.enum(["home", "desk"]),
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  titleAr: z.string().min(2, "العنوان قصير"),
  titleFr: z.string().min(2, "Titre trop court"),
  titleEn: z.string().min(2, "Title too short"),
  descriptionAr: z.string().min(10),
  descriptionFr: z.string().min(10),
  descriptionEn: z.string().min(10),
  price: z.number().min(1, "السعر يجب أن يكون أكبر من 0"),
  compareAtPrice: z.number().optional().nullable(),
  stockCount: z.number().int().min(0),
  lowStockAlert: z.number().int().min(1).default(5),
  categoryId: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;

export const settingsSchema = z.object({
  storeNameAr: z.string().min(2),
  storeNameFr: z.string().min(2),
  storeNameEn: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const wilayaPriceSchema = z.object({
  homeDeliveryPrice: z.number().min(0),
  deskDeliveryPrice: z.number().min(0),
  isActive: z.boolean(),
});

export type WilayaPriceInput = z.infer<typeof wilayaPriceSchema>;

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور قصيرة"),
});

export type LoginInput = z.infer<typeof loginSchema>;
