'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Container, Footer, Button, Icon } from 'native-base';
import Alert from 'react-native-dropdownalert';

import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from './HeaderLogo';

export default class ReceivedWinks extends Component {
    render() {
        return (
            <Container theme={theme} style={styles.container}>
                <View style={styles.header}>
                    <HeaderLogo />
                    <Text style={styles.next} onPress={this.props.actions.routes.selectWinks()}>next</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>
                        yay! you have received a <Text style={styles.textBold}>wink</Text> from an anonymous admirer. you have 48 hours to wink back at 6 people from your contacts list.
                        {'\n'}{'\n'}
                        if you’re spot on, we’ll connect you via chat.
                        {'\n'}all anonymously,
                        {'\n'}of course.
                        {'\n'}{'\n'}
                        </Text>
                    </View>

                    <Button block large info style={styles.btn} textStyle={styles.btnText}
                        onPress={this.props.actions.routes.selectWinks()} > next
                    </Button>
                    <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
        );
    }
}

const styles = Object.assign(StyleSheet.create({
    content: {
        flex: 1,
        marginBottom: 40,
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
}), themeStyles);
