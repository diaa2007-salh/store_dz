// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const wilayas = [
  { code: 1,  nameAr: "أدرار",          nameFr: "Adrar",          nameEn: "Adrar",          home: 700, desk: 450 },
  { code: 2,  nameAr: "الشلف",          nameFr: "Chlef",           nameEn: "Chlef",           home: 400, desk: 250 },
  { code: 3,  nameAr: "الأغواط",        nameFr: "Laghouat",        nameEn: "Laghouat",        home: 500, desk: 300 },
  { code: 4,  nameAr: "أم البواقي",     nameFr: "Oum El Bouaghi",  nameEn: "Oum El Bouaghi",  home: 450, desk: 270 },
  { code: 5,  nameAr: "باتنة",          nameFr: "Batna",           nameEn: "Batna",           home: 450, desk: 270 },
  { code: 6,  nameAr: "بجاية",          nameFr: "Béjaïa",          nameEn: "Bejaia",          home: 450, desk: 270 },
  { code: 7,  nameAr: "بسكرة",          nameFr: "Biskra",          nameEn: "Biskra",          home: 500, desk: 300 },
  { code: 8,  nameAr: "بشار",           nameFr: "Béchar",          nameEn: "Bechar",          home: 700, desk: 450 },
  { code: 9,  nameAr: "البليدة",        nameFr: "Blida",           nameEn: "Blida",           home: 350, desk: 200 },
  { code: 10, nameAr: "البويرة",        nameFr: "Bouira",          nameEn: "Bouira",          home: 400, desk: 250 },
  { code: 11, nameAr: "تمنراست",        nameFr: "Tamanrasset",     nameEn: "Tamanrasset",     home: 800, desk: 550 },
  { code: 12, nameAr: "تبسة",           nameFr: "Tébessa",         nameEn: "Tebessa",         home: 500, desk: 300 },
  { code: 13, nameAr: "تلمسان",         nameFr: "Tlemcen",         nameEn: "Tlemcen",         home: 450, desk: 270 },
  { code: 14, nameAr: "تيارت",          nameFr: "Tiaret",          nameEn: "Tiaret",          home: 450, desk: 270 },
  { code: 15, nameAr: "تيزي وزو",       nameFr: "Tizi Ouzou",      nameEn: "Tizi Ouzou",      home: 400, desk: 250 },
  { code: 16, nameAr: "الجزائر",        nameFr: "Alger",           nameEn: "Algiers",         home: 300, desk: 150 },
  { code: 17, nameAr: "الجلفة",         nameFr: "Djelfa",          nameEn: "Djelfa",          home: 500, desk: 300 },
  { code: 18, nameAr: "جيجل",           nameFr: "Jijel",           nameEn: "Jijel",           home: 450, desk: 270 },
  { code: 19, nameAr: "سطيف",           nameFr: "Sétif",           nameEn: "Setif",           home: 400, desk: 250 },
  { code: 20, nameAr: "سعيدة",          nameFr: "Saïda",           nameEn: "Saida",           home: 450, desk: 270 },
  { code: 21, nameAr: "سكيكدة",         nameFr: "Skikda",          nameEn: "Skikda",          home: 450, desk: 270 },
  { code: 22, nameAr: "سيدي بلعباس",    nameFr: "Sidi Bel Abbès",  nameEn: "Sidi Bel Abbes",  home: 450, desk: 270 },
  { code: 23, nameAr: "عنابة",          nameFr: "Annaba",          nameEn: "Annaba",          home: 450, desk: 270 },
  { code: 24, nameAr: "قالمة",          nameFr: "Guelma",          nameEn: "Guelma",          home: 450, desk: 270 },
  { code: 25, nameAr: "قسنطينة",        nameFr: "Constantine",     nameEn: "Constantine",     home: 400, desk: 250 },
  { code: 26, nameAr: "المدية",         nameFr: "Médéa",           nameEn: "Medea",           home: 400, desk: 250 },
  { code: 27, nameAr: "مستغانم",        nameFr: "Mostaganem",      nameEn: "Mostaganem",      home: 400, desk: 250 },
  { code: 28, nameAr: "المسيلة",        nameFr: "M'Sila",          nameEn: "Msila",           home: 450, desk: 270 },
  { code: 29, nameAr: "معسكر",          nameFr: "Mascara",         nameEn: "Mascara",         home: 450, desk: 270 },
  { code: 30, nameAr: "ورقلة",          nameFr: "Ouargla",         nameEn: "Ouargla",         home: 600, desk: 400 },
  { code: 31, nameAr: "وهران",          nameFr: "Oran",            nameEn: "Oran",            home: 350, desk: 200 },
  { code: 32, nameAr: "البيض",          nameFr: "El Bayadh",       nameEn: "El Bayadh",       home: 550, desk: 350 },
  { code: 33, nameAr: "إليزي",          nameFr: "Illizi",          nameEn: "Illizi",          home: 900, desk: 650 },
  { code: 34, nameAr: "برج بوعريريج",   nameFr: "Bordj Bou Arréridj", nameEn: "Bordj Bou Arreridj", home: 450, desk: 270 },
  { code: 35, nameAr: "بومرداس",        nameFr: "Boumerdès",       nameEn: "Boumerdes",       home: 350, desk: 200 },
  { code: 36, nameAr: "الطارف",         nameFr: "El Tarf",         nameEn: "El Tarf",         home: 500, desk: 300 },
  { code: 37, nameAr: "تندوف",          nameFr: "Tindouf",         nameEn: "Tindouf",         home: 900, desk: 650 },
  { code: 38, nameAr: "تيسمسيلت",       nameFr: "Tissemsilt",      nameEn: "Tissemsilt",      home: 450, desk: 270 },
  { code: 39, nameAr: "الوادي",         nameFr: "El Oued",         nameEn: "El Oued",         home: 600, desk: 400 },
  { code: 40, nameAr: "خنشلة",          nameFr: "Khenchela",       nameEn: "Khenchela",       home: 500, desk: 300 },
  { code: 41, nameAr: "سوق أهراس",      nameFr: "Souk Ahras",      nameEn: "Souk Ahras",      home: 500, desk: 300 },
  { code: 42, nameAr: "تيبازة",         nameFr: "Tipaza",          nameEn: "Tipaza",          home: 350, desk: 200 },
  { code: 43, nameAr: "ميلة",           nameFr: "Mila",            nameEn: "Mila",            home: 450, desk: 270 },
  { code: 44, nameAr: "عين الدفلى",     nameFr: "Aïn Defla",       nameEn: "Ain Defla",       home: 400, desk: 250 },
  { code: 45, nameAr: "النعامة",        nameFr: "Naâma",           nameEn: "Naama",           home: 550, desk: 350 },
  { code: 46, nameAr: "عين تيموشنت",    nameFr: "Aïn Témouchent",  nameEn: "Ain Temouchent",  home: 400, desk: 250 },
  { code: 47, nameAr: "غرداية",         nameFr: "Ghardaïa",        nameEn: "Ghardaia",        home: 600, desk: 400 },
  { code: 48, nameAr: "غليزان",         nameFr: "Relizane",        nameEn: "Relizane",        home: 400, desk: 250 },
  { code: 49, nameAr: "تيميمون",        nameFr: "Timimoun",        nameEn: "Timimoun",        home: 750, desk: 500 },
  { code: 50, nameAr: "برج باجي مختار", nameFr: "Bordj Badji Mokhtar", nameEn: "Bordj Badji Mokhtar", home: 950, desk: 700 },
  { code: 51, nameAr: "أولاد جلال",     nameFr: "Ouled Djellal",   nameEn: "Ouled Djellal",   home: 550, desk: 350 },
  { code: 52, nameAr: "بني عباس",       nameFr: "Béni Abbès",      nameEn: "Beni Abbes",      home: 750, desk: 500 },
  { code: 53, nameAr: "عين صالح",       nameFr: "In Salah",        nameEn: "In Salah",        home: 800, desk: 550 },
  { code: 54, nameAr: "عين قزام",       nameFr: "In Guezzam",      nameEn: "In Guezzam",      home: 950, desk: 700 },
  { code: 55, nameAr: "تقرت",           nameFr: "Touggourt",       nameEn: "Touggourt",       home: 600, desk: 400 },
  { code: 56, nameAr: "جانت",           nameFr: "Djanet",          nameEn: "Djanet",          home: 950, desk: 700 },
  { code: 57, nameAr: "المغير",         nameFr: "El M'Ghair",      nameEn: "El Mghair",       home: 600, desk: 400 },
  { code: 58, nameAr: "المنيعة",        nameFr: "El Meniaa",       nameEn: "El Meniaa",       home: 700, desk: 450 },
];

const communesData: Record<number, { nameAr: string; nameFr: string; nameEn: string }[]> = {
  16: [
    { nameAr: "الجزائر الوسطى", nameFr: "Alger Centre", nameEn: "Algiers Center" },
    { nameAr: "باب الوادي",    nameFr: "Bab El Oued",   nameEn: "Bab El Oued" },
    { nameAr: "الحراش",        nameFr: "El Harrach",     nameEn: "El Harrach" },
    { nameAr: "بن عكنون",      nameFr: "Ben Aknoun",     nameEn: "Ben Aknoun" },
    { nameAr: "بوزريعة",       nameFr: "Bouzareah",      nameEn: "Bouzareah" },
    { nameAr: "دار البيضاء",   nameFr: "Dar El Beïda",   nameEn: "Dar El Beida" },
    { nameAr: "الدويرة",       nameFr: "Douéra",         nameEn: "Douera" },
    { nameAr: "القبة",         nameFr: "El Biar",        nameEn: "El Biar" },
    { nameAr: "المحمدية",      nameFr: "Mohammadia",     nameEn: "Mohammadia" },
    { nameAr: "برج البحري",    nameFr: "Bordj El Bahri", nameEn: "Bordj El Bahri" },
  ],
  31: [
    { nameAr: "وهران",          nameFr: "Oran",           nameEn: "Oran" },
    { nameAr: "السانيا",        nameFr: "Es Sénia",       nameEn: "Es Senia" },
    { nameAr: "بئر الجير",      nameFr: "Bir El Djir",    nameEn: "Bir El Djir" },
    { nameAr: "عين الترك",      nameFr: "Aïn El Turk",    nameEn: "Ain El Turk" },
    { nameAr: "مرسى الكبير",    nameFr: "Mers El Kébir",  nameEn: "Mers El Kebir" },
  ],
  25: [
    { nameAr: "قسنطينة",        nameFr: "Constantine",    nameEn: "Constantine" },
    { nameAr: "حامة بوزيان",    nameFr: "Hamma Bouziane", nameEn: "Hamma Bouziane" },
    { nameAr: "إبن زياد",       nameFr: "Ibn Ziad",       nameEn: "Ibn Ziad" },
    { nameAr: "الخروب",         nameFr: "El Khroub",      nameEn: "El Khroub" },
    { nameAr: "عين عبيد",       nameFr: "Aïn Abid",       nameEn: "Ain Abid" },
  ],
  9: [
    { nameAr: "البليدة",        nameFr: "Blida",          nameEn: "Blida" },
    { nameAr: "الأربعاء",       nameFr: "Larbaa",         nameEn: "Larbaa" },
    { nameAr: "بوفاريك",        nameFr: "Boufarik",       nameEn: "Boufarik" },
    { nameAr: "بني تامو",       nameFr: "Beni Tamou",     nameEn: "Beni Tamou" },
    { nameAr: "الشفة",          nameFr: "Chiffa",         nameEn: "Chiffa" },
  ],
  19: [
    { nameAr: "سطيف",           nameFr: "Sétif",          nameEn: "Setif" },
    { nameAr: "عين ولمان",      nameFr: "Ain Oulmene",    nameEn: "Ain Oulmene" },
    { nameAr: "بوقاعة",         nameFr: "Bougaa",         nameEn: "Bougaa" },
    { nameAr: "الأمير عبد القادر", nameFr: "El Eulma",    nameEn: "El Eulma" },
  ],
};

async function main() {
  console.log("🌱 Starting database seed...");

  // Seed wilayas
  for (const w of wilayas) {
    const wilaya = await prisma.wilaya.upsert({
      where: { code: w.code },
      update: {
        homeDeliveryPrice: w.home,
        deskDeliveryPrice: w.desk,
      },
      create: {
        code: w.code,
        nameAr: w.nameAr,
        nameFr: w.nameFr,
        nameEn: w.nameEn,
        homeDeliveryPrice: w.home,
        deskDeliveryPrice: w.desk,
        isActive: true,
      },
    });

    // Seed communes for wilaya
    const communes = communesData[w.code] || [
      { nameAr: `مركز ${w.nameAr}`, nameFr: `${w.nameFr} Centre`, nameEn: `${w.nameEn} Center` },
    ];

    for (const c of communes) {
      const existing = await prisma.commune.findFirst({
        where: { wilayaId: wilaya.id, nameAr: c.nameAr },
      });
      if (!existing) {
        await prisma.commune.create({
          data: {
            nameAr: c.nameAr,
            nameFr: c.nameFr,
            nameEn: c.nameEn,
            wilayaId: wilaya.id,
          },
        });
      }
    }
  }
  console.log("✅ Seeded 58 wilayas and communes");

  // Seed settings
  await prisma.settings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      storeNameAr: "متجر الجزائر",
      storeNameFr: "Boutique Algérie",
      storeNameEn: "Algeria Store",
      email: "contact@dz-store.dz",
      phone: "0555 00 00 00",
      whatsapp: "0555000000",
      address: "الجزائر العاصمة، الجزائر",
    },
  });
  console.log("✅ Seeded global settings");

  // Seed admin user
  const passwordHash = await bcrypt.hash("Admin@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@dz-store.dz" },
    update: {},
    create: {
      email: "admin@dz-store.dz",
      passwordHash,
      firstName: "مدير",
      lastName: "المتجر",
      phone: "0555000000",
      role: "admin",
    },
  });
  console.log("✅ Seeded admin user: admin@dz-store.dz / Admin@123");

  // Seed categories
  const cats = [
    { nameAr: "الإلكترونيات",   nameFr: "Électronique",    nameEn: "Electronics",   slug: "electronics" },
    { nameAr: "الملابس",        nameFr: "Vêtements",       nameEn: "Clothing",       slug: "clothing" },
    { nameAr: "المنزل والحديقة",nameFr: "Maison & Jardin",  nameEn: "Home & Garden",  slug: "home-garden" },
    { nameAr: "الرياضة",        nameFr: "Sport",           nameEn: "Sports",         slug: "sports" },
    { nameAr: "الجمال والعناية",nameFr: "Beauté & Soins",   nameEn: "Beauty & Care",  slug: "beauty" },
  ];
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, sortOrder: i },
    });
  }
  console.log("✅ Seeded categories");

  // Seed sample products
  const categories = await prisma.category.findMany();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const products = [
    {
      titleAr: "سماعات لاسلكية بلوتوث",
      titleFr: "Casque Bluetooth Sans Fil",
      titleEn: "Wireless Bluetooth Headphones",
      descriptionAr: "سماعات عالية الجودة مع خاصية إلغاء الضوضاء وعمر بطارية يصل إلى 30 ساعة",
      descriptionFr: "Casque de haute qualité avec suppression de bruit active et jusqu'à 30h de batterie",
      descriptionEn: "Premium quality headphones with active noise cancellation and up to 30h battery life",
      price: 4500, compareAtPrice: 5500, stockCount: 25, categoryId: catMap["electronics"],
      images: ["/images/headphones.jpg"], isFeatured: true,
    },
    {
      titleAr: "هاتف ذكي - 128GB",
      titleFr: "Smartphone 128GB",
      titleEn: "Smartphone 128GB",
      descriptionAr: "هاتف ذكي بشاشة AMOLED بدقة عالية، كاميرا 64 ميجابكسل وذاكرة 128GB",
      descriptionFr: "Smartphone écran AMOLED HD, caméra 64MP et 128GB de stockage",
      descriptionEn: "Smartphone with AMOLED HD display, 64MP camera and 128GB storage",
      price: 65000, compareAtPrice: 72000, stockCount: 8, categoryId: catMap["electronics"],
      images: ["/images/phone.jpg"], isFeatured: true,
    },
    {
      titleAr: "حذاء رياضي - قياس 42",
      titleFr: "Chaussures de Sport T.42",
      titleEn: "Sports Shoes Size 42",
      descriptionAr: "حذاء رياضي مريح لركض والتمارين اليومية، مصنوع من مواد عالية الجودة",
      descriptionFr: "Chaussures confortables pour la course et les exercices quotidiens",
      descriptionEn: "Comfortable shoes for running and daily workouts, made from premium materials",
      price: 3200, compareAtPrice: null, stockCount: 3, categoryId: catMap["sports"],
      images: ["/images/shoes.jpg"], isFeatured: false,
    },
    {
      titleAr: "ساعة ذكية",
      titleFr: "Montre Connectée",
      titleEn: "Smartwatch",
      descriptionAr: "ساعة ذكية تتبع نشاطك الرياضي، نبضات القلب ومستوى الأكسجين في الدم",
      descriptionFr: "Montre intelligente avec suivi d'activité, fréquence cardiaque et SpO2",
      descriptionEn: "Smart watch tracking your fitness, heart rate and blood oxygen level",
      price: 8900, compareAtPrice: 10500, stockCount: 15, categoryId: catMap["electronics"],
      images: ["/images/watch.jpg"], isFeatured: true,
    },
    {
      titleAr: "كريم ترطيب البشرة",
      titleFr: "Crème Hydratante Visage",
      titleEn: "Face Moisturizing Cream",
      descriptionAr: "كريم ترطيب طبيعي للبشرة يحتوي على الألوفيرا وفيتامين E",
      descriptionFr: "Crème hydratante naturelle avec aloé vera et vitamine E",
      descriptionEn: "Natural moisturizing cream with aloe vera and vitamin E",
      price: 1200, compareAtPrice: null, stockCount: 50, categoryId: catMap["beauty"],
      images: ["/images/cream.jpg"], isFeatured: false,
    },
    {
      titleAr: "طقم مطبخ - 12 قطعة",
      titleFr: "Set de Cuisine 12 Pièces",
      titleEn: "Kitchen Set - 12 Pieces",
      descriptionAr: "طقم أدوات مطبخ متكامل من الستانلس ستيل عالي الجودة",
      descriptionFr: "Ensemble d'ustensiles de cuisine en acier inoxydable haute qualité",
      descriptionEn: "Complete kitchen utensil set in high-quality stainless steel",
      price: 5800, compareAtPrice: 7000, stockCount: 0, categoryId: catMap["home-garden"],
      images: ["/images/kitchen.jpg"], isFeatured: false,
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log("✅ Seeded sample products");

  // Seed sample orders
  const algiers = await prisma.wilaya.findFirst({ where: { code: 16 } });
  const commune = await prisma.commune.findFirst({ where: { wilayaId: algiers!.id } });
  const product = await prisma.product.findFirst();

  const ts = Date.now();
  await prisma.order.create({
    data: {
      orderNumber: `ORD-${ts}-A1B2`,
      customerName: "أحمد بوعلام",
      customerPhone: "0661234567",
      customerEmail: "ahmed@example.com",
      wilayaId: algiers!.id,
      communeId: commune!.id,
      shippingType: "home",
      subtotal: 4500,
      shippingCost: 300,
      total: 4800,
      status: "pending",
      shippingAddress: {
        wilayaCode: 16,
        wilayaNameAr: "الجزائر",
        commune: "الجزائر الوسطى",
        shippingType: "home",
        fullAddress: "شارع ديدوش مراد، الجزائر",
      },
      items: {
        create: [{
          productId: product!.id,
          titleAr: product!.titleAr,
          titleFr: product!.titleFr,
          titleEn: product!.titleEn,
          price: product!.price,
          quantity: 1,
        }],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: `ORD-${ts + 1000}-C3D4`,
      customerName: "فاطمة زهراء",
      customerPhone: "0551234567",
      wilayaId: algiers!.id,
      communeId: commune!.id,
      shippingType: "desk",
      subtotal: 8900,
      shippingCost: 150,
      total: 9050,
      status: "shipped",
      trackingCode: "YAL-2024-98765",
      shippingAddress: {
        wilayaCode: 16,
        wilayaNameAr: "الجزائر",
        commune: "باب الوادي",
        shippingType: "desk",
        fullAddress: "مكتب يالدين، باب الوادي",
      },
      items: {
        create: [{
          productId: product!.id,
          titleAr: "ساعة ذكية",
          titleFr: "Montre Connectée",
          titleEn: "Smartwatch",
          price: 8900,
          quantity: 1,
        }],
      },
    },
  });

  console.log("✅ Seeded sample orders");
  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
