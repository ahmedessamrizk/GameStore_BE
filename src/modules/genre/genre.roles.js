import { roles } from "../../middleware/auth.js";


export const genreRoles = {
    add:[roles.admin, roles.superAdmin],
    remove:[roles.admin, roles.superAdmin],
    update:[roles.admin, roles.superAdmin]
}