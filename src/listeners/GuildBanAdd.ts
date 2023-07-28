import { ClientEvents } from "discord.js";
import { Listener } from "../lib/framework/structures/Listener.js";
import { PunishmentLock, createCase } from "../utilities/Punishments.js";

export default class GuildBanAddListener implements Listener<"guildBanAdd"> {
    public readonly event = "guildBanAdd";
    public readonly once = false;

    public async run([ban]: ClientEvents["guildBanAdd"]) {
        const { user } = ban;

        await PunishmentLock.acquire(`punishment-${user.id}`, async () => {
            await createCase(ban.guild, {
                guildId: ban.guild.id,
                reason: `Manual Punishment`,
                duration: null,
                moderatorId: ban.client.user.id,
                moderatorName: "Manual Punishment",
                moderatorIconUrl: ban.client.user.displayAvatarURL(),
                action: "Ban",
                userId: user.id,
                userName: user.username,
                referenceId: null
            }, { dm: false, dry: true });
        });
    }
}