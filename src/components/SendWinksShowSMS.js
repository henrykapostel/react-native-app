'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { Container } from 'native-base';
import Alert from 'react-native-dropdownalert';
import _ from 'lodash';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from './HeaderLogo';
import Spinner from 'react-native-loading-spinner-overlay';
import userUtils from '../utils/user';
import api from '../API/api';
import utils from '../utils/utils';

export default class SendWinksShowSMS extends Component {

    constructor(props) {
        super(props);
        this.state = ({spinner : false});
    }

    _sendWinks() {
        this.setState({ spinner: true });
        let contacts = _.flatten(_.map(this.props.router.data.contacts, 'number'));
        contacts     = _.zipObject(contacts, contacts);
        api.post('winks',{ contacts: contacts }).then(response => {
            if (response.status === "success") {
                userUtils.getUserProfile(this.props.user).then((user) => {
                    this.props.actions.updateUserProfile(user, this.props);
                    this.setState({ spinner: false });
                    userUtils.configureRoute(this.props);

                    //this.props.actions.goto({ page: 'waitToWink' });
                });
            }

        }).catch(error => {
            this.setState({ spinner: false });
            let message = (error.response) ?  error.response.data.message : error.message;
            this.dropdown.alertWithType('error', 'Error', message)
        });
    }

    _backClick() {
        this.props.actions.pop(2);
    }


    render() {
        let spinner = this.state.spinner;
        return (
            <Container theme={theme} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.back} onPress={this._backClick.bind(this)}>back</Text>
                    <HeaderLogo />
                    <Text style={styles.next} onPress={this._sendWinks.bind(this)}>send</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>
                            awesome.{'\n'}
                            <Text style={styles.receivedTextBold}>
                                the following anonymous{'\n'}
                                message will be sent{'\n'}
                                to your winks:{'\n'}
                            </Text>
                        </Text>
                    </View>

                    <View style={styles.receivedImageView}>
                        <Image source={require('../resources/images/received.png')} style={styles.receivedImage}>
                            <View style={styles.backdropView}>
                                <Text style={styles.smsText}>Someone you know has a crush on you. They’ve sent you an anonymous wink through the sixwinks app. See if you can find out who it is at sixwinks.com</Text>
                            </View>
                        </Image>
                    </View>
                    <Spinner visible={spinner} size={'large'}/>
                    <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
        );
    }
}

const styles = Object.assign(StyleSheet.create({
    backdropView:{
        marginTop: utils.sizeForBaseSize(110),
        marginLeft: utils.sizeForBaseSize(50),
        marginRight: utils.sizeForBaseSize(40),
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0)',
    },
    smsText:{
        fontFamily: theme.fontLight,
        color: "#FFFFFF",
        justifyContent: 'space-between',
        padding: 15,
        fontSize: utils.sizeForBaseSize(14),
    },
    content: {
        flex: 1,
        marginBottom: 40,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
        paddingBottom: 0,
    },
    message: {
        flex: 1,
        marginTop: utils.sizeForBaseSize(30),
        paddingLeft: 20,
    },
    receivedTextBold: {
        fontFamily: theme.fontRegular,
        color: '#CEDADF',
        fontSize: utils.sizeForBaseSize(20),
    },
    receivedImageView: {
        alignItems: 'center',
    },
    receivedImage: {
        width : utils.sizeForBaseSize(320),
        height : utils.sizeForBaseSize(350),
        resizeMode: 'cover',
    },
}), themeStyles);
