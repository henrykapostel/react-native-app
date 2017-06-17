'use strict';

import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Linking } from 'react-native';
import { Container, Button, CheckBox, List, ListItem } from 'native-base';
import Alert from 'react-native-dropdownalert';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';

const logo   = require('../resources/images/text-logo.png');

export default class Welcome extends Component {
    constructor(props) {
        super(props);
        this.state = { agreed: false }
    }
    _handleClick(url) {
        Linking.canOpenURL(url).then(supported => {
            if (supported) { Linking.openURL(url) }
        })
    }
    _pressSignupButton() {
        if(this.state.agreed) {
            this.props.actions.goto({ page: 'registration' })
        } else {
            this.dropdown.alertWithType('info', 'Info','Please agree to terms and conditions');
        }
    }
    render() {
        const { actions } = this.props;
        return (
            <Container theme={theme} style={styles.container}>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>welcome to</Text>
                        <Image source={logo} style={styles.logo} />
                        <Text style={styles.text}>
                            wink at{"\n"}
                            your friends{"\n"}
                            anonymously.{"\n"}
                            who knows, they{"\n"}
                            may wink back.{"\n"}
                        </Text>
                    </View>

                    <ListItem style={styles.terms}>
                        <CheckBox checked={this.state.agreed} onPress={()=>this.setState({ agreed: !this.state.agreed })}/>
                        <Text style={styles.termsText}>I agree to <Text style={styles.urlText} onPress={() => this._handleClick('http://sixwinks.com/terms/')}>terms and conditions</Text>
                        </Text>
                    </ListItem>
                    <Button block large info style={[styles.btn, !this.state.agreed && styles.btnDisabled]}
                            textStyle={styles.btnText}
                            onPress={this._pressSignupButton.bind(this)} > sign me up </Button>
                    <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
        );
    }
}

const styles = Object.assign(StyleSheet.create({
    content: {
        flex: 1,
        marginTop: 40,
        marginBottom: 60,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
        padding: 20,
    },
    logo: {
        marginTop: 10,
        marginBottom: 10,
        marginLeft: -20,
        height: 60,
        width: 200,
        justifyContent: 'flex-start',
    },
    message: {
        flex: 1,
        justifyContent: 'center',
    },
    terms: {
        marginLeft: 0,
        borderBottomWidth: 0,
    },
    termsText: {
        fontFamily: theme.fontLight,
        color: '#CEDADF',
        fontSize: 14,
    },
    urlText: {
        color: '#00B7FF',
    },
    btnDisabled: {
        backgroundColor: '#9AB3BD',
    }
}), themeStyles);
