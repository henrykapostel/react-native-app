import _ from 'lodash';
import chatUtils from '../utils/chats';

const initialState = {
    unreadChatsCount: 0,
    unreadMessagesCount: 0,
};


export default function reducer(state = initialState, action) {
    switch (action.type) {
        case 'RESET_CHATS':
            return initialState;
        case 'INITIALIZE_CHAT':
            return _initializeChat(state, action);
        case 'ADD_CHAT_MESSAGE':
            return _addChatMessage(state, action);
        case 'UPDATE_CHAT_MESSAGE':
            return _updateChatMessage(state, action);
        case 'MARK_CHAT_AS_READ':
            return _markChatAsRead(state, action);
        case 'UPDATE_CHAT':
            return _updateChat(state, action);
        case 'UPDATE_CHAT_MESSAGE_LARGE_IMAGE':
            return _updateChatMessageLargeImage(state, action);
        case 'MARK_IMAGE_UPLOADED':
            return _markImageUploaded(state, action);
        default:
            return state;
    }
}

function _initializeChat(state, action) {
    let chats     = Object.assign({}, state);
    let chatId    = action.payload.chatId;
    let chat      = chats[chatId];
    let messages  = [];
    let name      = "new chat";
    let latestMessage = null;
    let unreadCount = 0;


    if (chat !== undefined) {
        messages = chat.messages;
        name = chat.name;
        if (name === undefined) {
            name = "new chat"
        }
        latestMessage = chat.latestMessage;
        unreadCount = chat.unreadCount;
    }

    if (messages === undefined || messages.length <= 0) {
        chats[chatId] = {
            messages: [],
            latestMessage: latestMessage,
            unreadCount: unreadCount,
            name: name
        };
    } else {
        messages  = chatUtils.sortMessages(messages);
        latestMessage = _.first(messages);
        chats[chatId] = {
            ...chats[chatId],
            latestMessage: latestMessage,
            messages: messages,
        };
    }

    chats.unreadChatsCount = _getUnreadChatsCount(chats);
    chats.unreadMessagesCount = _getTotalUnreadMessagesCount(chats);
    return chats

}

function _updateChat(state, action) {
    let chats     = Object.assign({}, state);
    let chatId    = action.payload.chatId;

    if (action.payload.data.name !== undefined) {
        chats[chatId] = {
            ...chats[chatId],
            name        : action.payload.data.name,
        }
    }
    if (action.payload.data.muted !== undefined) {
        chats[chatId] = {
            ...chats[chatId],
            muted       : action.payload.data.muted,
        }
    }
    if (action.payload.data.unreadCount !== undefined) {
        chats[chatId] = {
            ...chats[chatId],
            unreadCount : action.payload.data.unreadCount,
        }
    }


    return chats;
}

function _addChatMessage(state, action) {
    let chats       = Object.assign({}, state);
    let message     = action.payload.message;
    let chatId      = action.payload.chatId;
    let user        = action.payload.user;

    if (message.text === undefined && message.image === undefined) {
        return chats;
    }

    let messages  = (chats[chatId] !== undefined) ? chats[chatId].messages : [];
    let unreadCount = chats[chatId].unreadCount;
    //if this is an updated message, then find it in the existing messages list and update it
    if (_.find(messages, {'_id':message._id})) {
        messages = _.map(messages, function(m){
            if (m._id === message._id) {
                m.text      = message.text;
                m.uploading = message.uploading;
                if (message.image === undefined) {
                    m.image = null;
                }
                //dont copy the image object here
            }
            return m;
        });
    } else {
        //it doesnt exist in our list of messages, so add it
        messages = _.concat(messages, message);
        if (user.uid !== message.user._id) {//it wasnt sent from my user
            unreadCount++;//its a new chat, so increment our unreadcount
        }
    }
    messages  = chatUtils.sortMessages(messages);
    let latestMessage = _.first(messages);
    chats[chatId] = {
        ...chats[chatId],
        messages: messages,
        latestMessage: latestMessage,
        unreadCount: unreadCount,
    };
    chats.unreadChatsCount = _getUnreadChatsCount(chats);
    chats.unreadMessagesCount = _getTotalUnreadMessagesCount(chats);
    return chats
}

function _updateChatMessage(state, action) {
    let chatId    = action.payload.chatId;
    let message   = action.payload.message;
    let user      = action.payload.user;
    let chats     = Object.assign({}, state);
    let chat      = chats[chatId];

    let messageIndex = _.findIndex(chat.messages, {_id : message._id});
    let messages = chat.messages;

    if (message.uploading === undefined) {
        message.uploading = false;
    }

    //this happens when other user is uploading an image, but there is no message text or image yet
    if (messageIndex === -1) {
        messages = _.concat(messages, message);
    } else if (message.text !== undefined || message.image !== undefined) {
        if (message.image !== undefined) {
            if (message.user._id === user.uid) {
                let image = message.image;
                //dont store the remote http url locally
                if (image.thumbnailURL !== undefined && image.thumbnailURL.startsWith("http")) {
                    //override the incoming message.image urls with whatever we currently have
                    message.image.thumbnailURL = messages[messageIndex].image.thumbnailURL;
                }
                if (image.originalURL !== undefined && image.originalURL.startsWith("http")) {
                    //override the incoming message.image urls with whatever we currently have
                    message.image.originalURL = messages[messageIndex].image.originalURL;
                }
            }
        }
        message.createdAt = messages[messageIndex].createdAt;
        messages[messageIndex] = message
    }
    messages = chatUtils.sortMessages(messages);
    let unreadCount = 0;
    _.map(messages, function (message) {
        if(message.user === undefined) {
            unreadCount = 0;
        }
        else {
            if (message.read === false && message.user._id !== user.uid) {
                unreadCount++
            }
        }
    });

    let latestMessage = _.first(messages);

    chats[chatId] = {
        ...chats[chatId],
        messages: [...messages],
        latestMessage: latestMessage,
        unreadCount: unreadCount,
    };
    chats.unreadChatsCount = _getUnreadChatsCount(chats);
    chats.unreadMessagesCount = _getTotalUnreadMessagesCount(chats);
    
    return chats
}

function _updateChatMessageLargeImage(state, action) {
    let chats     = Object.assign({}, state);
    let chatId    = action.payload.chatId;
    let chat      = chats[chatId];

    let messageId = action.payload.messageId;
    let origURL   = action.payload.url;

    let messages  = chat.messages;
    let messageIndex = _.findIndex(chat.messages, {_id : messageId});
    let message = messages[messageIndex];
    message.image.originalURL = origURL;
    return chats;
}

function _markImageUploaded(state, action) {
    let chatId    = action.payload.chatId;
    let messageId = action.payload.messageId;
    let chats     = Object.assign({}, state);
    let chat      = chats[chatId];
    let messages  = chat.messages;
    let messageIndex = _.findIndex(chat.messages, {_id : messageId});
    let message = messages[messageIndex];
    message.uploading = false;
    return chats;
}

function _markChatAsRead(state, action) {
    let chats       = Object.assign({}, state);
    let chatId      = action.payload.chatId;

    if (chatId === undefined) {
        return chats;
    }

    if (chats[chatId] === undefined) {
        return chats;
    }
    chats[chatId].unreadCount = 0;
    chats.unreadChatsCount    = _getUnreadChatsCount(chats);
    chats.unreadMessagesCount = _getTotalUnreadMessagesCount(chats);

    return chats
}

function _getUnreadChatsCount(chats) {
    let total = 0;
    _.forEach(chats, function(chat) {
        if (chat!== undefined && chat.unreadCount !== undefined && chat.unreadCount > 0) {
            total ++;
        }
    });
    return total;
}

function _getTotalUnreadMessagesCount(chats) {
    let total = 0;
    _.forEach(chats, function(chat) {
        if (chat!== undefined && chat.unreadCount !== undefined && chat.unreadCount > 0) {
            total += chat.unreadCount;
        }
    });
    return total;
}