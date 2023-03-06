import { roles } from './../../../DB/models/user.model.js';

export const commentRoles = {
    A_SA:[roles.admin, roles.superAdmin],
    All:[roles.admin, roles.superAdmin, roles.user]
}