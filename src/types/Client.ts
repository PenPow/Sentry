import { SentryClient } from "../lib/framework/structures/SentryClient.js";

declare global {
    // eslint-disable-next-line no-var
    var client: SentryClient<true>;
}