'use strict';

import React, { Component } from 'react';
import ContainerWithTabs from './ContainerWithTabs';
import SendWinksShowSMSComponent from '../components/SendWinksShowSMS';
import Chats from '../components/Chats';

export default class SendWinksShowSMS extends Component {

    _renderScene = ({ route }) => {
        switch (route.key) {
            case 'winks':
                return <SendWinksShowSMSComponent {...this.props} />
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
