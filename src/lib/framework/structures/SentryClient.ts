import { Client, ClientEvents, ClientOptions, Collection, RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js";
import { glob } from "glob";
import { ILogObj, Logger } from "tslog";
import { Command, PreconditionOption } from "./Command.js";
import { WrappedRegistry } from "../../types/ClientTypes.js";
import { Listener } from "./Listener.js";
import { loadEnv } from "../../../utilities/env.js";

// TODO:
// - Paginator
// - API Route Handler
// - Localization Handler (https://cdn.penpow.dev/go/typesafe-translations)
export class SentryClient<Ready extends boolean = boolean> extends Client<Ready> {
    public constructor(options: ClientOptions) {
        super(options);

        this.registries = {
            commands: new Collection(),
            listeners: new Collection(),
            aliases: new Collection(),
        };

        // TODO: In the future when adding prom/grafana
        // add an override to log it there unformatted
        this.logger = new Logger({
            name: "Sentry",
        });

        this.environment = loadEnv(this.logger);
    }

    public override async login(token?: string | undefined): Promise<string> {
        await Promise.all([this.loadCommands(), this.loadListeners()]);

        const result = await super.login(token);

        await this.registerCommands();

        return result;
    }

    private async registerCommands() {
        const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        const guildCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

        for(const command of this.registries.commands.values()) {
            const subcommands = command.toJSON();
            
            if(command.dev) {
                guildCommands.push(...subcommands);
            } else {
                commands.push(...subcommands);
            }
        }

        this.logger.debug(`Registering ${commands.length} commands`);

        await this.rest.put(Routes.applicationCommands(this.user!.id), { body: [...new Set(commands)] });
        await this.rest.put(Routes.applicationGuildCommands(this.user!.id, this.environment.DEVELOPMENT_GUILD_ID), { body: [...new Set(guildCommands)] });
    }

    private async loadCommands() {
        const files = await glob("./dist/commands/*.js");

        for (const file of files.filter((name) => !name.includes('map'))) {
            // eslint-disable-next-line node/no-unsupported-features/es-syntax
            const command = new ((await import(this.absoluteToRelative(file))).default) as Command;

            const json = command.toJSON();
            this.registries.commands.set(json.shift()!.name, command);

            for(const cmd of json) {
                this.registries.aliases.set(cmd.name, command);
            }
        }

        this.logger.debug(`Loaded ${this.registries.commands.size} commmands`);
    }

    private async loadListeners() {
        const files = [...await glob("./dist/listeners/*.js"), ...await glob("./dist/lib/framework/listeners/*.js")];

        for (const file of files.filter((name) => !name.includes('map'))) {
            // eslint-disable-next-line node/no-unsupported-features/es-syntax
            const listener = new ((await import(this.absoluteToRelative(file))).default) as Listener<keyof ClientEvents>;

            if(listener.once) {
                this.once(listener.event, async (...args) => void await listener.run(args));
            } else {
                this.on(listener.event, async (...args) => void await listener.run(args));
            }

            this.registries.listeners.set(listener.event, listener);
        }

        this.logger.debug(`Loaded ${this.registries.listeners.size} listeners`);
    }

    private absoluteToRelative(path: string) {
        return path.replace("dist/", "../../../");
    }
}

declare module 'discord.js' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    export interface Client {
        logger: Logger<ILogObj>;
        registries: WrappedRegistry;
        environment: ReturnType<typeof loadEnv>;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    export interface ClientEvents {
        commandError: [interaction: CommandInteraction, error: Error]
        modalError: [interaction: ModalSubmitInteraction, error: Error]
        autocompleteError: [interaction: AutocompleteInteraction, error: Error]
        preconditionFailed: [interaction: CommandInteraction, result: PreconditionOption]
    
        raw: [...data: any] // HACK: Stub
        voiceServerUpdate: [...data: any] // HACK: Stub
    }
}