import { Router } from 'express'
import auth from '../../middleware/auth.js';
import * as userController from './controller/user.js'
import { userRoles } from './user.roles.js';
import { myMulter, fileFormat, HME } from './../../services/multer.js';

const router = Router();

router.put('/profile/update', auth(userRoles.update), userController.updateProfile);
router.patch('/profilePic', myMulter(fileFormat.image).single('image'), HME, auth(userRoles.update), userController.addProfilePic);
router.patch('/covPics', myMulter(fileFormat.image).array('image', 5), HME, auth(userRoles.update), userController.addCovPics);
router.patch('/delete/:userId', auth(userRoles.removeUser), userController.deleteUser);
router.patch('/block/:userId', auth(userRoles.deleteOrBlockUser), userController.blockUser);
router.patch('/undelete/:userId', auth(userRoles.deleteOrBlockUser), userController.unDeleteUser);
router.patch('/unblock/:userId', auth(userRoles.deleteOrBlockUser), userController.unBlockUser);
router.patch('/role/:userId', auth(userRoles.deleteOrBlockUser), userController.addRole);
router.patch('/following/add/:userId', auth(userRoles.add), userController.addFollowing);
router.patch('/following/remove/:userId', auth(userRoles.add), userController.removeFollowing);
router.patch('/password/update', auth(userRoles.update), userController.updatePassword);
router.get('/profile/:id', auth(userRoles.getProfile), userController.getProfile);
router.get('/profile', auth(userRoles.getProfile), userController.getProfile);
router.get('/signout', auth(userRoles.signout), userController.signOut);
router.get('/users', auth(userRoles.getUsers), userController.getUsers);
router.patch('/wishlist/add/:gameId', auth(userRoles.update), userController.AddToWishList);
router.patch('/wishlist/remove/:gameId', auth(userRoles.update), userController.removeFromWishList);
router.get('/activity', auth(userRoles.update), userController.getActivities);
router.get('/wishlist', auth(userRoles.update), userController.getWishList);

export default router