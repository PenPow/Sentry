import { ClientEvents } from "discord.js";
import { Listener } from "../lib/framework/structures/Listener.js";
import { prisma } from "../utilities/Prisma.js";

export default class VoiceStateUpdateListener implements Listener<"voiceStateUpdate"> {
    public readonly event = "voiceStateUpdate";
    public readonly once = false;

    public async run([oldState, newState]: ClientEvents["voiceStateUpdate"]) {
        if(oldState.channel || !newState.member) return;

        if(newState.serverMute || newState.serverDeaf) return;

        const cases = (await prisma.infraction.findMany({ 
            where: { 
                guildId: oldState.guild.id, 
                userId: newState.member.id, 
                action: { in: ["VMute", "Deafen"] }, 
            }
        }));

        // console.log(cases)

        // Filter out temp cases that have expired
        const filtered = cases
            .filter(({ expiration }) => expiration ? expiration.getTime() > new Date().getTime() : true)
            .filter(({ overturned }) => !overturned);

        if(filtered.length === 0) return;

        if(filtered.find(({ action }) => action === "Deafen")) await newState.member.edit({ mute: true, deaf: true });
        else await newState.member.edit({ mute: true });
    }
}