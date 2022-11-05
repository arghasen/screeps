import _ from 'lodash';

declare global {
    // Syntax for adding proprties to `global` (ex "global.log")
    const _: typeof _;
    namespace NodeJS {
      interface Global {
        log: any;
        kernel: any;
      }
    }
  }
