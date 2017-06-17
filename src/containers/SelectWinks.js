'use strict';

import React, { Component } from 'react';
import ContainerWithTabs from './ContainerWithTabs';
import SelectWinksComponent from '../components/SelectWinks';
import Chats from '../components/Chats';

export default class SelectWinks extends Component {

    _renderScene = ({ route }) => {
        switch (route.key) {
            case 'winks':
                return <SelectWinksComponent {...this.props} />
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
