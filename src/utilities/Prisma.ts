import { PrismaClient } from "@prisma/client";
import { fieldEncryptionExtension } from "prisma-field-encryption";
import { loadEnv } from "./env.js";

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:postgres@db:5432/sentry?schema=public"
        }
    }
}).$extends(fieldEncryptionExtension({ encryptionKey: loadEnv().PRISMA_ENCRYPTION_KEY }));