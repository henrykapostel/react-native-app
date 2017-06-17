import _ from 'lodash';
import Promise from 'bluebird';
import firebase from 'firebase';
import moment from 'moment';
import FCM from 'react-native-fcm';
import chatUtils from './chats';
import {Platform} from 'react-native';
import api from '../API/api';
import options from '../config/options.json';

function isValidUser(user) {
    return (user && user.uid);
}

function hasUserWinkedYet(user)  {
    if (!user.winks.lastWinkSentAt) {
        return false
    }
    if (!moment(user.winks.lastWinkSentAt).isValid()) {
        return false
    }
    return true;
}

function hasUserWinkedInLast24Hrs(user)  {
    if (!hasUserWinkedYet(user)) {
        console.log("has not winked yet");
        return false
    }

    let lastWinkSent = moment(user.winks.lastWinkSentAt);
    let diff = moment().diff(lastWinkSent, 'seconds');
    let wait = options.waitTimeBetweenWinks;
    if (diff < wait) {
        return true;
    }

    return false;
}

const userUtils = {

    configureRoute:(props) => {
        let route = userUtils.getInitialRouteAndTab(props.user);
        props.actions.updateInitialRoute(route.route);
        if (route.tab !== undefined) {
            props.actions.updateInitialTab(route.tab);
        }
    },

    addListeners:(user, props)=>{
        userUtils.addChatListeners(user, props);
        userUtils.addConnectionsListener(user, props);

    },

    initUser: (props) => {
        userUtils.configureRoute(props);
        if (props.user.uid) {
            userUtils.getUserProfile(props.user)
                .then((user) => {
                    props.actions.updateUserProfile(user, props);
                    FCM.getFCMToken().then((fcmToken) => {
                        userUtils.updateFcmRefreshToken(fcmToken, props);
                    });
                    userUtils.addListeners(user,props);
                });
        }

    },

    getInitialRouteAndTab: (user) => {
        // show welcome page if the user is not registered
        if (!isValidUser(user)) {
            return {route:'welcome', tab:0}
        }

        // show waiting page if user sent winks in the last 24 hrs
        if (hasUserWinkedInLast24Hrs(user)) {
            return {route:'waitToWink', tab:1}
        }

        // show select winks page if user has not sent winks yet
        if (!hasUserWinkedYet(user)) {
            return {route:'selectWinks', tab:0}
        }

        return {route:'selectWinks', tab:0}
    },

    getUserProfile: async (propsUser) => {
        try {
            let response = await api.get('profile');
            if (!response) {
                return propsUser;
            }
            return response.user;
        } catch (error) {
            return propsUser;
        }
    },

    getUserConnections: async (connections) => {
        try {
            let response = await api.get('connections');
            if (!response) {
                return connections;
            }
            return response.connections;
        } catch (error) {
            console.error(error);
            return connections;
        }
    },

    updateConnectionsWithChatData: (connections, props) => {
        let map = _.map(connections, function (connection, index) {
            let chat = props.chats[connection.connectionId]

            if (chat !== undefined) {
                connection = {
                    ...connection,
                    unreadCount: chat.unreadCount,
                    latestMessage: chat.latestMessage,
                    name: chat.name,
                    muted: chat.muted,
                }
            }
            return connection;
        });
        connections = _.keyBy(map, 'connectionId');

        return connections;
    },

    addChatListeners:(user, props) =>{
        if(_.size(user.connections) === 0) {
            return true;
        }

        _.forEach(user.connections, function(connection) {
            let chatId          = connection.connectionId;
            if (chatId !== undefined) {
                let latestMessageId = '';
                if (props.chats[chatId] === undefined) {
                    props.actions.initializeChat(chatId)
                }
                if (props.chats[chatId] !== undefined && props.chats[chatId].latestMessage) {
                    latestMessageId = props.chats[chatId].latestMessage._id;
                }

                chatUtils.addChatListener(chatId, latestMessageId, user, props);
            }
        });
        return true;
    },

    addConnectionsListener: (user, props) => {
        if (!user.uid) {
            return true
        }
        let latestConnectionId = (_.size(user.connections) > 0) ? _.last(_.values(user.connections)).connectionRowId : '';

        let ref = firebase.database().ref('users/' + user.uid + '/connections');

        //turn off all listeners
        ref.off();

        let query = ref.orderByKey();

        query.on('child_changed', function (data) {
            let connection = data.val();
            let connectionId = connection.connectionId;
            props.actions.updateUserConnection(connectionId, connection);
            props.actions.updateChat(connectionId, connection);
        });


        if (latestConnectionId !== undefined) {
            query = ref.orderByKey().startAt(latestConnectionId);
        }

        query.on('child_added', function (data) {
            if (latestConnectionId !== data.key) {
                let connection = data.val();
                connection.connectionRowId = data.key;
                props.actions.addConnection(connection);
                props.actions.initializeChat(connection.connectionId);
                chatUtils.addChatListener(connection.connectionId, '', user, props);
            }
        });

    },

    updateFcmRefreshToken: (fcmToken, props) => {
        console.log("fcmtoken : " + fcmToken);
        props.actions.updateFcmToken(fcmToken);
        userUtils.updateUserProfile({fcmToken: fcmToken});
    },

    updateUserProfile: async (userData) => {
        try {
            userData.platform = Platform.OS;
            let response = await api.put('profile', userData);
            if (response) {
                return response.status;
            } else {
                return "failed";
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    timeTillNextWink: (user) => {
        let lastSent = user.winks.lastWinkSentAt;
        let lastWink = moment(lastSent);
        let diff = moment().diff(lastWink);
        let diffDuration = moment.duration(diff);
        let waitTime = moment.duration(options.waitTimeBetweenWinks, 'seconds');
        let duration = waitTime.subtract(diffDuration);
        return duration;
    },

    timeTillNextWinkPercent: (user) => {
        let lastSent = user.winks.lastWinkSentAt;
        let lastWink = moment(lastSent);
        let secondsSinceLastWink = moment().diff(lastWink) / 1000;
        let totalSecondsToWait = options.waitTimeBetweenWinks;
        let remain = totalSecondsToWait - secondsSinceLastWink;
        let percent = (remain / totalSecondsToWait) * 100;
        return percent;
    }

};

module.exports = userUtils;