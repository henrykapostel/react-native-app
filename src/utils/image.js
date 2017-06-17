'use strict';

import firebase from 'firebase';
import moment from 'moment';
import chatUtils from '../utils/chats'
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'react-native-fetch-blob'
import api from '../API/api';
const SHA1 = require("crypto-js/sha1");


//this needs to be here otherwise firebase doesnt recognize the blob type
const Blob = RNFetchBlob.polyfill.Blob;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;
let dirs = RNFetchBlob.fs.dirs;

const imageHelper = {
    getNewMessage:async (props, chatId) => {
        let user        = props.user;
        let createdAt   = moment().format();
        let message   = await chatUtils.createNewMessage(chatId, createdAt, user.uid);
        return message;
    },

    createThumbnail:async(imageUri) => {
        try {
            let resizedUri = await ImageResizer.createResizedImage(imageUri, 19, 12, "JPEG", 90);
            return resizedUri;
        } catch(error) {
            console.error(error);
        }
    },

    convertToJPG:async(response) => {
        try {
            let uri = response.path;
            if (uri.toUpperCase().endsWith("JPG")) {
                uri = uri.replace("file://", "");
                return uri;
            } else {
                let convertedURI = await ImageResizer.createResizedImage(response.path, response.width, response.height, "JPEG", 90);
                RNFetchBlob.fs.unlink(response.uri); //remove the original image
                return convertedURI;
            }
        } catch(error) {
            console.error(error);
        }

    },

    uploadThumbnail:async(chatId, messageId, localURI) => {
        return await imageHelper.uploadImage(chatId, messageId, localURI, "thumbnail.jpg");
    },

    uploadImage:async(chatId, messageId, localURI, name) => {
        let rnfbURI = RNFetchBlob.wrap(localURI);
        let path = "chats/" + chatId + messageId + "/" + name;
        let storageRef = firebase.storage().ref(path);
        try {
            let blob = await Blob.build(rnfbURI, {type: "image/jpg"});
            let snapshot = await storageRef.put(blob, {contentType: 'image/jpg'});
            let downloadURL = snapshot.downloadURL;
            return downloadURL;
        }catch(error) {
            console.error(error);
        }
    },

    addThumbnailToMessage:(message, thumbnailURL, props, chatId) => {
        let image       = {
            thumbnailURL    : thumbnailURL
        };
        let localMessage           = Object.assign({}, message);
        localMessage.uploading = true;
        localMessage.image     = image;
        props.actions.addChatMessage(chatId, localMessage, props.user);             //add the message locally. it will get updated by the server later
    },

    addFullSizeImageToMessage:(message, fullSizeURL) => {
        let toRet               = Object.assign({}, message);
        toRet.uploading         = false;
        toRet.image.originalURL = fullSizeURL;
        return toRet;
    },

    sendMessageToServer:(chatId, message, receiverID, props) => {
        let params  = {
            chatId      : chatId,
            receiverUid : receiverID,
            message     : message,
        };
        api.post('image', params)
            .then(function(){
                //set uploading == false which turns off the spinner on the image
                message.uploading = false;
                props.actions.updateChatMessage(chatId, message, props.user);
            })
            .catch((error) => {
                console.error(error);
                //resurface the error to the chat container so that it can display a warning to the user
                throw error;
            });
    },

    doThumbnail:async(srcImageURI, message, chatId, props) => {
        let thumbnailURI = await imageHelper.createThumbnail(srcImageURI);              //create thumbnail
        imageHelper.addThumbnailToMessage(message, "file://" + thumbnailURI, props, chatId); //add thumbnail local URI to message object
        let thumbnailURL = await imageHelper.uploadThumbnail(chatId, message._id, thumbnailURI);//upload thumbnail -> get url
        let newMessage = Object.assign({}, message);
        newMessage.image = {
            thumbnailURL : thumbnailURL
        };                                   //add thumbnail remote URL to message object
        return newMessage;
    },

    doLargeImage:async(response, chatId, message, props) => {
        try {
            let messageId = message._id;
            let originalURI = await imageHelper.convertToJPG(response);                     //convert original image to JPG
            props.actions.updateChatMessageLargeImage(chatId, messageId, "file://" + originalURI); //update the local chat message with the new info
            let originalURL = await imageHelper.uploadImage(chatId, messageId, originalURI, response.fileName);//upload original -> get url
            props.actions.markImageUploaded(chatId, messageId);                             //mark image as uplaoded
            let newMessage = imageHelper.addFullSizeImageToMessage(message, originalURL);   //add fullsize remote URL to message object
            return newMessage;
        } catch(error) {
            console.error(error);
        }
    },
};

const imageUtils = {

    sendImage: async(response, props, chatId, receiverId) => {

        let message = await imageHelper.getNewMessage(props, chatId);                   //get new message
        message = await imageHelper.doThumbnail(response.path, message, chatId, props);  //handle the thumbnail
        message = await imageHelper.doLargeImage(response, chatId, message, props);     //handle the fullsize image
        imageHelper.sendMessageToServer(chatId, message, receiverId, props);            //call api endpoint with message object
    },

    deleteImage:(chatId, messageId) => {
        let path = "chats/" + chatId + messageId + "/";
        let storageRef = firebase.storage().ref(path);
        //dont do anything yet.
        //firebase currently doesnt allow us to delete a folder
        //and there is no firebase method to iterate all the files in a folder
        //this call actuall fails and throws an exception
        //storageRef.delete();
    },

    cacheURIforURL:(url) => {
        let base_dir = dirs.CacheDir + "/full-image-cache";
        let path = url.substring(url.lastIndexOf("/"));
        let ext = ".jpg";
        let sha = SHA1(path).toString();
        path = base_dir + "/" + sha + ext;
        return path;
    },

    fetchImage:(url, progress, done) => {
        let path = imageUtils.cacheURIforURL(url);
        RNFetchBlob.fs.exists(path).then((exists)=>{
            if (exists) {
                done(path);
            } else {
                RNFetchBlob
                    .config({
                        // add this option that makes response data to be stored as a file,
                        // this is much more performant.
                        fileCache   : true,
                        appendExt   : 'jpg',
                        path        : path
                    })
                    .fetch('GET', url, {
                        //some headers ..
                    })
                    .progress((received, total) => {
                        let percent = received / total;
                        percent = percent * 100;
                        progress(percent);
                    })
                    .then((response) => {
                        let localPath = response.path();
                        done(localPath);
                    });
            }
        });
    },

};

module.exports = imageUtils;