import React, { Component } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Container } from 'native-base';
import theme from '../config/BlueTheme';
import { themeStyles } from '../config/styles';
import HeaderLogo from '../components/HeaderLogo';
import imageUtils from '../utils/image';
import PercentageCircle from 'react-native-percentage-circle';
import RNFetchBlob from 'react-native-fetch-blob'
import api from '../API/api';
import utils from '../utils/utils';

export default class ViewImage extends Component {
    constructor(props) {
        super(props);
        let messageId = props.router.data.messageId;
        let myImage = props.router.data.myImage;
        let image = props.router.data.image;
        if (myImage === true) {
            this.state = {
                messageId   : messageId,
                myImage     : myImage,
                image       : image,
            };
        } else {
            this.state = {
                messageId   : messageId,
                myImage     : myImage,
                percentComplete: 0,
            };
            imageUtils.fetchImage(image,
                (percent) => {
                    this.setState({percentComplete: percent});
                },
                (path) => {
                    path = 'file://' + path;
                    this.setState({
                        percentComplete: 100,
                        image: path,
                    });
                }
            );
        }
        this._goBack = this._goBack.bind(this);
        this._markImageViewed = this._markImageViewed.bind(this);
    }

    _goBack() {
        this._markImageViewed();
    }

    _markImageViewed(){
        let myImage = this.state.myImage;
        if (!myImage) {
            //remove all tmp files
            let chatId      = this.props.router.data.connectionId;
            let messageId   = this.props.router.data.messageId;
            let params = {
                chatId      : chatId,
                messageId   : messageId
            };
            api.post('imageViewed', params)
                .then((response) => {
                    let localFile = this.state.image;
                    RNFetchBlob.fs.unlink(localFile);
                    imageUtils.deleteImage(chatId, messageId);
                    this.props.actions.pop({data :this.props.router.data});
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            this.props.actions.pop({data :this.props.router.data});
        }
    }

    render() {
        let image = this.state.image;
        return (
            <Container theme={theme} style={styles.container}>

                <View style={styles.header}>
                    <Text style={styles.back} onPress={this._goBack}>back</Text>
                    <HeaderLogo />
                    <Text style={styles.back}></Text>
                </View>
                {(this.state.image === undefined) ?
                    <View style={styles.percentCirle}>
                        <PercentageCircle radius={60}
                                          borderWidth={5}
                                          innerColor={"#004058"}
                                          bgcolor={"#004058"}
                                          percent={this.state.percentComplete}
                                          color={"#3498db"}>
                            <Text style={styles.downloading}>Downloading</Text>
                        </PercentageCircle>
                    </View>
                    :
                <Image style={styles.image}
                             source={{uri:image}}/>
                }
            </Container>
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
    image : {
        flex : 1,
        resizeMode: 'contain',
    },
    percentCirle: {
        flex: 1,
        marginTop: 20,
        paddingTop: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloading: {
        fontFamily: theme.fontRegular,
        color: '#ffffff',
        fontSize: utils.sizeForBaseSize(12),
        fontWeight: 'normal',
    },

}), themeStyles);