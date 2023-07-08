import { AutocompleteFocusedOption, Snowflake } from "discord.js";
import { clamp } from "../utilities/Clamp.js";
import { prisma } from "../utilities/Prisma.js";

export async function referenceAutocompleteHandler(guildId: Snowflake, option: AutocompleteFocusedOption) {
    const cases = (await prisma.guild.findUnique({ where: { id: guildId }, include: { cases: true }}))?.cases ?? [];
    
    return cases.length === 0
        ? [{ name: "No Cases Found", value: -1 }]
        : clamp(
            cases
                .filter((modCase) => modCase.caseId.toString().startsWith(option.value))
                .map((modCase) => ({ name: `#${modCase.caseId}`, value: modCase.caseId })),
            25
        );
}