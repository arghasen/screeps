// Logger taken partially from Overmind
import { color } from '../utils/utils';

export enum LogLevels {
  ERROR, // log.level = 0
  WARNING, // log.level = 1
  ALERT, // log.level = 2
  INFO, // log.level = 3
  DEBUG // log.level = 4
}

const FATAL: number = -1;
const fatalColor: string = '#d65156';

/**
 * Default debug level for log output
 */
export const LOG_LEVEL: number = LogLevels.INFO;

/**
 * Prepend log output with current tick number.
 */
export const LOG_PRINT_TICK: boolean = true;

/**
 * Prepend log output with source line.
 */
export const LOG_PRINT_LINES: boolean = false;

function time(): string {
  return color(Game.time.toString(), 'gray');
}

export class Logger {
  constructor() {
    _.defaultsDeep(Memory, {
      settings: {
        log: {
          level: LOG_LEVEL,
          showSource: LOG_PRINT_LINES,
          showTick: LOG_PRINT_TICK
        }
      }
    });
  }
  
  get level(): number {
    return Memory.settings.log.level;
  }

  get showTick(): boolean {
    return Memory.settings.log.showTick;
  }

  set showTick(value: boolean) {
    Memory.settings.log.showTick = value;
  }

  public setLogLevel(value: number): void {
    let changeValue: boolean = true;
    switch (value) {
      case LogLevels.ERROR:
        console.log(`Logging level set to ${value}. Displaying: ERROR.`);
        break;
      case LogLevels.WARNING:
        console.log(
          `Logging level set to ${value}. Displaying: ERROR, WARNING.`
        );
        break;
      case LogLevels.ALERT:
        console.log(
          `Logging level set to ${value}. Displaying: ERROR, WARNING, ALERT.`
        );
        break;
      case LogLevels.INFO:
        console.log(
          `Logging level set to ${value}. Displaying: ERROR, WARNING, ALERT, INFO.`
        );
        break;
      case LogLevels.DEBUG:
        console.log(
          `Logging level set to ${value}. Displaying: ERROR, WARNING, ALERT, INFO, DEBUG.`
        );
        break;
      default:
        console.log(
          `Invalid input: ${value}. Loging level can be set to integers between 
            ${LogLevels.ERROR}  and  ${LogLevels.DEBUG} inclusive.`
        );
        changeValue = false;
    }
    if (changeValue) {
      Memory.settings.log.level = value;
    }
  }
  public throw(e: Error): void {
    console.log.apply(
      this,
      this.buildArguments(FATAL).concat([color(e.toString(), fatalColor)])
    );
  }

  public error(...args: any[]): undefined {
    if (this.level >= LogLevels.ERROR) {
      console.log.apply(
        this,
        this.buildArguments(LogLevels.ERROR).concat([].slice.call(args))
      );
    }

    return undefined;
  }

  public warning(...args: any[]): undefined {
    if (this.level >= LogLevels.WARNING) {
      console.log.apply(
        this,
        this.buildArguments(LogLevels.WARNING).concat([].slice.call(args))
      );
    }

    return undefined;
  }

  public alert(...args: any[]): undefined {
    if (this.level >= LogLevels.ALERT) {
      console.log.apply(
        this,
        this.buildArguments(LogLevels.ALERT).concat([].slice.call(args))
      );
    }

    return undefined;
  }

  public notify(message: string): undefined {
    this.alert(message);
    Game.notify(message);

    return undefined;
  }

  public info(...args: any[]): undefined {
    if (this.level >= LogLevels.INFO) {
      console.log.apply(
        this,
        this.buildArguments(LogLevels.INFO).concat([].slice.call(args))
      );
    }

    return undefined;
  }

  public debug(...args: any[]): void {
    if (this.level >= LogLevels.DEBUG) {
      console.log.apply(
        this,
        this.buildArguments(LogLevels.DEBUG).concat([].slice.call(args))
      );
    }
  }

  public debugCreep(
    creep: { name: string; memory: any; pos: RoomPosition },
    ...args: any[]
  ): void {
    if (creep.memory && creep.memory.debug) {
      this.debug(`${creep.name} @ ${creep.pos}: `, args);
    }
  }

  public printObject(obj: object): void {
    console.log.apply(
      this,
      this.buildArguments(LogLevels.DEBUG).concat(JSON.stringify(obj))
    );
  }

  private buildArguments(level: number): string[] {
    const out: string[] = [];
    switch (level) {
      case LogLevels.ERROR:
        out.push(color('ERROR  ', 'red'));
        break;
      case LogLevels.WARNING:
        out.push(color('WARNING', 'orange'));
        break;
      case LogLevels.ALERT:
        out.push(color('ALERT  ', 'yellow'));
        break;
      case LogLevels.INFO:
        out.push(color('INFO   ', 'green'));
        break;
      case LogLevels.DEBUG:
        out.push(color('DEBUG  ', 'gray'));
        break;
      case FATAL:
        out.push(color('FATAL  ', fatalColor));
        break;
      default:
        _.noop();
    }
    if (this.showTick) {
      out.push(time());
    }

    return out;
  }
}

export const logger: Logger = new Logger();
