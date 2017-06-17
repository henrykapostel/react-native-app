'use strict';

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Container, Button, InputGroup, Input, Icon } from 'native-base';
import Alert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';
import utils from '../utils/utils';
import contactUtils from '../utils/contacts';
import auth from '../API/auth';

export default class RegistrationPage extends Component {
    constructor(props) {
        super(props);
        this.state = { mobile: '', prefix:'', spinner: false };
    }

    _getPrefix() {
        let prefix = this.state.prefix;
        if (!_.startsWith(prefix, "+")) {
            prefix = _.replace(prefix, new RegExp('^'), '+')
        }
        return prefix;
    }

    _getNumber() {
        let mobile = this.state.mobile;
        let prefix = this._getPrefix();
        let number = contactUtils.processPhoneNumber(mobile, prefix);
        return number;
    }

    async _sendOtp() {
        let number = this._getNumber();
        let prefix = this._getPrefix();
        let props = this.props;
        // TODO:: add the spinner overlay into axios interceptors at one place.
        this.setState({ spinner: true });
        try {
            let uid = await auth.register(number, prefix);
            props.actions.goto({  page: 'activation', data: { uid: uid } });
            this.setState({ spinner: false });
        } catch (error) {
            let message = (error.response) ?  error.response.data.message : error.message;
            this.dropdown.alertWithType('error', 'Error', message);
            this.setState({ spinner: false });
        }

    }

    render() {
        const { actions } = this.props;

        return (
            <Container theme={theme} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.back} onPress={actions.pop}>back</Text>
                    <HeaderLogo />
                    <Text style={styles.next} onPress={this._sendOtp.bind(this)}>next</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>please enter your mobile number and click register and we’ll text you a code to submit. simple as that</Text>
                    </View>
                    <KeyboardAwareScrollView keyboardShouldPersistTaps={true}>
                        <View style={styles.headers}>
                            <Text style={styles.inputHeaderPrefix}>Country Code</Text>
                            <Text style={styles.inputHeaderNumber}>Mobile Number</Text>
                        </View>
                        <View style={styles.phoneNumber}>
                            <InputGroup style={styles.inputPrefix}>
                                <Input style={styles.input}
                                       placeholder='+27'
                                       defaultValue="+"
                                       keyboardType="phone-pad"
                                       maxLength={4}
                                       onChangeText={(prefix) => this.setState({prefix})}
                                       returnKeyType="send"
                                       blurOnSubmit={false}
                                       autoFocus={true}
                                />
                            </InputGroup>
                            <InputGroup style={styles.inputNumber}>
                                <Input style={styles.input}
                                       placeholder='0821234567'
                                       defaultValue="0"
                                       keyboardType="phone-pad"
                                       maxLength={10}
                                       onChangeText={(mobile) => this.setState({mobile})}
                                       returnKeyType="send"
                                       onSubmitEditing={this._sendOtp.bind(this)}
                                       blurOnSubmit={false}
                                />
                            </InputGroup>
                        </View>
                        <Button large block info style={styles.btn} textStyle={styles.btnText} onPress={this._sendOtp.bind(this)}> register </Button>
                    </KeyboardAwareScrollView>
                    <Spinner visible={this.state.spinner} size={'large'}/>
                    <Alert ref={(ref) => this.dropdown = ref} />

                </View>
            </Container>
        );
    }
}

const styles = Object.assign(StyleSheet.create({
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
        justifyContent: 'center',
    },
    phoneNumber: {
        flexDirection:"row",
        marginBottom: 10,
        padding: 5,
    },
    headers: {
        flexDirection:"row",
        alignSelf: "stretch"

    },
    inputHeaderPrefix: {
        paddingLeft: 5,
        flex : 3,
        fontSize:utils.sizeForBaseSize(16),
        color: '#fff',
        fontFamily: theme.fontLight,
        marginBottom: 0,
        paddingBottom: 0,
    },
    inputHeaderNumber: {
        paddingLeft: 20,
        flex : 5,
        fontSize:utils.sizeForBaseSize(16),
        color: '#fff',
        fontFamily: theme.fontLight,
        marginBottom: 0,
        paddingBottom: 0,
    },
    inputPrefix: {
        backgroundColor: '#f5f5f5',
        flex : 3,
    },
    inputNumber: {
        marginLeft: 20,
        backgroundColor: '#f5f5f5',
        flex: 5,
    },
}), themeStyles);