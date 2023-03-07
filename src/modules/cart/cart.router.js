import { Router } from 'express'
import auth from '../../middleware/auth.js';
import { cartRoles } from './cart.roles.js';
import * as cartController from './controller/cart.js'
import { validation } from './../../middleware/validation.js';
import * as cartValidators from './cart.validation.js'


const router = Router();

router.put('/add/:gameId',validation(cartValidators.addOrRemoveCart) ,auth(cartRoles.add), cartController.addToCart)
router.put('/remove/:gameId',validation(cartValidators.addOrRemoveCart) ,auth(cartRoles.add), cartController.removeFromCart)
router.get('/', auth(cartRoles.add), cartController.getCart)

export default router