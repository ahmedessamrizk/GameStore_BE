import { roles } from "../../../DB/models/user.model.js";


export const genreRoles = {
    add:[roles.admin, roles.superAdmin],
    get:[roles.admin, roles.superAdmin],
    remove:[roles.admin, roles.superAdmin],
    update:[roles.admin, roles.superAdmin]
}