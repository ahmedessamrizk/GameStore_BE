import { roles } from './../../../DB/models/user.model.js';

export const cartRoles = {
    add: [roles.admin, roles.user, roles.superAdmin],
    
}