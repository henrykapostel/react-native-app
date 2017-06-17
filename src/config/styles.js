import { StyleSheet } from 'react-native';
import theme from './BlueTheme';
import utils from '../utils/utils';

export const themeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#004058',
    },
    header: {
        justifyContent: 'space-between',
        flexDirection:  'row',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 0,
        marginLeft: 20,
        marginRight: 20,
    },
    back: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: utils.sizeForBaseSize(26),
        textAlign: 'left',
    },
    next: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: utils.sizeForBaseSize(26),
        textAlign: 'right',
    },
    text: {
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: utils.sizeForBaseSize(22),
    },
    textSmall: {
        fontFamily: theme.fontLight,
        color: '#9AB3BD',
        fontSize: 16,
    },
    textBold: {
        fontFamily: theme.fontRegular,
        color: '#fff',
        fontSize: utils.sizeForBaseSize(24),
    },

    inputGroup: {
        marginBottom: 10,
        padding: 5,
        backgroundColor: '#f5f5f5'
    },
    input: {
        fontFamily: theme.fontRegular,
        fontSize: utils.sizeForBaseSize(22),
    },
    btn: {
        borderRadius: 10,
    },
    btnText: {
        color: '#fff',
    },
    footer: {
        backgroundColor: '#004058',
        borderColor: '#002E42',
        borderTopWidth: 1,
    },

    timerImage: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        width: 270,
        height: 270,
    },
    timerText: {
        backgroundColor: 'transparent',
        fontFamily: theme.fontLight,
        color: '#fff',
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'center',
        marginLeft: -40,
    },
    tabbar: {
        backgroundColor: '#004058',
        borderColor: '#002E42',
        borderTopWidth: 0,
        height: 50,
        justifyContent: 'center',
    },
    tabIndicator: {
        flex: 1,
        borderBottomWidth: 4,
        borderColor: '#00B7FF',
    },
    tabIcon: {
        backgroundColor: 'transparent',
        color: '#fff',
        fontSize: 26,
        marginBottom: 5,
    },
    tabIconImage: {
        width: 24,
        height: 24,
        marginBottom: 5,
    },
    tabIconSelected: {
        color: '#00B7FF',
    },
    badge: {
        marginTop: 4,
        marginRight: 70,
        backgroundColor: '#00B7FF',
        height: 20,
        width: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        // elevation: 4,
    },
    counter: {
        marginTop: 4,
        backgroundColor: '#00B7FF',
        height: 24,
        width: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    count: {
        color: '#fff',
        fontFamily: theme.fontRegular,
        fontSize: 10,
    },
})
