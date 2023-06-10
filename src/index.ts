/** Injected at build-time, typed as string so it gets injected */
export const version = "[VI]{{inject}}[/VI]";

console.log(`Hello World from Sentry (built at ${version})`);
