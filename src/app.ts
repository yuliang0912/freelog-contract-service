export default class AppBootHook {
    private readonly app;

    public constructor(app) {
        this.app = app;
    }

    configWillLoad() {
     
    }

    async willReady() {
        const rabbitMqSubscribeHandler = this.app.applicationContext.get('rabbitMqSubscribeHandler');
        rabbitMqSubscribeHandler.subscribe();
    }
}
