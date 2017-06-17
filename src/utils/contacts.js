import Promise from 'bluebird';
import Contacts from 'react-native-contacts';
import _ from 'lodash';
let PNF = require('google-libphonenumber').PhoneNumberFormat;
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const contactUtils = {

    getPhonebookContacts: () => {
        return new Promise(function (resolve, reject) {
            Contacts.getAllWithoutPhotos(function (error, phoneBookContacts) {
                if (error !== null) {
                    reject('Unable to read phonebook contacts')
                } else {
                    resolve(phoneBookContacts)
                }
            })
        })
    },

    processPhonebookContacts: (phoneBookContacts, myNumber, prefix) => {
        let contacts = [];
        _.forEach(phoneBookContacts, function (contact) {
            if (contact.phoneNumbers.length === 0) {
                return;
            }
            let contactName = contactUtils.guessContactName(contact);
            if (contactName === "") {
                return;
            }

            _.forEach(contact.phoneNumbers, function (phoneNumber) {

                // strip spaces all characters except +
                let number = contactUtils.processPhoneNumber(phoneNumber.number, prefix);


                //filter out blank numbers
                //filter out my own number
                if (number !== "" && number !== myNumber) {
                    let newContact = {
                        name: contactName,
                        selected: false,
                        number: number,
                        id: contactName + " " + number
                    };
                    contacts = _.concat(contacts, newContact);
                }
            });
        });

        contacts = _.sortBy(contacts, 'name');
        contacts = _.keyBy(contacts, "id");
        return contacts;
    },

// guess/construct contact's display name
    guessContactName: (contact) => {
        let contactName = '';
        if (contact.givenName) {
            contactName = contact.givenName;
        }
        if (contact.middleName) {
            contactName = contactName + " " + contact.middleName;
        }
        if (contact.familyName) {
            contactName = contactName + " " + contact.familyName;
        }
        if (contactName === "") {
            if (contact.company) {
                contactName = contact.company;
            }
        }
        return contactName;
    },

// Process phone number and add country code if needed
    processPhoneNumber: (phoneNumber, prefix) => {
        try {
            if (_.startsWith(phoneNumber, '+')) {
                phoneNumber = phoneUtil.parse(phoneNumber, "");
            } else {
                let countryCode = _.replace(prefix, '+', '');
                let region = phoneUtil.getRegionCodeForCountryCode(countryCode);
                phoneNumber = phoneUtil.parse(phoneNumber, region);
            }
            phoneNumber = phoneUtil.format(phoneNumber, PNF.E164);
            return phoneNumber;
        } catch (error) {
            return "";
        }

    },

    isNumberSelected: (contact, allContacts) => {
        if (!contact) {
            return false;
        }
        if (contact.selected) {
            return false;
        }
        let selectedNumbers = _.map(allContacts, (c) => {
            return c.number;
        });
        return _.includes(selectedNumbers, contact.number);

    },
}

module.exports = contactUtils;