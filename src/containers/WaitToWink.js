'use strict';

import React, { Component } from 'react';
import ContainerWithTabs from './ContainerWithTabs';
import WaitToWinkComponent from '../components/WaitToWink';
import Chats from '../components/Chats';

export default class WaitToWink extends Component {

    _renderScene = ({ route }) => {
        switch (route.key) {
            case 'winks':
                return <WaitToWinkComponent {...this.props} />
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
