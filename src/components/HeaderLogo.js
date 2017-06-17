import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';
import utils from '../utils/utils';

const logo   = require('../resources/images/text-logo.png');
const styles = StyleSheet.create({
    logo: {
        height: utils.sizeForBaseSize(45),
        width: utils.sizeForBaseSize(80),
        padding: 0,
        margin: 0,
        flex : 1,
        resizeMode: 'cover',
        justifyContent: 'center'
    }
});

export default class HeaderLogo extends Component {
    render() {
        return (
            <Image source={logo} style={styles.logo} />
        )
    }
}

