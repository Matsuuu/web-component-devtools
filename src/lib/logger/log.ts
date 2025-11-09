export const LogLevel = {
    NONE: {
        name: "NONE",
        level: 0,
    },
    INFO: {
        name: "INFO",
        level: 1,
    },
    DEBUG: {
        name: "DEBUG",
        level: 2,
    },
};

let LEVEL = LogLevel.NONE;

export function setLogLevel(logLevel: LogLevel) {
    LEVEL = logLevel;
}

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export function log(level: LogLevel, message: string, object?: any) {
    if (LEVEL <= level) {
        if (object) {
            console.log(`[${level.name}]: ` + message, object);
        } else {
            console.log(`[${level.name}]: ` + message);
        }
    }
}
