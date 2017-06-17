'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, Text,TouchableOpacity } from 'react-native';
import { Container } from 'native-base';
import TimerMixin from 'react-timer-mixin';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from './HeaderLogo';
import PercentageCircle from 'react-native-percentage-circle';
import userUtils from '../utils/user';
import utils from '../utils/utils';
const Dimensions = require('Dimensions');

export default class WaitToWink extends Component {

    constructor(props) {
        super(props);
        this.state = { timeTillWink: userUtils.timeTillNextWink(this.props.user)};
        this.mounted = false;
    }

    componentDidMount(){
        if (!this.mounted) {
            this.mounted = true;
            let timeTillNext = userUtils.timeTillNextWink(this.props.user);
            if (timeTillNext.asSeconds() <= 0) {
                this._gotoSelectWinks();
            } else {
                this._setTimer = this._setTimer.bind(this);
                this._setTimer();
            }
        }
        this.mounted = true;
    }

    componentWillReceiveProps(nextProps) {
        if (!this.mounted) {
            return
        }
        if(nextProps.user !== this.props.user) {
            this.setState({ timeTillWink: userUtils.timeTillNextWink(nextProps.user)})
        }
        if (this.props.router.currentRoute === "waitToWink") {
            this._setTimer();
        }
    }

    _gotoSelectWinks(){
        if (this.props.router.currentRoute === "waitToWink" && this.props.routes.initialTab === 0) {
            this.mounted = false;
            this.props.actions.resetModal({page: 'selectWinks'});
        }
    }

    _setTimer() {
        if (this.timer !== undefined) {
            TimerMixin.clearTimeout(this.timer);
        }
        this.timer = TimerMixin.setInterval(() => {
            if (!this.mounted) {
                return
            }
            let timeTillNext = userUtils.timeTillNextWink(this.props.user);
            if (timeTillNext.asSeconds() <= 0) {
                this._gotoSelectWinks();
            } else {
                this.setState({
                    timeTillWink: timeTillNext
                });
            }
        }, 1000);

    }

    _calcPercent() {
        return userUtils.timeTillNextWinkPercent(this.props.user);
    }

    _renderTimeRemain() {
        let timeTillNext = userUtils.timeTillNextWink(this.props.user);
        if (timeTillNext.asSeconds() <= 0) {
           return  (
                <Text>
                    <Text style={styles.timerHours}>00:</Text>
                    <Text style={styles.timerMinutes}>00:</Text>
                    <Text style={styles.timerSeconds}>00</Text>
                </Text>

            )
        } else {
            let duration = this.state.timeTillWink;
            let hours = duration.hours();
            if (hours < 10) {
                hours = "0" + hours;
            }
            let minutes = duration.minutes();
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            let seconds = duration.seconds();
            if (seconds < 10) {
                seconds = "0" + seconds;
            }

            return (
                <Text>
                    <Text style={styles.timerHours}>{hours}:</Text>
                    <Text style={styles.timerMinutes}>{minutes}:</Text>
                    <Text style={styles.timerSeconds}>{seconds}</Text>
                </Text>

            )
        }
    }

    _winkGraph() {
        let timeTillNext = userUtils.timeTillNextWink(this.props.user);
        if (timeTillNext.asSeconds() <= 0) {
            return null;
        }
        let percent = this._calcPercent();
        let width = Dimensions.get('window').width * 0.3;
        let outerRadius = width;
        let innerRadius = width-utils.sizeForBaseSize(25);
        return (
            <View style={styles.percentCircle}>
                <PercentageCircle radius={outerRadius} borderWidth={15} innerColor={"#004058"} bgcolor={"#004058"} percent={percent} color={"#3498db"}>
                    <PercentageCircle radius={innerRadius} borderWidth={0} innerColor={"#9AB3BD"} bgcolor={"#9AB3BD"} percent={100} color={"#9AB3BD"}>
                        {this._renderTimeRemain()}
                    </PercentageCircle>
                </PercentageCircle>
            </View>
        )
    }

    render() {
        if (this.props.router.currentRoute !== "waitToWink") {
            return null;
        } else {
            return (
                <Container theme={theme} style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.back}></Text>
                        <HeaderLogo />
                        <Text style={styles.next}></Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.winkTimer}>
                            <TouchableOpacity onPress={this._gotoSelectWinks.bind(this)}>
                                <Text style={styles.textYay}>
                                    yay! you can send {'\n'}another <Text style={styles.textBold}>sixwinks</Text> in:
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {this._winkGraph()}
                        <View style={styles.bottom}>
                            <Text style={styles.textYay}>remember, they have no idea</Text>
                            <Text style={styles.textYay}>who winked at them.</Text>
                            <Text style={styles.textYay}>{'\n'}you will only be connected if the same person you winked
                                at also winks at you.</Text>
                        </View>
                    </View>
                </Container>
            );
        }
    }
}

const styles = Object.assign(StyleSheet.create({
    content: {
        flex: 1,
        marginBottom: utils.sizeForBaseSize(40),
        marginLeft: 20,
        marginRight: 20,
        borderColor: '#568090',
        borderWidth: 1,
        padding: 20,
        justifyContent: 'space-between'
    },
    percentCircle: {
        marginTop: utils.sizeForBaseSize(20),
        paddingTop: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    winkTimer: {
        marginTop: 10,
    },
    bottom: {
        alignItems: 'flex-start',
        justifyContent: 'flex-end',

    },
    textYay: {
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: utils.sizeForBaseSize(18),
    },
    timerHours: {
        fontFamily: theme.fontBold,
        color: '#004058',
        fontSize: utils.sizeForBaseSize(40),
        fontWeight: 'bold',
    },
    timerMinutes: {
        fontFamily: theme.fontRegular,
        color: '#004058',
        fontSize: utils.sizeForBaseSize(40),
        fontWeight: 'normal',
    },
    timerSeconds: {
        fontFamily: theme.fontLight,
        color: '#004058',
        fontSize: utils.sizeForBaseSize(40),

    }
}), themeStyles);
