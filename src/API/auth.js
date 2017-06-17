/**
 * Created by zayinkrige on 2017/05/15.
 */
import axios from 'axios';
import firebase from 'firebase';
import userUtils from '../utils/user';

const auth = {

    register:async(number, prefix) => {
        let response = await axios.post('auth/signup', {mobile: number, prefix: prefix});
        return response.data.uid;
    },

    activate:async(uid, otp) => {
        let params =  {
            uid: uid,
            otp: otp
        };
        let response = await axios.post('auth/activate',params);
        let token = response.data.token;
        let user = await firebase.auth().signInWithCustomToken(token);
        user = await userUtils.getUserProfile(user);
        return user;
    }
};

module.exports = auth;