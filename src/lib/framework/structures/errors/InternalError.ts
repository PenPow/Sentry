export class InternalError extends Error {
    public context: string | undefined;

    public constructor(message: string, context?: string) {
        super(message);

        this.context = context;
        
        this.name = "InternalError";
    }
}