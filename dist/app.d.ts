export default class AppBootHook {
    private readonly app;
    constructor(app: any);
    configWillLoad(): void;
    willReady(): Promise<void>;
}
