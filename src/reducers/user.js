
const initialState = {
    uid: null,
    fcmToken: null,
    phoneNumber: null,
    prefix: null,
    connections: [],
    winks: { lastWinkSentAt: null, lastWinkReceivedAt: null, sent: [] },
    overlayCount : 0,
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_PROFILE':
            return _updateUser(state, action);
        case 'ADD_CONNECTION':
            return _connections(state, action);
        case 'UPDATE_CONNECTION':
            return Object.assign({}, state, { connections: _updateConnection(state, action) });
        case 'UPDATE_CONNECTIONS':
            return Object.assign({}, state, { connections: action.payload.connections });
        case 'UPDATE_FCM_TOKEN':
            return _storeFCMToken(state, action);
        case 'INCREMENT_OVERLAY_COUNT' :
            return _incrementOverlayCount(state, action);
        default:
            return state;
    }
}

function _updateUser(state, action) {
    let user = action.payload.user;
    user.overlayCount = state.overlayCount;
    return user;
}

function _connections(state, action) {
    let connections = _addConnection(state, action)
    let toRet = Object.assign({}, state, { connections: connections});
    return toRet
}

function _addConnection(state, action) {
    let connections   = Object.assign({}, state.connections);
    let newConnection = action.payload.connection;

    connections[newConnection.connectionId] = newConnection;
    return connections
}

function _updateConnection(state, action) {
    let connections  = Object.assign({}, state.connections);
    let connectionId = action.payload.connectionId;
    let data         = action.payload.data;

    if (connectionId === undefined) {
        console.warn("undefined connectionId in payload");
        return
    }

    if (connections[connectionId] === undefined) {
        console.warn("no connection for connectionId in payload");
        return
    }
    let connection = connections[connectionId];

    //if its undefined, then copy it from the incoming payload
    if (connection.connectionId === undefined) {
        console.warn("undefined connectionId - attempting to fix");
        connection.connectionId = connectionId;
    }

    //if its still null then dont modify anything
    if (connection.connectionId === undefined) {
        console.warn("undefined connectionId");
        console.warn(action)
        return
    }

    let name       = (data.name !== undefined) ? data.name : connection.name;
    let muted      = (data.muted !== undefined) ? data.muted : connection.muted;

    connections[connectionId] = {
        ...connection,
        name: name,
        muted: muted,
    }

    return connections
}

function _storeFCMToken(state, action) {
    let user = Object.assign({}, state);
    user.fcmToken = action.payload.fcmToken;
    return user;
}

function _incrementOverlayCount(state, action) {
    let user = Object.assign({}, state);
    if (user.overlayCount === undefined) {
        user.overlayCount = 0;
    }
    user.overlayCount += 1;
    return user;
}