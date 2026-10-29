import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("pass", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin" },
    update: {},
    create: {
      email: "admin",
      name: "Administrator",
      passwordHash,
      role: "ADMINISTRATOR",
    },
  });

  const categories = [
    { slug: "technology", nameMn: "Технологи", order: 1 },
    { slug: "psychology", nameMn: "Сэтгэл зүй", order: 2 },
    { slug: "business", nameMn: "Бизнес", order: 3 },
    { slug: "lifestyle", nameMn: "Амьдралын хэв маяг", order: 4 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const menuItems = [
    { label: "Нүүр", url: "/", order: 1 },
    { label: "Сэтгүүл", url: "/category/technology", order: 2 },
    { label: "Нэмэлт", url: "/category/business", order: 3 },
    { label: "Тухай", url: "/about", order: 4 },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { label: item.label } });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
    }
  }

  const settings: Record<string, string> = {
    site_title: "Setguul.mn",
    site_tagline: "Curious. Mindful. Growth.",
    accent_color: "#F2C21C",
    footer_text: "© 2026 SETGUUL.MN. Бүх эрх хуулиар хамгаалагдсан.",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  console.log(`Seed амжилттай. Admin login: ${admin.email} / pass`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
