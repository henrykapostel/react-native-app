'use strict'

import axios from 'axios';
import firebase from 'firebase';
import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import Orientation from 'react-native-orientation';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, autoRehydrate } from 'redux-persist';
import reducers from './reducers';
import App from './containers/App';
import options from './config/options.json';
import Logger from './utils/logger';

Logger.init();
firebase.initializeApp(options.firebase);
axios.defaults.baseURL = options.api.base;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const store = createStore(reducers, applyMiddleware(thunk), autoRehydrate(/*{log : true}*/));
console.ignoredYellowBox = [
    'Animated: `useNativeDriver` is not',
]

export default class SixWinks extends Component {
    constructor() {
        super();
        this.state = { rehydrated: false };
    }
    componentWillMount() {
        Orientation.lockToPortrait();
        let config = {
            blacklist: ['contacts'], //dont persist contacts to disk
            storage: AsyncStorage
        };
        persistStore(store, config, () => { this.setState({ rehydrated: true }) })
    }
    render() {
        if (!this.state.rehydrated) { return null }

        return (
            <Provider store={store}>
                <App />
            </Provider>
        );
    }
}
