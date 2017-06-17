/**
 * Created by zayinkrige on 2017/05/03.
 */
import FirebaseCrash from 'react-native-firebase-crash-report';

export default class CustomLogger {

    static init() {
        console.log   = this.interceptLog(console.log);
        console.info  = this.interceptLog(console.info);
        console.error = this.interceptLog(console.error);
        console.debug = this.interceptLog(console.debug);
    }

    static interceptLog(originalFn)  {
        return function () {
            const args = Array.prototype.slice.apply(arguments);
            let result = '';
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                if (!arg || (typeof arg === 'string') || (typeof arg === 'number')) {
                    result += arg;
                }
                else {
                    result += JSON.stringify(arg);
                }
            }
            //originalFn.call(console, 'INTERCEPTED LOG: ' + result);
            FirebaseCrash.log(result);
            return originalFn.apply(console, arguments);
        };
    }
};
