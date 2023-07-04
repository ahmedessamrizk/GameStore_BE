import { Router } from 'express'
import auth from '../../middleware/auth.js';
import * as userController from './controller/user.js'
import { userRoles } from './user.roles.js';
import { myMulter, fileFormat, HME } from './../../services/multer.js';
import { validation } from './../../middleware/validation.js';
import * as userValidators from './user.validation.js'

const router = Router();

router.put('/profile/update', validation(userValidators.updateProfile), auth(userRoles.update), userController.updateProfile);
router.patch('/profilePic', myMulter(fileFormat.image).single('image'), HME, auth(userRoles.update), userController.addProfilePic);
router.patch('/covPics', myMulter(fileFormat.image).array('image', 5), HME, auth(userRoles.update), userController.addCovPics);
router.patch('/delete/:userId', validation(userValidators.deleteUser), auth(userRoles.removeUser), validation(userValidators.deleteUser), userController.deleteUser);
router.patch('/block/:userId', validation(userValidators.blockUser), auth(userRoles.deleteOrBlockUser), userController.blockUser);
router.patch('/undelete/:userId', validation(userValidators.unDeleteUser), auth(userRoles.deleteOrBlockUser), userController.unDeleteUser);
router.patch('/unblock/:userId', validation(userValidators.unBlockUser), auth(userRoles.deleteOrBlockUser), userController.unBlockUser);
router.patch('/role/:userId', validation(userValidators.addRole), auth(userRoles.deleteOrBlockUser), userController.addRole);
router.patch('/following/add/:userId', validation(userValidators.addFollowing), auth(userRoles.add), userController.addFollowing);
router.patch('/following/remove/:userId', validation(userValidators.removeFollowing), auth(userRoles.add), userController.removeFollowing);
router.patch('/password/update', validation(userValidators.updatePassword), auth(userRoles.update), userController.updatePassword);
router.get('/profile/:id', validation(userValidators.getProfile), auth(userRoles.getProfile), userController.getProfile);
router.get('/profile', validation(userValidators.getProfile), auth(userRoles.getProfile), userController.getProfile);
router.get('/signout', auth(userRoles.signout), userController.signOut);
router.get('/users', validation(userValidators.getUsers), auth(userRoles.getUsers), userController.getUsers);
router.patch('/wishlist/add/:gameId', validation(userValidators.addToWishList), auth(userRoles.update), userController.AddToWishList);
router.patch('/wishlist/remove/:gameId', validation(userValidators.addToWishList), auth(userRoles.update), userController.removeFromWishList);
router.get('/activity', auth(userRoles.update), userController.getActivities);
router.get('/notifications', auth(userRoles.update), userController.getNotifications);
router.get('/wishlist', auth(userRoles.update), userController.getWishList);



export default router
