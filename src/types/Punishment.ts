import { Punishment } from "@prisma/client";
import { Snowflake } from "discord.js";

export type Case = Omit<Punishment, "id" | "createdAt" | "caseId" | "modLogMessageId" | "frozen" | "referenceId"> 
                   & { referenceId?: number | null; frozen?: boolean };

export type CaseWithReference = Punishment & { caseReference: Punishment | null };

export type NonTimedPunishments = "Kick" | "Softban" | "Unban" | "Untimeout"

export type UserLike = { username: string, id: Snowflake, iconUrl: string }