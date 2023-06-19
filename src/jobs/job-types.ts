export interface IJob<T> {
    id: string;
    topic?: string;
    parameters: T;
    running: boolean;
}
