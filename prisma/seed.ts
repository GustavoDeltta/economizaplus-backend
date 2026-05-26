import "dotenv/config";
import { prisma } from "../src/infrastructure/prisma/client";

async function main() {
  const defaultCategories = [
    { id: "default-1", name: "Luz",        icon: "lightbulb-o",   color: "#FACC15", type: "default" },
    { id: "default-2", name: "Água",       icon: "tint",          color: "#38BDF8", type: "default" },
    { id: "default-3", name: "Internet",   icon: "wifi",          color: "#A78BFA", type: "default" },
    { id: "default-4", name: "Compras",    icon: "shopping-cart", color: "#34D399", type: "default" },
    { id: "default-5", name: "Transporte", icon: "car",           color: "#FB7185", type: "default" },
    { id: "default-6", name: "Comida",     icon: "cutlery",       color: "#F97316", type: "default" },
    { id: "default-7", name: "Saúde",      icon: "heartbeat",     color: "#EF4444", type: "default" },
  ]

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        userId: null,
      },
    })
  }

  console.log('Categorias padrão inseridas!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())