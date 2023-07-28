export class UserError extends Error {
    public context: string | undefined;
    
    public constructor(message: string, context?: string) {
        super(message);

        this.context = context;
        
        this.name = "UserError";
    }
}