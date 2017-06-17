
const chatActions = {
    resetChats:() => {
        return { type: 'RESET_CHATS' }
    },

    initializeChat:(chatId) => {
        return {
            type: 'INITIALIZE_CHAT',
            payload: { chatId: chatId }
        }
    },

    markChatAsRead:(chatId)=> {
        return {
            type: 'MARK_CHAT_AS_READ',
            payload: { chatId: chatId } }
    },

    addChatMessage:(chatId, message, user) => {
        return {
            type: 'ADD_CHAT_MESSAGE',
            payload: {
                chatId  : chatId,
                message : message,
                user    : user
            }
        }
    },

    updateChatMessage:(chatId, message, user) => {
        return {
            type: 'UPDATE_CHAT_MESSAGE',
            payload: {
                chatId  : chatId,
                message : message,
                user    : user
            }
        }
    },

    updateChatMessageLargeImage:(chatId, messageId, url) => {
        return {
            type: 'UPDATE_CHAT_MESSAGE_LARGE_IMAGE',
            payload: {
                chatId      : chatId,
                messageId   : messageId,
                url         : url
            }
        }
    },

    markImageUploaded:(chatId, messageId) => {
        return {
            type: 'MARK_IMAGE_UPLOADED',
            payload: {
                chatId      : chatId,
                messageId   : messageId
            }
        }
    },

    updateChat:(chatId, data) => {
        return {
            type: 'UPDATE_CHAT',
            payload: {
                chatId: chatId,
                data: data
            }
        }
    },
}

module.exports = chatActions;