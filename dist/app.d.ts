export default class AppBootHook {
    configWillLoad(): void;
    willReady(): Promise<void>;
}
