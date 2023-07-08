import { Punishment } from "@prisma/client";

export type Case = Omit<Punishment, "id" | "createdAt" | "caseId" | "modLogMessageId" | "frozen" | "referenceId"> 
                   & { referenceId?: number | null; frozen?: boolean };

export type CaseWithReference = Punishment & { caseReference: Punishment | null };

export type NonTimedPunishments = "Kick" | "Softban" | "Unban" | "Untimeout"