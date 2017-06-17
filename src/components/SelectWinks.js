'use strict';

import _ from 'lodash';
import React, { Component } from 'react';
import { InteractionManager, Image, StyleSheet, View, Text, ListView, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Container,  List, ListItem, Icon, InputGroup, Input, Button } from 'native-base';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import Alert from 'react-native-dropdownalert';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from './HeaderLogo';
import contactUtils from '../utils/contacts'
import DeviceInfo from 'react-native-device-info';
import utils from '../utils/utils';

const maxWinksPerAttempt = 6;
const wink0   = require('../resources/images/countdown-0.png');
const wink1   = require('../resources/images/countdown-1.png');
const wink2   = require('../resources/images/countdown-2.png');
const wink3   = require('../resources/images/countdown-3.png');
const wink4   = require('../resources/images/countdown-4.png');
const wink5   = require('../resources/images/countdown-5.png');
const wink6   = require('../resources/images/countdown-6.png');

export default class SelectWinks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedContacts: [],
            selectedContactsCount: 0,
            requiredContactsCount: maxWinksPerAttempt,
            alreadyWinkedContacts: [],
            filter: null,
            searching: null,
            showOverlay : true
        };
    }

    componentDidMount(){
        let _this = this;
        InteractionManager.runAfterInteractions(() => {
            let dataSource = new ListView.DataSource({rowHasChanged: (oldRow, newRow) => oldRow !== newRow});
            _this.setState({
                contacts: dataSource.cloneWithRows(_this.props.contacts),
                contactsAll: _this.props.contacts,
                contactsArray: _this.props.contacts,
            });
            this.props.actions.updateContacts(_this.props.user);
        });
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isEqual(nextProps.contacts, this.props.contacts)) {
            this.setState({
                contacts            : this.state.contacts.cloneWithRows(nextProps.contacts),
                contactsAll         : nextProps.contacts,
                contactsArray       : nextProps.contacts,
            });
        }
    }

    _pluralizeWinks(count) {
        if (count <= 1) {
            return 'wink'
        }
        return 'winks';
    }

    _pressContact(rowId) {
        let selectedContact  = this.state.contactsAll[rowId];
        let selectedContacts = _.filter(this.state.contactsAll, 'selected');
        if (contactUtils.isNumberSelected(selectedContact, selectedContacts)) {
            return
        }

        let UpdatedContacts = Object.assign({}, this.state.contactsArray);
        if (this.state.contactsArray[rowId] !== undefined) {
            //the contact is in the currently visible list, adjust the visible list
            UpdatedContacts[rowId] = {
                ...this.state.contactsArray[rowId],
                selected: !this.state.contactsArray[rowId].selected
            };
        }

        let updatedAllContacts = Object.assign({}, this.state.contactsAll);
        updatedAllContacts[rowId] = {
            ...this.state.contactsAll[rowId],
            selected: !this.state.contactsAll[rowId].selected
        };
        if (this._processUpdatedContacts(UpdatedContacts, updatedAllContacts)) {
            this.setState({contactsAll: updatedAllContacts});
        }
    }

    _processUpdatedContacts(UpdatedContacts, allContacts) {
        let selectedContacts      = _.filter(allContacts, 'selected')
        let selectedContactsCount = selectedContacts.length;
        let requiredContactsCount = (maxWinksPerAttempt - selectedContactsCount);
        if(requiredContactsCount < 0) {
            this.dropdown.alertWithType('info', 'Info',`You can send only ${maxWinksPerAttempt} winks in one attempt`);
            return false;
        }

        this.setState({
            contacts: this.state.contacts.cloneWithRows(UpdatedContacts),
            selectedContacts: selectedContacts,
            selectedContactsCount: selectedContactsCount,
            requiredContactsCount:  requiredContactsCount,
            contactsArray: UpdatedContacts,
        });
        if(requiredContactsCount === 0) {
            this.props.actions.goto({  page: 'sendWinks', data: { contacts: selectedContacts } })
        }
        return true;
    }

    _processNextButton() {
        if(this.state.requiredContactsCount > 0) {
            this.dropdown.alertWithType('info', 'Info',`please choose ${this.state.requiredContactsCount} more ${this._pluralizeWinks(this.state.requiredContactsCount)}`);
            return false;
        } else {
            this._processUpdatedContacts(this.state.contactsArray, this.state.contactsAll);
        }
    }

    _processSearchFilter(filter) {
        this.setState({ searching: true, filter: filter });

        if (!filter) {
            dismissKeyboard();
            this._processUpdatedContacts(this.state.contactsAll, this.state.contactsAll);
            setTimeout(function() { this.setState({ searching: null }) }.bind(this), 0);
            return;
        }

        let filtered = _.filter(this.state.contactsAll, function(contact) {
            if(contact.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0) { return contact }
            if (contact.number.indexOf(filter.toLowerCase()) >= 0) { return contact }
        });
        filtered = _.keyBy(filtered, 'id');
        this._processUpdatedContacts(filtered, this.state.contactsAll);
        this.setState({ searching: null })
    }

    _renderContactButtons(){
        let pressContact = this._pressContact.bind(this);
        return (
            <View style={styles.selectedButtons}>
                {
                    this.state.selectedContacts.map(function (contact, i) {
                        let rowId = contact.id;
                        return (
                            <View key={i}>
                                <Text style={styles.contactButton}  onPress={() => pressContact(rowId)}>{contact.name}
                                    <Text style={styles.removeIcon}>   x</Text>
                                </Text>
                            </View>
                        );
                    })
                }
            </View>
        );

    }

    _word() {
        let winksRequired = this.state.requiredContactsCount;
        var word = '';
        switch (winksRequired) {
            case 0:
                word = wink0;
                break;
            case 1:
                word = wink1;
                break;
            case 2:
                word = wink2;
                break;
            case 3:
                word = wink3;
                break;
            case 4:
                word = wink4;
                break;
            case 5:
                word = wink5;
                break;
            case 6:
                word = wink6;
                break;
            default:
                word = wink6;
        }
        return (
            <Image style={styles.winksWord} source={word}/>
        );
    }

    _hideFirstUse() {
        this.setState({showOverlay: false});
        this.props.actions.incrementOverlayCount();
    }

    _renderFirstUseOverlay(){
        let mustShow = this.props.user.overlayCount < 2 || this.props.user.overlayCount === undefined;
        mustShow = mustShow && this.state.showOverlay;
        if (mustShow) {
            return (
                <View style={styles.overlay}>
                    <Text style={styles.firstUseTextLarge}>Anyone receiving a wink from you will never know it's
                        you...</Text>
                    <Text style={styles.firstUseTextSmall}>...unless you tell them</Text>
                    <View style={styles.btnContainer}>
                        <Button block info style={styles.btn} textStyle={styles.btnText}
                                onPress={this._hideFirstUse.bind(this)}>
                            Got it!
                        </Button>
                    </View>
                </View>
            )
        }
    }

    _renderContactsList() {
        if (_.isEmpty(this.state.contactsAll) || (this.state.searching)) {
            return (<ActivityIndicator size={'large'} color={'white'} /> )
        } else {
            return(
                <ListView initialListSize={500} pageSize={500} enableEmptySections dataSource={this.state.contacts}
                          renderRow={(contact, sectionId, rowId) =>
                              <ListItem style={styles.contactItem}
                                        button onPress={() => this._pressContact(rowId)}>
                                  <Text style={styles.contact}>{contact.name}</Text>
                                  <Text style={styles.contactNumber}>{contact.number}</Text>
                              </ListItem>
                          }>
                </ListView>
            )
        }
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={()=> dismissKeyboard()}>
            <Container theme={theme} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.back}>{/*DeviceInfo.getReadableVersion()*/}</Text>
                    <HeaderLogo />
                    <Text style={styles.next} onPress={this._processNextButton.bind(this)}>next</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.message}>
                        <Text style={styles.text}>
                            {'\n'}select {this._word()}<Text style={styles.textBold}> {this._pluralizeWinks(this.state.requiredContactsCount)}.</Text>
                        </Text>
                        <Text style={styles.textSmall}>it's completely anonymous{'\n'}</Text>

                            {
                                (this.state.selectedContactsCount > 0)
                                    ?this._renderContactButtons() : <Text/>
                            }
                        <InputGroup borderType='regular' style={styles.searchInputGroup}>
                            <Icon name='md-search' style={styles.searchIcon}/>

                            <Input placeholder='search' placeholderTextColor="#00B7FF" value={this.state.filter} onChangeText={(filter) => this._processSearchFilter(filter)} style={styles.searchInput}/>
                            {(this.state.filter && this.state.filter !== '')
                                ?
                                <Icon name='md-close-circle' style={styles.closeIcon} onPress={() => {
                                    this._processSearchFilter(null);
                                }} />
                                : ''
                            }
                        </InputGroup>
                    </View>

                    <View style={styles.contactList}>
                        {this._renderContactsList()}
                        {this._renderFirstUseOverlay()}
                    </View>

                <Alert ref={(ref) => this.dropdown = ref} closeInterval={5000} />
                </View>
            </Container>
            </TouchableWithoutFeedback>
        );
    }

}

const styles = Object.assign(StyleSheet.create({
    firstUseTextLarge :{
        flex        : 3,
        fontSize    : utils.sizeForBaseSize(30),
        fontFamily  : theme.fontRegular,
        color       : "#000000",
    },
    firstUseTextSmall : {
        flex        : 1,
        textAlign   :"right",
        fontSize    : utils.sizeForBaseSize(20),
        color       : "#000000",
    },
    btnContainer :{
        marginLeft  :   utils.sizeForBaseSize(50),
        marginRight :   utils.sizeForBaseSize(50),
    },
    btn: {
        borderRadius: 10,
        alignItems: 'center',
        color : '#00B7FF',
    },
    overlay : {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        padding: utils.sizeForBaseSize(30),
        backgroundColor: "#ffffffCC"
    },
    contactList: {
        flex: 1,
        borderColor: '#002E42',
        bottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 5,
        paddingBottom: 5,
        marginRight: 2,
        justifyContent: 'center',
    },
    contactItem: {
        borderBottomWidth: 0,
        paddingLeft: 0,
        paddingBottom: 3,
        paddingTop: 3,
        marginLeft: 0,
        borderColor: '#568090',
        borderWidth: 0,
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
    },
    contactNumber: {
        padding: 0,
        margin: 0,
        paddingLeft: 0,
        marginTop: 5,
        marginLeft:5,
        fontFamily: theme.fontLight,
        fontSize: 12,
        color: '#00B7FF',
        fontWeight: '100',
    },
    content: {
        flex: 1,
        marginBottom: 40,
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
    },
    message: {
        paddingLeft: 20,
    },
    contentFooter: {
        paddingLeft: 20,
        paddingRight: 20,
        height: 20,
    },
    searchInputGroup: {
        marginRight: 20,
        borderColor: '#568090',
        paddingLeft: 10,
        marginBottom: 20,
    },
    searchInput: {
        fontSize:20,
        color: '#fff',
        fontFamily: theme.fontLight,
    },
    searchIcon: {
        fontSize: 20,
        color: '#00B7FF',
    },
    closeIcon: {
        fontSize: 26,
        color: '#00B7FF',
    },
    removeIcon: {
        fontSize: 12,
        color: '#FFFFFF',
    },
    selectedButtons : {
        flexDirection:'row',
        flexWrap:'wrap',
        alignItems: 'flex-start',
    },
    contactButton :{
        fontFamily: theme.fontLight,
        color: '#FFFFFF',
        fontSize: 12,
        padding: 2,
        paddingLeft: 5,
        borderColor: "#568090",
        borderWidth: 1,
        borderRadius:5,
        marginRight:5,
        marginBottom:10,

    },
    text: {
        marginTop:-20,
        marginBottom: 20,
    },
    winksWord: {
        height: 25,
        width: 25,
    }
}), themeStyles);
