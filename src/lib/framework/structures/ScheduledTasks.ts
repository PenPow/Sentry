import { JobsOptions, Queue, Worker } from "bullmq";

export abstract class ScheduledTaskManager<Data, TaskName extends string> {
    public queue: Queue<Data, void, TaskName>;
    
    #connection = {
        port: 6379,
        host: "redis",
        db: 0,
    };

    public constructor(name: TaskName) {
        this.queue = new Queue<Data, void, TaskName>(name, { connection: this.#connection });
        new Worker<Data, void, TaskName>(name, (job) => this.run(job.data), { connection: this.#connection });
    }

    public schedule(payload: Data, options?: JobsOptions) {
        return this.queue.add(this.queue.name as TaskName, payload, options);
    }

    protected run(_payload: Data): Promise<void> {
        throw new Error("stub");
    }
}