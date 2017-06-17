'use strict';

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Container, Button, InputGroup, Input, Icon } from 'native-base';
import Alert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';
import userUtils from '../utils/user'
import auth from '../API/auth';
import utils from '../utils/utils';
import FCM from 'react-native-fcm';

export default class ActivationPage extends Component {
    constructor(props) {
        super(props);
        this.state = { otp: '', spinner: false };
    }

    async _verifyOtp() {
        this.setState({ spinner: true });
        try {
            let uid = this.props.router.data.uid;
            let otp = this.state.otp;
            let user = await auth.activate(uid, otp);
            this.props.actions.updateUserProfile(user, this.props);
            FCM.getFCMToken().then((fcmToken) => {
                userUtils.updateFcmRefreshToken(fcmToken, this.props);
            });

            this.props.actions.resetChats();
            userUtils.addListeners(user, this.props);
            userUtils.configureRoute(this.props);
        } catch (error) {
            this.setState({ spinner: false });
            console.log(error);
            this.dropdown.alertWithType('error', 'Error', 'Failed to activate your mobile.')
        }

    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={()=> dismissKeyboard()}>

                <Container theme={theme} style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.back} onPress={this.props.actions.pop}>back</Text>
                        <HeaderLogo />
                        <Text style={styles.next}></Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.message}>
                            <Text style={styles.text}>
                                please enter the verification code you received in your sms.{'\n'}
                            </Text>
                            <View style={styles.spacing}>
                                <InputGroup style={styles.inputGroup}>
                                    <Input  style={styles.input}
                                            placeholder='Verification Code'
                                            keyboardType="numeric"
                                            maxLength={6}
                                            onChangeText={(otp) => this.setState({otp})}
                                            onSubmitEditing={this._verifyOtp.bind(this)}
                                            returnKeyType="send"
                                            blurOnSubmit={false}
                                            autoFocus={true}/>
                                </InputGroup>
                                <Button large block info style={styles.btn} textStyle={styles.btnText} onPress={this._verifyOtp.bind(this)}> verify </Button>
                            </View>
                            <Spinner visible={this.state.spinner} size={'large'}/>
                            <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                        </View>
                    </View>
                </Container>
            </TouchableWithoutFeedback>
        );
    }
}


const styles = Object.assign(StyleSheet.create({
    spacing:{
        marginTop:30,
    },
    inputGroup: {
        marginBottom: 10,
        marginTop: 30,
        padding: 5,
        backgroundColor: '#f5f5f5'
    },
    input: {
        marginBottom: 5,
        padding: 0,
        fontSize: utils.sizeForBaseSize(20),
    },
    content: {
        flex: 1,
        marginBottom: 60,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
        padding: 20,
    },
    message: {
        flex: 1,
    },
}), themeStyles);
