import { AutocompleteFocusedOption } from "discord.js";
import { clamp } from "../utilities/Clamp.js";

const DEFAULT_REASONS = ["TOS Violation(s)", "NSFW", "Scam/Spam Account", "Harassment"]; // TODO: Expand to include more
const REMOVAL_REASONS = ["Appeal Accepted"]; // TODO: Expand

export function reasonAutocompleteHandler(option: AutocompleteFocusedOption, type: "Punishment" | "Removal" = "Punishment") {
    const reasons = type === "Punishment" ? DEFAULT_REASONS : REMOVAL_REASONS;
    
    return option.value === ""
        ? reasons.map((reason) => ({
            name: reason,
            value: reason,
        }))
        : clamp(
            [
                { name: option.value, value: option.value },
                ...reasons.filter((reason) => reason.toLowerCase().startsWith(option.value.toLowerCase())).map((reason) => ({
                    name: reason,
                    value: reason,
                })),
            ],
            25
        );
}