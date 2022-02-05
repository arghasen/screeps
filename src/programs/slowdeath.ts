import { Process } from "os/process";
import { logger } from "utils/logger";

export  class Slowdeath extends Process{
    className:string = "Slowdeath"
    constructor (...args:ConstructorParameters<typeof Process>) {
        super(...args)
      }
    
    public main(){
        logger.info(`${this.className}: starting main`);
    }
}