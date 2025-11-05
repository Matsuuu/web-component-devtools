export abstract class MessageBase {
    constructor(public type: string) {}

    toJSON() {
        return {
            ...this,
            type: this.type,
        };
    }
}
