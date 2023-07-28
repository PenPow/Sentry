export class PreconditionValidationError extends Error {
    public context: string;

    public constructor(message: string, context: string) {
        super(message);
        
        this.name = "PreconditionValidationError";
        this.context = context;
    }
}