import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ACHIEVEMENTS = [
  {
    key: "7_day_study_streak",
    title: "7-Day Study Streak",
    description: "Logged a study session on 7 consecutive days.",
    icon: "flame",
    xpReward: 100,
  },
  {
    key: "hydration_master",
    title: "Hydration Master",
    description: "Hit your daily water goal 7 days in a row.",
    icon: "droplets",
    xpReward: 75,
  },
  {
    key: "sleep_champion",
    title: "Sleep Champion",
    description: "Averaged 8+ hours of sleep over a full week.",
    icon: "moon",
    xpReward: 75,
  },
  {
    key: "productivity_pro",
    title: "Productivity Pro",
    description: "Completed every task due in a single week.",
    icon: "trophy",
    xpReward: 100,
  },
] as const;

async function main() {
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`Seeded ${ACHIEVEMENTS.length} achievements.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
