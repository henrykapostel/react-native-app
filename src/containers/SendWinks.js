'use strict';

import React, { Component } from 'react';
import ContainerWithTabs from './ContainerWithTabs';
import SendWinksComponent from '../components/SendWinks';
import Chats from '../components/Chats';

export default class SendWinks extends Component {

    _renderScene = ({ route }) => {
        switch (route.key) {
            case 'winks':
                return <SendWinksComponent {...this.props} />
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
