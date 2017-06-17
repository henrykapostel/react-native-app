'use strict';

import firebase from 'firebase';
import moment from 'moment';
import api from '../API/api';
import _ from 'lodash';

const chatUtils = {

    deleteMessageOffServer:(message, chatId) => {
        let messageId = message._id;
        firebase.database().ref('chats/' + chatId + '/messages/' + messageId).remove();
    },

    markChatRead:(chatId) =>{
        let data = {chatId: chatId};
        api.put('chatRead', data).catch((error) => {
            console.error(error);
        })
    },

    addUnreadListener:(chatId, user, props) => {
        let path = 'chats/' + chatId + '/members/' + user.uid;
        let ref = firebase.database().ref(path);
        // remove any existing listener
        ref.off();
        ref.on('child_changed', function(data){
            let id = data.key;
            if (id === "unread") {
                let unread = data.val();
                props.actions.updateChat(chatId, {unreadCount: unread})
            }
        });
    },

    addChatListener:(chatId, latestMessageId, user, props) =>{

        chatUtils.addUnreadListener(chatId, user, props);
        try {
            if (chatId === undefined) {
                return;
            }
            let path = 'chats/' + chatId + '/messages';
            let ref = firebase.database().ref(path);
            // remove any existing listener
            ref.off();

            let query = ref.orderByKey();

            query.on('child_added', function (data) {
                let message = data.val();
                message._id = data.key;

                //if there's something in the message, then add it locally and delete it off server
                if (message.text !== undefined || message.image !== undefined) {
                    props.actions.addChatMessage(chatId, message, user);

                    //if im the recipient, then delete the message off the server
                    let userid = message.user._id; //id of sender
                    if (userid !== user.uid) {
                        chatUtils.deleteMessageOffServer(message, chatId);
                    }
                }

            });

            ref.on('child_changed', function (data) {
                let message = data.val();
                message._id = data.key;

                props.actions.updateChatMessage(chatId, message, user);
                //if im the recipient, then delete the message off the server
                let userid = message.user._id; //id of sender
                if (userid !== user.uid) {
                    chatUtils.deleteMessageOffServer(message, chatId);
                }

            })
        } catch (error) {
            console.warn(error);
        }
    },

    parseChatDateForSorting:(date) => {
        moment.updateLocale('en', {
            'calendar': {
                sameDay: 'YYYY/MM/DD HH:mm:ss',
                lastDay: 'YYYY/MM/DD HH:mm:ss',
                lastWeek: 'YYYY/MM/DD HH:mm:ss',
                sameElse: 'YYYY/MM/DD HH:mm:ss',
            }
        });

        let toRet = moment(date).calendar();
        return toRet;
    },

    parseChatDate:(date) =>{
        moment.updateLocale('en', {
            'calendar': {
                sameDay: 'h:mm:ssA',
                lastDay: 'D/MM/YYYY',
                lastWeek: 'D/MM/YYYY',
                sameElse: 'D/MM/YYYY',
            }
        });

        return moment(date).calendar();
    },

    trimText:(text, length) => {
        if (text === undefined) {
            return "";
        }

        text = _.replace(text, new RegExp("\n","g"), " ");

        if (text.length < length) {
            return text
        }


        //trim the string to the maximum length
        let trimmedString = text.substring(0, length);

        //re-trim if we are in the middle of a word
        trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(' ')))
        trimmedString = trimmedString + '..';

        return trimmedString;
    },

    createNewMessage: async(chatId, createdAt, userid) => {
        let message = {
            createdAt : createdAt,
            uploading : true,
            user      : {
                _id   : userid
            }
        };
        let newMessageRef =  await firebase.database().ref('chats/' + chatId + '/messages/').push(message);
        let messageId = newMessageRef.key;
        message._id = messageId;
        return message;
    },

    sendMessageToServer:(message, connectionId, receiverId) => {

        let params  = {
            chatId          : connectionId,
            receiverUid     : receiverId,
            message         : message.text
        };
        return api.post('messages', params);
    },

    sortMessages:(messages) => {
        //remove non message objects
        let toRet  = _.filter(messages, function(message) {
            return message !== undefined
        });
        //make sure messages are unique
        toRet = _.uniqBy(toRet, '_id');

        //sort them
        return _.orderBy(toRet, function(m){
            let createdAt = m.createdAt;
            let sortDate = chatUtils.parseChatDateForSorting(createdAt);
            return sortDate;
        }, 'desc');
    }
};

module.exports = chatUtils;