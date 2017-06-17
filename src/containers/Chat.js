import React, { Component } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Platform, Image } from 'react-native';
import { Container, Icon } from 'native-base';
import {GiftedChat, Actions, Bubble, Day, Message, MessageText, Time, Composer, InputToolbar} from 'react-native-gifted-chat';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import firebase from 'firebase';
import Alert from 'react-native-dropdownalert';
import _ from 'lodash';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';
import ImagePicker from 'react-native-image-crop-picker';
import permissionUtils from '../utils/permissions'
import chatUtils from '../utils/chats';
import imageUtils from '../utils/image';
import {CachedImage} from "react-native-img-cache";
import utils from '../utils/utils';
const actionIcon   = require('../resources/images/paperclip.png');

export default class Chat extends Component {
    constructor(props) {
        super(props);
        let connectionId = props.router.data.connectionId;
        let receiverId = props.router.data.receiverUid;
        this.state = {
            connectionId        : connectionId,
            receiverId          : receiverId,
            typing              : false,
        };
        this._sendMessage = this._sendMessage.bind(this);
        this._renderActions = this._renderActions.bind(this);
        this._touchImage  = this._touchImage.bind(this);
        this._renderMessageImage  = this._renderMessageImage.bind(this);
        this._renderMessageText  = this._renderMessageText.bind(this);
        this._renderMessage = this._renderMessage.bind(this);
    }

    _setup() {
        if (!this._getMuted()) {
            if (this.state.receiverId) {
                let node = 'chats/' + this.state.connectionId + '/members/' + this.state.receiverId;
                firebase.database().ref(node).off();
                firebase.database().ref(node).on('child_changed', this._updateTyping.bind(this));
            }
            this.props.actions.markChatAsRead(this.state.connectionId);
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        //TODO::implement proper checking - dont update an image if only the thumbnail uri changed
        return true;
        /*
        let nextChat = nextProps.chats[this.state.connectionId];
        let thisChat = this.props.chats[this.state.connectionId];
        let nextMessages = nextChat.messages;
        let thisMessages = thisChat.messages;
        let mustUpdate = false;
        _.forEach(thisMessages, function(thisMessage){
            let id = thisMessage._id;
            let nextMessage = _.find(nextMessages, {'_id':id});
            if (thisMessage.text !== nextMessage.text) {
                mustUpdate = true;
                return false; //stop _.forEach loop
            } else {
                console.log("message text not changed, not forcing rerender")
            }
        });
        return mustUpdate;
        */
    }

    componentWillReceiveProps(nextProps) {
        let nextChat = nextProps.chats[this.state.connectionId];
        let thisChat = this.props.chats[this.state.connectionId];
        if (!_.isEqual(thisChat, nextChat)) {
            chatUtils.markChatRead(this.state.connectionId);
            this.props.actions.markChatAsRead(this.state.connectionId);
        }
    }

    componentWillMount() {
        if (Platform.OS === 'android') { AndroidKeyboardAdjust.setAdjustResize() }
        this._setup();
        permissionUtils.requestCameraPermission();
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            AndroidKeyboardAdjust.setAdjustPan()
        }
        if (this.state.receiverId) {
            let node = 'chats/' + this.state.connectionId + '/members/' + this.state.receiverId;
            firebase.database().ref(node).off();
        }
    }

    _touchImage(image, messageId, myImage) {
        let data = this.props.router.data;
        data.image = image;
        data.messageId = messageId;
        data.myImage = myImage;
        this.props.actions.goto({  page: 'viewImage', data: data })
    }

    _sendMessage(messages = []) {
        let message = _.first(messages);

        chatUtils.sendMessageToServer(message, this.state.connectionId, this.state.receiverId).catch(error => {
            console.log('Failed to send your chat message');
            this.dropdown.alertWithType('error', 'Error', 'Failed to send chat message')
        });
        this._sendTyping('')
    }

    _sendTyping(text) {
        let typing = (text.trim().length > 0);
        let node = 'chats/' + this.state.connectionId + '/members/' + this.props.user.uid;
        firebase.database().ref(node).set({
            typing: typing
        }).catch(function(error) {
            console.error('Error updating typing status', error);
        });
    }

    _updateTyping(data) {
        if (data.key === 'typing') { this.setState({ typing: data.val() }) }
    }

    _renderLoading(props) {
        return (
            <ActivityIndicator size={'large'} color={'white'} style={styles.spinner}/>
        )
    }

    _renderDay(props) {
        return (
            <Day {...props} textStyle={styles.day} />
        )
    }

    _renderMessage(props) {

        return (
            <Message {...props} imageStyle={{ left: styles.noAvatar, right: styles.noAvatar }} containerStyle={{ left: styles.noAvatarContainer }}/>
        )
    }

    _renderBubble(props) {
        return (
            <Bubble {...props} wrapperStyle={{ left: styles.leftBubble, right: styles.rightBubble }} />
        )
    }

    _renderMessageText(props) {
        let leftStyle = styles.leftMessageText;
        let righStyle = styles.rightMessageText;
        let text = props.currentMessage.text;
        //assume no emoji
        let emoji = false;
        //test if string contains ascii chars
        let regex = RegExp("[a-z,A-Z,0-9]");
        if (!regex.test(text)) {
            //it contains no ascii
            regex = RegExp("(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*");
            //does it contain emoji?
            if (regex.test(text)) {
                emoji = true;
            }
        }

        if (emoji) {
            leftStyle = styles.leftMessageTextEmoji;
            righStyle = styles.rightMessageTextEmoji;
        }
        return (
            <MessageText {...props} textStyle={{ left: leftStyle, right: righStyle }}/>
        )
    }

    _renderMessageImage(props) {
        let image = props.currentMessage.image;
        let uri = image.thumbnailURL;
        let large = image.originalURL;
        if (uri === undefined) {
            return
        }
        let id = props.currentMessage._id;
        let myImage = (props.currentMessage.user._id === props.user._id);
        if (myImage === true) {
            return (
                <TouchableOpacity onPress={() => this._touchImage(large, id, myImage)}>
                    <Image style={styles.image} source={{uri: uri}}/>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity onPress={() => this._touchImage(large, id, myImage)}>
                    <CachedImage style={styles.image} source={{uri: uri}}/>
                </TouchableOpacity>
            )
        }
    }

    _renderTime(props) {
        return (
            <Time {...props} containerStyle={{ left: styles.timeContainer, right: styles.timeContainer }} textStyle={{ left: styles.leftTimeText, right: styles.rightTimeText }} />
        )
    }

    _renderFooter(props) {
        if (this.state.typing) {
            return (
                <MessageText {...props}
                    containerStyle={{ left: styles.typingContainer }}
                    textStyle={{ left: styles.typingText }}
                    currentMessage={{text: '...'}}
                />
            )
        }
        return null;
    }

    _renderInputToolbar(props) {
        return (
            <InputToolbar {...props} containerStyle={styles.inputToolbar} />
        )
    }

    _renderComposer(props) {
        return (
            <Composer {...props} textInputStyle={styles.composerInput}
                textInputProps = {{onChangeText: this._sendTyping.bind(this)}}
            />
        )
    }

    _renderSend(props) {
        if (props.text.trim().length > 0) {
            return (
                <TouchableOpacity onPress={() => {props.onSend({text: props.text.trim()}, true) }}>
                    <Icon name='md-arrow-dropright-circle' style={styles.send} />
                </TouchableOpacity>
            )
        }
        return <View/>
    }

    _sendMedia(response) {
        if (response.error !== undefined) {
            this.dropdown.alertWithType('error', 'Error', response.error);
            return;
        }
        let fileName = response.path;
        if (fileName === undefined) {
            return;
        }
        fileName = fileName.toUpperCase();
        if (fileName.endsWith(".JPG") || fileName.endsWith(".PNG")) {
            try {
                imageUtils.sendImage(response, this.props, this.state.connectionId, this.state.receiverId);
            } catch (error) {
                this.dropdown.alertWithType('error', 'Error', 'Failed to send image');
            }
        } else {
            //this._sendVideo(response);
        }
    }

    _renderActionsIcon(props) {
        return (
            <Image source={actionIcon} style={styles.actionIcon} />
        )
    }

    _renderActions(props) {
        let context = this;
        let pickerOptions = {
            cropping: true,
            width: 10000,
            height: 10000,
            mediaType : 'photo'
        };
        const options = {
            'Camera': (optionProps) => {
                ImagePicker.openCamera(pickerOptions).then(image => {
                    context._sendMedia(image);
                }).catch(error => {
                    //swallow error
                });
            },
            'Image': (optionProps) => {
                ImagePicker.openPicker(pickerOptions).then(image => {
                    context._sendMedia(image);
                }).catch(error => {
                    //swallow error
                });
            },
            'Cancel': () => {},
        };
        return (
            <Actions
                {...props}
                options={options}
                icon={this._renderActionsIcon}
            />
        );

    }

    _chatOptions() {
        this.props.actions.goto({  page: 'chatOptions', data: this.props.router.data })
    }

    _hasChatName() {
        let name = this._getChatName();
        if (name === undefined || name === "") {
            return false
        } else {
            return true
        }
    }

    _getMessages(){
        let chatId      = this.state.connectionId;
        let chats       = this.props.chats;
        let chat        = chats[chatId];
        let messages    = chat.messages;
        return messages;
    }

    _getMuted() {
        let connectionId = this.state.connectionId;
        let connection = this.props.user.connections[connectionId]
        let muted = connection.muted;
        return muted;

    }

    _getChatName(){
        let connectionId = this.state.connectionId;
        let connection = this.props.user.connections[connectionId]
        let name = connection.name;
        return name;
    }

    render() {
        let messages = this._getMessages();
        return (
            <Container theme={theme} style={styles.chatContainer}>
                <View style={styles.chatHeader}>
                    <Text style={styles.back} onPress={this.props.actions.pop}>back</Text>
                    {(this._hasChatName())
                        ?
                        <Text style={styles.chatName}>{this._getChatName()}</Text>
                        : <HeaderLogo/>
                    }
                    <Text style={[styles.next, styles.optionsButton]} onPress={this._chatOptions.bind(this)}>
                        { (Platform.OS === 'ios') ? <Icon name='ios-more'/> : <Icon name='md-more'/> }
                    </Text>
                </View>
                <View style={styles.chatContent}>
                    {(!this._getMuted()) ?
                        <GiftedChat
                            messages={messages}
                            user={{ _id: this.props.user.uid }}
                            onSend={this._sendMessage}
                            renderDay={this._renderDay}
                            renderBubble={this._renderBubble}
                            renderMessage={this._renderMessage}
                            renderMessageText={this._renderMessageText}
                            renderMessageImage={this._renderMessageImage}
                            renderLoading={this._renderLoading}
                            renderTime={this._renderTime}
                            renderFooter={this._renderFooter.bind(this)}
                            renderInputToolbar={this._renderInputToolbar}
                            renderComposer={this._renderComposer.bind(this)}
                            renderSend={this._renderSend.bind(this)}
                            renderActions={this._renderActions}
                            isAnimated={false}
                        />
                        : <View/>
                    }
                <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
          )
    }

}

const styles = Object.assign(StyleSheet.create({
    actionIcon: {
        height: utils.sizeForBaseSize(20),
        width: utils.sizeForBaseSize(20),
        padding: 0,
        margin: 0,
        flex : 1,
        resizeMode: 'cover',
        justifyContent: 'center'
    },
    leftBubble: {
        backgroundColor: '#004058',
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
    },
    rightBubble: {
        backgroundColor: '#9AB3BD',
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
    },
    leftMessageText: {
        fontFamily: theme.fontRegular,
        color: '#9AB3BD',
        fontSize: 16,
        lineHeight:22,
    },
    rightMessageText: {
        fontFamily: theme.fontRegular,
        color: '#004058',
        fontSize: 16,
        lineHeight:22,
    },
    leftMessageTextEmoji: {
        fontFamily: theme.fontRegular,
        color: '#9AB3BD',
        fontSize: 72,
        lineHeight:84,
    },
    rightMessageTextEmoji: {
        fontFamily: theme.fontRegular,
        color: '#004058',
        fontSize: 72,
        lineHeight:84,
    },
    leftTimeText: {
        color: '#aaa',
        fontFamily: theme.fontRegular,
    },
    rightTimeText: {
        color: '#666',
        fontFamily: theme.fontRegular,
    },
    day: {
        color: '#004058',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#00B7FF',
    },
    chatName:{
        fontFamily: theme.fontRegular,
        color: '#ffffff',
        fontSize: 20,
    },
    chatHeader: {
        backgroundColor: '#004058',
        justifyContent: 'space-between',
        flexDirection:  'row',
        padding: 10,
        alignItems: 'center',
    },
    chatContent: {
        flex: 1,
        backgroundColor: '#00B7FF',
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
    },
    noAvatar: {
        marginRight: 0,
        height:0,
        width:0,
        opacity: 0,
    },
    noAvatarContainer: {
        marginLeft: 0,
    },
    footerContainer: {
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#9AB3BD',
    },
    typingContainer: {
        backgroundColor: '#004058',
        padding: 0,
        marginBottom: 10,
        marginLeft: 10,
        width: 80,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typingText: {
        fontFamily: theme.fontRegular,
        fontWeight: '900',
        color: '#fff',
        fontSize: utils.sizeForBaseSize(30),
        marginTop: 0,
        marginBottom: 15,
    },
    timeContainer: {
        marginBottom: 0,
    },
    composerInput: {
        fontSize: 18,
        lineHeight: 20,
        fontFamily: theme.fontRegular,
    },
    send: {
        color: '#00B7FF',
        fontSize: 32,
        lineHeight: 32,
        marginTop: 6,
        marginBottom: 6,
        marginLeft: 10,
        marginRight: 10,
    },
    inputToolbar: {
    },
    image: {
        width: 150,
        height: 100,
        borderRadius: 13,
        margin: 3,
        resizeMode: 'cover',
    },
    optionsButton:{
        paddingRight: 10,
    }
}), themeStyles);
