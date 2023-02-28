import { Router } from 'express'
import auth from '../../middleware/auth.js';
import * as userController from './controller/user.js'
import { userRoles } from './user.roles.js';
import { myMulter, fileFormat, HME } from './../../services/multer.js';

const router = Router();

router.put('/profile/update', auth(userRoles.updateProfile), userController.updateProfile);
router.patch('/profilePic', auth(userRoles.updateProfile), myMulter(fileFormat.image).single('image'), HME, userController.addProfilePic);
router.patch('/covPics', auth(userRoles.updateProfile), myMulter(fileFormat.image).array('image', 5), HME, userController.addCovPics);
router.patch('/delete/:userId', auth(userRoles.removeUser), userController.deleteUser);
router.patch('/block/:userId', auth(userRoles.removeUser), userController.blockUser);
router.patch('/role/:userId', auth(userRoles.deleteOrBlockUser), userController.addRole);
router.patch('/following/add/:userId', auth(userRoles.add), userController.addFollowing);
router.patch('/following/remove/:userId', auth(userRoles.add), userController.removeFollowing);
router.patch('/password/update', auth(userRoles.updateProfile), userController.updatePassword);
router.get('/profile/:id', auth(userRoles.getProfile), userController.getProfile);
router.get('/profile', auth(userRoles.getProfile), userController.getProfile);
router.get('/signout', auth(userRoles.signout), userController.signOut);
router.get('/users', auth(userRoles.getUsers), userController.getUsers);

export default router