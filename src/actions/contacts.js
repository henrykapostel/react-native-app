import contactUtils from '../utils/contacts'
import permissionUtils from '../utils/permissions';

const contactActions = {

    updateContacts:(user) => {
        return function(dispatch) {
            contactActions.buildContactsFromPhonebook(user, dispatch);
        }
    },

    buildContactsFromPhonebook: async (user, dispatch) => {
        let havePermission = await permissionUtils.requestContactsPermission();
        if (havePermission) {
            contactUtils.getPhonebookContacts()
                .then((phoneBookContacts) => {
                    let myNumber  = user.phoneNumber;
                    let prefix    = user.prefix;
                    let contacts  = contactUtils.processPhonebookContacts(phoneBookContacts, myNumber, prefix);
                    dispatch({ type: 'UPDATE_CONTACTS', payload: { contacts: contacts } });
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

};

module.exports = contactActions;