import { Platform } from 'react-native';
import FCM from 'react-native-fcm';
import userUtils from '../utils/user';

export function processFcmNotification(notification, props) {

    if (notification === undefined) {
        return
    }
    console.log(notification);

    if (notification && notification.local && notification.local_notification) { return }

    let tag = "";
    let show = false;
    let title = "";
    let body = "";

    if (notification.tag !== null) {
        tag = notification.tag;
    }
    if (Platform.OS === 'android') {
        //android notifications are handled natively
        if (tag === "chat" && notification.opened_from_tray === 1) {
            props.actions.updateInitialTab(1);
        }
        return
    } else if (Platform.OS === 'ios') {
        if (tag === "chat" && notification.aps !== undefined) {
            props.actions.updateInitialTab(1);

        }
        //ios notifications are handled natively
        return
    }

    // don't show notification if user is on chat screen
    if(props.router.currentRoute === 'chat' && tag === 'chat') {
        return
    }

    if (show === "true") {
        FCM.presentLocalNotification({
            group: 'sixwinks',
            tag: tag,
            title: title,
            body: body,
            click_action: "fcm.ACTION.HELLO",
            show_in_foreground: true,
            local: true,
            vibrate: null,
        });
    }

}
