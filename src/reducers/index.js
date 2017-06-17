import { combineReducers } from 'redux'
import { reducer as router } from 'react-native-router-redux';
import chats from './chats';
import contacts from './contacts';
import user from './user';
import routes from './routes';

export default combineReducers({
    chats,
    contacts,
    router,
    routes,
    user,
})
