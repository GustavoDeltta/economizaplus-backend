import "dotenv/config";
import { prisma } from "../src/infrastructure/prisma/client";

async function main() {
  const defaultCategories = [
    { name: "Luz", icon: "lightbulb-o", color: "#FACC15", type: "default" },
    { name: "Água", icon: "tint", color: "#38BDF8", type: "default" },
    { name: "Internet", icon: "wifi", color: "#A78BFA", type: "default" },
    {
      name: "Compras",
      icon: "shopping-cart",
      color: "#34D399",
      type: "default",
    },
    { name: "Transporte", icon: "car", color: "#FB7185", type: "default" },
    { name: "Comida", icon: "cutlery", color: "#F97316", type: "default" },
    { name: "Saúde", icon: "heartbeat", color: "#EF4444", type: "default" },
    {
      name: "Fatura do Cartão",
      icon: "credit-card",
      color: "#6366F1",
      type: "default",
    },
  ];

  for (const category of defaultCategories) {
    const exists = await prisma.category.findFirst({
      where: { name: category.name, userId: null },
    });
    if (!exists) {
      await prisma.category.create({ data: category });
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
