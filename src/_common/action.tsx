export interface StandardAction<TPayload> {
    type: string;
    error?: boolean;
    payload?: TPayload | any;
}