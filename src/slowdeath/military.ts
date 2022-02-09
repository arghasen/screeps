import {Process} from 'os/Process'
import { logger } from 'utils/logger';


export class Military extends Process {
    
    className: string = 'military';
    public main(){
        logger.info(`${this.className}: Starting military`);
    }
}