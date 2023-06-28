import { asyncHandler } from "../../../middleware/asyncHandler.js";
import { findById, create, updateOne, findOne, findByIdAndUpdate } from './../../../../DB/DBmethods.js';
import gameModel from './../../../../DB/models/game.model.js';
import cartModel from './../../../../DB/models/cart.model.js';

export const addToCart = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params;
        const exist = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false }, select: 'name' });
        if (!exist) {
            return next(Error('game not exist', { cause: 404 }));
        }
        const checkCart = await findOne({ model: cartModel, filter: { userId: req.user._id } });
        //check if user has past cart
        if (checkCart) {
            const update = await updateOne({
                model: cartModel, filter: { _id: checkCart._id }
                , data: { $addToSet: { games: gameId } }
            })
            return update.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error('Something went wrong', { cause: 400 }));
        } else { //new cart
            const games = [];
            games.push(gameId);
            const add = await create({ model: cartModel, data: { userId: req.user._id, games } });
            return add ? res.status(200).json({ message: "done" }) : next(Error('Something went wrong', { cause: 400 }));
        }

    }
)

export const removeFromCart = asyncHandler(
    async (req, res, next) => {
        const { gameId } = req.params;
        const exist = await findOne({ model: gameModel, filter: { _id: gameId, isDeleted: false }, select: 'name' });
        if (!exist) {
            return next(Error('game not exist', { cause: 404 }));
        }
        const update = await updateOne({
            model: cartModel, filter: { userId: req.user._id }
            , data: { $pull: { games: gameId } }
        })
        return update.modifiedCount ? res.status(200).json({ message: "done" }) : next(Error('no exist cart', { cause: 400 }));
    }
)

export const getCart = asyncHandler(
    async (req, res, next) => {
        let cart = await findOne({ model: cartModel, filter: { userId: req.user._id } });
        if (!cart) {
            return next(Error('no exist cart', { cause: 404 }))
        }
        //to allow changes on the cart
        cart = cart.toObject();

        //to check if game is deleted
        let index = 0, total = 0, change = false;
        const games = [];

        for (const gameId of cart.games) {
            let game = await findById({ model: gameModel, filter: { _id: gameId }, select: 'name desc mainPic isDeleted price slug' })
            if (game?.isDeleted) {
                cart.games.splice(index, 1);
                change = true;
            }
            else {
                game = game.toObject();
                delete game.isDeleted;
                games.push(game);
                total += game.price;
            }
            index++;
        }
        if (change) {
            await findByIdAndUpdate({ model: cartModel, filter: { _id: cart._id }, data: { games: cart.games } });
        }
        cart.numberOfItems = cart.games.length;
        cart.games = games;
        cart.total = total;
        return res.status(200).json({ message: "done", cart });
    }
)