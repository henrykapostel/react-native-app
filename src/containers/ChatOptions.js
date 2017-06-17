import React, { Component } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, Platform } from 'react-native';
import { Container, InputGroup, Input, ListItem, CheckBox, Button } from 'native-base';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import firebase from 'firebase';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';
import Alert from 'react-native-dropdownalert';

export default class ChatOptions extends Component {
    constructor(props) {
        super(props);
        let connectionId     = this.props.router.data.connectionId;
        let connection       = props.user.connections[connectionId];
        let uid              = this.props.user.uid;
        let connectionRowId  = this.props.router.data.connectionRowId;
        if (connectionRowId === undefined) {
            console.warn("undefined connectionRowId")
        }
        let name = (connection.name !== undefined) ? connection.name : '';
        if (name === "new chat") {
            name = '';
        }
        this.state = {
            name            : name,
            muted           : (connection.muted !== undefined) ? connection.muted : false,
            uid             : uid,
            connectionRowId : connectionRowId,
            connectionId    : connectionId,
        }
        this._goBack = this._goBack.bind(this);
        this._pressSaveButton = this._pressSaveButton.bind(this);
    }
    componentWillMount() {
        if (Platform.OS === 'android') { AndroidKeyboardAdjust.setAdjustPan() }
    }

    _pressSaveButton() {
        let data          = {
            name    : this.state.name,
            muted   : this.state.muted
        };
        let connectionRowId  = this.state.connectionRowId;
        let node = 'users/' + this.state.uid + '/connections/' + connectionRowId;

        firebase.database().ref(node).update(data)
            .then(function () {
                this._goBack();
            }.bind(this))
            .catch(function (error) {
                console.log('Error writing chat options', error);
                this.dropdown.alertWithType('error', 'Error', 'Error writing chat options')
            }.bind(this));
    }

    _goBack() {
        if (Platform.OS === 'android') { AndroidKeyboardAdjust.setAdjustResize() }
        this.props.actions.pop({ data: this.props.router.data });
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={()=> dismissKeyboard()}>
            <Container theme={theme} style={styles.container}>

                <View style={styles.header}>
                    <Text style={styles.back} onPress={this._goBack}>back</Text>
                    <HeaderLogo />
                    <Text style={styles.next} onPress={this._pressSaveButton.bind(this)}>done</Text>
                </View>

                <View style={styles.content}>

                    <View style={styles.message}>
                        <Text style={styles.text}>chat <Text style={styles.textBold}>settings</Text></Text>
                        <Text style={styles.settingsText}>name</Text>
                        <InputGroup style={styles.inputGroup}>
                            <Input style={styles.input} placeholder='rename chat' defaultValue={this.state.name}
                                   onChangeText={(name) => this.setState({ name })}
                                    />
                        </InputGroup>

                        <ListItem style={styles.muteList}>
                            <CheckBox checkboxStyle={styles.checkBox} checked={this.state.muted} onPress={()=>this.setState({ muted: !this.state.muted })}>
                            </CheckBox>
                            <Text style={styles.muteText}>mute</Text>
                        </ListItem>
                        <Text style={styles.textSmall}>don't like where this conversation is going? just tick mute and this chat is silenced</Text>
                    </View>
                    <Button block large info style={styles.btn} textStyle={styles.btnText}
                            onPress={this._pressSaveButton.bind(this)} > save </Button>
                    <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
            </TouchableWithoutFeedback>
        )
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
    nameInputGroup: {
        marginBottom: 10,
        marginRight: 20,
        borderColor: '#568090',
        paddingLeft: 10,
    },
    nameInput: {
        fontSize:20,
        color: '#fff',
        fontFamily: theme.fontLight,
    },
    message: {
        flex: 1,
        marginTop:20,
        // justifyContent: 'center',
    },
    settingsText: {
        color:'#00B7FF',
        fontSize:20,
        fontFamily:theme.fontRegular,
        marginBottom:10,
        marginTop:20,

    },
    lightText: {
        color:'#FFFFFF',
        fontSize:20,
        fontFamily:theme.fontLight,
        marginRight:90,
        marginBottom:50

    },
    checkBox:{
        paddingLeft:50,
        color:"#FFFFFF"
    },
    muteList:{
        marginLeft:0,
        borderBottomWidth:0,
        marginTop:20
    },
    muteText: {
        color:'#00B7FF',
        fontSize:20,
        fontFamily:theme.fontRegular,

    },
}), themeStyles);
