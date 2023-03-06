import { roles } from './../../../DB/models/user.model.js';

export const gameRoles = {
    A_SA:[roles.admin, roles.superAdmin],
    All:[roles.admin, roles.superAdmin, roles.user]
}