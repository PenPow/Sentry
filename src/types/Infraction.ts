import { type Infraction } from "@prisma/client";
import { Snowflake } from "discord.js";

export type Case = Omit<Infraction, "id" | "createdAt" | "caseId" | "modLogMessageId" | "frozen" | "referenceId"> 
                   & { referenceId?: number | null; frozen?: boolean };

export type CaseWithReference = Infraction & { caseReference: Infraction | null };

export type NonTimedInfractions = "Kick" | "Softban" | "Unban" | "Untimeout"

export type UserLike = { username: string, id: Snowflake, iconUrl: string }