/**
 * Created by zayinkrige on 2017/05/08.
 */

import axios from 'axios';
import firebase from 'firebase';

const api = {

    _getHeaders:async()=>{
        let firebaseToken = await api.getFirebaseToken();
        if (!firebaseToken) {
            return null;
        } else {
            let headers =  {
                headers: {'Authorization': firebaseToken}
            };
            return headers;
        }
    },

    post:async(endpoint, data)=>{
        try {
            let headers = await api._getHeaders();
            let response = await axios.post('api/' + endpoint, data, headers);
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    put:async(endpoint, data)=>{
        try {
            let headers = await api._getHeaders();
            if (!headers) {
                return null;
            }
            let response = await axios.put('api/' + endpoint, data, headers);
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    get:async(endpoint)=>{
        try {
            let headers = await api._getHeaders();
            let response = await axios.get('api/' + endpoint, headers);
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    getFirebaseToken: async () => {
        try {
            let user = await api.getFirebaseUser();
            if (!user) {
                return null;
            }

            let token = await firebase.auth().currentUser.getToken(false); //forceRefresh == false - we don't want to refresh every single time
            return token;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    getFirebaseUser: async() => {
        let user = firebase.auth().currentUser;
        if (user !== null) {
            return user;
        } else {
            return new Promise(function (resolve, reject) {
                firebase.auth().onAuthStateChanged(function (user) {
                    resolve(user);
                });
            });
        }
    },
};

module.exports = api;