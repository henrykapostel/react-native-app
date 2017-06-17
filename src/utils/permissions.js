/**
 * Created by zayinkrige on 2017/03/07.
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';

const permissionUtils = {

    iosContactPermission:() => {
        return new Promise(function (resolve, reject) {
            Contacts.checkPermission((error, permission) => {
                if(permission === 'undefined'){
                    Contacts.requestPermission((error, permission) => {
                        if(permission === 'authorized'){
                            resolve(true);
                        } else if(permission === 'denied'){
                            reject(false);
                        } else {
                            reject(false);
                        }
                    });
                }
                if(permission === 'authorized'){
                    resolve(true);
                } else if(permission === 'denied'){
                    reject(false);
                } else {
                    reject(false);
                }
            })
        })
    },

    requestContactsPermission: async () => {
        if (Platform.OS === 'android') {
            let messageObject = {
                'title': '6winks Contacts Permission',
                'message': '6Winks needs access to your contacts so you can wink at them.'
            };

            try {
                let granted = await PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, messageObject);
                return granted;
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else if (Platform.OS === 'ios'){
            try {
                let granted = await permissionUtils.iosContactPermission();
                return granted;
            } catch (error) {
                return false;
            }
        }
    },

    requestCameraPermission: async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestPermission(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        'title': '6winks Camera Permission',
                        'message': '6 Winks needs access to your camera' +
                        'for chat media'
                    }
                );
                return granted;
            } catch (err) {
                console.warn(err)
            }
        } else {
            return true;
        }
    }
};

module.exports = permissionUtils;