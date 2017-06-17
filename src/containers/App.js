'use strict';

import React, { Component } from 'react';
import { StatusBar, View, Platform, AppState, BackAndroid } from 'react-native';
import { actions as routerActions, Route, Router } from 'react-native-router-redux';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import SplashScreen from 'react-native-splash-screen';
import FCM from 'react-native-fcm';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import userUtils from '../utils/user';
import permissionUtils from '../utils/permissions';
import { processFcmNotification } from '../utils/notifications';
import { themeStyles as styles } from '../config/styles';
import Welcome from './Welcome';
import Registration from './Registration';
import Activation from './Activation';
import SelectWinks from './SelectWinks';
import SendWinks from './SendWinks';
import SendWinksShowSMS from './SendWinksShowSMS';
import ReceivedWinks from './ReceivedWinks';
import WaitToWink from './WaitToWink';
import Chat from './Chat';
import ChatOptions from './ChatOptions';
import ViewImage from './ViewImage';

import * as userActions from '../actions/user';
import * as contactActions  from '../actions/contacts';
import * as chatActions  from '../actions/chats';

const mapStateToProps = state => ({
    chats: state.chats,
    contacts: state.contacts,
    router: state.router,
    routes: state.routes,
    user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        ...userActions, ...contactActions, ...chatActions, ...routerActions
    }, dispatch),
    dispatch,
});

class App extends Component {
    constructor(props) {
        super(props);
        userUtils.initUser(this.props);
    }

    _backPressed() {
        this.props.actions.pop({ data: this.props.router.data });
        return true;
    }

    componentWillMount() {
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
        BackAndroid.addEventListener('hardwareBackPress', this._backPressed.bind(this));
        permissionUtils.requestContactsPermission();
        this._addNotificationListeners();
        try {
            this._checkAppPermissions();
            this._resetNotifications();
            SplashScreen.hide();
            let props = this.props;
            FCM.getInitialNotification().then(function(notification) {
                processFcmNotification(notification, props);
            });

        } catch(error){
            SplashScreen.hide();
            console.error(error);
        }
    }

    componentWillUnmount() {
        this.notificationListenerRemove();
        this.refreshTokenListenerRemove();
    }

    _resetNotifications() {
        FCM.removeAllDeliveredNotifications();
        FCM.setBadgeNumber(0);
    }

    _checkAppPermissions() {
        FCM.requestPermissions();
    }

    _addNotificationListeners() {
        let props = this.props;
        this.refreshTokenListenerRemove = FCM.on('refreshToken', function(token) {
            userUtils.updateFcmRefreshToken(token, props);
        });

        this.notificationListenerRemove = FCM.on('notification', function(notification) {
            processFcmNotification(notification, props)
        });
    }

    _handleAppStateChange(currentAppState) {
        if(currentAppState === 'active') {
            this._resetNotifications()
            if(Platform.OS === 'android') {
                if(this.props.router.currentRoute === 'chat') {
                    AndroidKeyboardAdjust.setAdjustResize()
                } else {
                    AndroidKeyboardAdjust.setAdjustPan()
                }
            }
        }

    }

    _routes(){
        let initial = this.props.routes.initial;
        return (
            <Router {...this.props} initial={initial}>
                <Route name="welcome" component={Welcome} type="reset" hideNavBar={true} />
                <Route name="registration" component={Registration} hideNavBar={true} />
                <Route name="activation" component={Activation} hideNavBar={true} />
                <Route name="selectWinks" component={SelectWinks} hideNavBar={true}/>
                <Route name="sendWinks" component={SendWinks} hideNavBar={true} />
                <Route name="sendWinksShowSMS" component={SendWinksShowSMS} hideNavBar={true} />
                <Route name="receivedWinks" component={ReceivedWinks} hideNavBar={true} />
                <Route name="waitToWink" component={WaitToWink} hideNavBar={true} />
                <Route name="chat" component={Chat} hideNavBar={true} />
                <Route name="chatOptions" component={ChatOptions} hideNavBar={true} />
                <Route name="viewImage" component={ViewImage} hideNavBar={true} />
            </Router>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar hidden={(Platform.OS !== 'android')}/>
                {this._routes()}
            </View>
        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(App)
