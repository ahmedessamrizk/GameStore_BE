import { findOne, findOneAndUpdate } from './../../DB/DBmethods.js';
import userModel, { roles } from '../../DB/models/user.model.js'

export const superAdmin = async (emails = []) => {
    emails.forEach(email => {
        makeAdmin(email);
    });
}

const makeAdmin = async (email) => {
    //await findOneAndUpdate({ model: userModel, filter: { email, role: { $ne: roles.superAdmin } }, data: { role: roles.superAdmin } });
}