import { PrismaClient } from "@prisma/client";
import { fieldEncryptionMiddleware } from "prisma-field-encryption";
import { loadEnv } from "./env.js";

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:postgres@db:5432/sentry?schema=public"
        }
    }
});

prisma.$use(fieldEncryptionMiddleware({
    encryptionKey: loadEnv().PRISMA_ENCRYPTION_KEY
}));