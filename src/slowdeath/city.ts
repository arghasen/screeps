import {Process} from 'os/Process'
import { logger } from 'utils/logger';

/**
 * City is the lowest level of an empire and is responsible for individual cities
 */
export class City extends Process {
    
    className: string = 'city';
    public main(){
        logger.info(`${this.className}: Starting city`);
    }
}