import { Router } from 'express'
import auth from '../../middleware/auth.js';
import { cartRoles } from './cart.roles.js';
import * as cartController from './controller/cart.js'


const router = Router();

router.put('/add/:gameId', auth(cartRoles.add), cartController.addToCart)
router.put('/remove/:gameId', auth(cartRoles.add), cartController.removeFromCart)
router.get('/', auth(cartRoles.add), cartController.getCart)

export default router