import { logger } from 'utils/logger';

// currently unused, plan to make a dynamic loader for processes later
function loaderImpl(folder: string) {
   
    logger.info(`loader: loading module {file}`);

}

export const loader = loaderImpl;