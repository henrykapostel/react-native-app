'use strict';

import React, { Component } from 'react';
import ContainerWithTabs from './ContainerWithTabs';
import ReceivedWinksComponent from '../components/ReceivedWinks';
import Chats from '../components/Chats';

export default class ReceivedWinks extends Component {

    _renderScene = ({ route }) => {
        switch (route.key) {
            case 'winks':
                return <ReceivedWinksComponent {...this.props} />
            case 'chats':
                return <Chats {...this.props} />
            default:
                return null;
        }
    }

    render() {
        return (
            <ContainerWithTabs {...this.props} renderScene={this._renderScene} />
        )
    }
}
