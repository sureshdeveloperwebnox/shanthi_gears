import { PrismaClient } from "@prisma/client";

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ["query", "info", "warn"],
  });
}

prisma = global.prisma;

export default prisma;
