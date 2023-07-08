import { AutocompleteFocusedOption } from "discord.js";
import { clamp } from "../utilities/Clamp.js";

const DEFAULT_REASONS = ["TOS Violation(s)", "NSFW", "Scam/Spam Account", "Harassment"]; // TODO: Expand to include more

export function reasonAutocompleteHandler(option: AutocompleteFocusedOption) {
    return option.value === ""
        ? DEFAULT_REASONS.map((reason) => ({
            name: reason,
            value: reason,
        }))
        : clamp(
            [
                { name: option.value, value: option.value },
                ...DEFAULT_REASONS.filter((reason) => reason.toLowerCase().startsWith(option.value.toLowerCase())).map((reason) => ({
                    name: reason,
                    value: reason,
                })),
            ],
            25
        );
}