'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, Text, ListView, InteractionManager, ActivityIndicator } from 'react-native';
import { Container, Button, ListItem, } from 'native-base';
import Alert from 'react-native-dropdownalert';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from './HeaderLogo';

export default class SendWinks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            renderPlaceholder: true,
        };
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            let ds = new ListView.DataSource({rowHasChanged: (oldRow, newRow) => oldRow !== newRow});
            this.setState({
                contacts: ds.cloneWithRows(this.props.router.data.contacts),
                renderPlaceholder: false })
        })
    }
    _processNextButton() {
        this.props.actions.goto({  page: 'sendWinksShowSMS', data: { contacts: this.props.router.data.contacts } })
    }

    _backClick() {
        this.props.actions.pop(1);
    }
    render() {
        if (this.state.renderPlaceholder) {
            return this._renderPlaceholder()
        }
        return (
            <Container theme={theme} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.back} onPress={this._backClick.bind(this)}>back</Text>
                    <HeaderLogo />
                    <Text style={styles.next} onPress={this._processNextButton.bind(this)}>next</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>
                            happy to send{'\n'}
                            a wink to these folks?{'\n'}
                        </Text>
                    </View>

                    <View style={styles.contactList}>
                    <ListView initialListSize={6} pageSize={1} enableEmptySections dataSource={this.state.contacts}
                        renderRow={(contact, sectionID, rowID) =>
                            <ListItem style={[styles.contactItem, styles.selectedContactItem]} onPress={this._backClick.bind(this)}>
                                <Text style={[styles.contact, styles.selectedContact]}>{contact.name}</Text>
                                <Text style={styles.contactNumber}>{contact.number}</Text>
                            </ListItem>
                        }>
                    </ListView>
                    </View>

                    <View style={styles.contentFooter}>
                        <Button block info style={styles.btn} textStyle={styles.btnText}
                            onPress={this._processNextButton.bind(this)}>
                            Yes happy
                        </Button>
                    </View>
                    <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
        );
    }

    _renderPlaceholder() {
        return (
            <Container theme={theme} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.back} onPress={this.props.actions.pop}>back</Text>
                    <HeaderLogo />
                    <Text style={styles.next}>next</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>happy to send{'\n'}a wink to these{'\n'}folks?{'\n'}</Text>
                    </View>

                    <View style={styles.contactList}>
                        <ActivityIndicator size={'large'} color={'white'} />
                    </View>

                </View>
            </Container>
        );
    }

}

const styles = Object.assign(StyleSheet.create({
    contactList: {
        justifyContent: 'center',
        flex: 1.75,
        paddingLeft: 20,
        paddingRight: 20,
        marginRight: 2,
    },
    contactItem: {
        flex : 1,
        borderBottomWidth: 0,
        paddingLeft: 0,
        marginLeft: 0,
        borderColor: '#568090',
        borderWidth: 0,
    },
    selectedContactItem: {
        borderWidth: 1,
        borderBottomWidth: 1,
        paddingLeft: 10,
        marginBottom:10,
    },
    contactNumber: {
        flex : 1,
        padding: 0,
        margin: 0,
        paddingLeft: 0,
        marginTop: 5,
        marginLeft:5,
        fontFamily: theme.fontLight,
        fontSize: 12,
        color: '#00B7FF',
        fontWeight: '100',
        textAlign: 'right',
    },
    contact: {
        padding: 0,
        margin: 0,
        paddingLeft: 0,
        marginLeft: 0,
        fontFamily: theme.fontLight,
        color: '#00B7FF',
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left',
        flex : 1,
    },
    selectedContact: {
        color: '#f5f5f5',
    },
    content: {
        flex: 1,
        marginBottom: 40,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
        paddingBottom: 20,
    },
    message: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
    },
    contentFooter: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    counter: {
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: 18,
        fontWeight: 'normal',
        textAlign: 'left',
        opacity: 0,
    },
    counterBold: {
        fontFamily: theme.fontRegular,
        color: '#fff',
        fontSize: 20,
        textAlign: 'left',
        opacity: 0,
    },
    showCounter: {
        opacity: 1,
    },
    btn: {
        borderRadius: 10,
        marginLeft: 20,
        marginRight: 20,
        alignItems: 'center',
    },
}), themeStyles);
