import { actions as routerActions } from 'react-native-router-redux';
import { getUserConnections, updateConnectionsWithChatData } from '../utils/user';
const userActions = {

    addConnection:(connection) => {
        return {type: 'ADD_CONNECTION', payload: {connection: connection}}
    },

    goto:(options) => {
        return {
            type: routerActions.actionTypes.ROUTER_PUSH,
            payload: {name: options.page, data: options.data}
        }
    },

    resetModal:(options) => {
        return {
            type: routerActions.actionTypes.ROUTER_RESET,
            payload: {name: options.page, data: options.data}
        }
    },

    incrementOverlayCount:() => {
        return {type: 'INCREMENT_OVERLAY_COUNT', payload: null}
    },

    updateUserProfile:(user, props) =>{
        user.connections = updateConnectionsWithChatData(user.connections, props);
        return {type: 'UPDATE_PROFILE', payload: {user: user}}
    },

    updateUserConnection:(connectionId, data) => {
        return {type: 'UPDATE_CONNECTION', payload: {connectionId: connectionId, data: data}}
    },

    updateUserConnectionsChatData:(connections) => {
        return {type: 'UPDATE_CONNECTIONS', payload: {connections: connections}}
    },

    updateInitialTab:(initialTab) => {
        return function (dispatch) {
            dispatch({type: 'UPDATE_INITIAL_TAB', payload: {initialTab: initialTab}});
        }
    },

    updateInitialRoute:(route) => {
        return function (dispatch) {
            dispatch({type: routerActions.actionTypes.ROUTER_RESET, payload: {name: route}});
            dispatch({type: 'UPDATE_INITIAL_ROUTE', payload: {route: route}});
        }
    },

    updateFcmToken:(fcmToken) => {
        return {type: 'UPDATE_FCM_TOKEN', payload: {fcmToken: fcmToken}}
    },
};

module.exports = userActions;