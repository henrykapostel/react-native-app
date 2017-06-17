/**
 * Created by zayinkrige on 2017/03/09.
 */

const Dimensions = require('Dimensions');

const utils = {

    minWidth : 480,

    sizeForBaseSize:(baseSize) => {
        let width = Dimensions.get('window').width;
        if (width <= utils.minWidth) {
            let ratio = width / utils.minWidth;
            return baseSize * ratio;
        } else {
            return baseSize;
        }

    },

    stringify:(object) =>{
        let cache = [];
        let toRet = JSON.stringify(object, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        cache = null;
        return toRet;
    }
};

module.exports = utils;