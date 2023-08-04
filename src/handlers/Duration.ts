import { Duration } from "@sapphire/time-utilities";
import { ApplicationCommandOptionChoiceData, AutocompleteFocusedOption } from "discord.js";

const DURATIONS = [
    { name: 'Second', unit: 's'},
    { name: 'Minute', unit: 'm'},
    { name: 'Hour', unit: 'h'},
    { name: 'Day', unit: 'd'},
    { name: 'Week', unit: 'w'},
    { name: 'Month', unit: 'mo'}
] as const;

export function durationAutocompleteHandler(option: AutocompleteFocusedOption, maxDuration?: Duration): ApplicationCommandOptionChoiceData[] { 
  
    return option.value === ""
        ? []
        : DURATIONS.filter(({ unit }) => maxDuration ? new Duration(`${option.value}${unit}`).offset <= maxDuration.offset : true).map(({ name, unit }) => ({
            name: `${option.value} ${name}${option.value === '1' ? '' : 's'}`,
            value: `${option.value}${unit}`
        }));
}