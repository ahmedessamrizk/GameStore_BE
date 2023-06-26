import { Router } from 'express'
import auth from '../../middleware/auth.js';
import { gameRoles } from './game.roles.js';
import { myMulter, fileFormat, HME } from './../../services/multer.js';
import * as gameController from './controller/game.js'
import rateRouter from './../rate/rate.router.js'
import commentRouter from './../comment/comment.router.js'
 

const router = Router();

//router to comment API
router.use("/:gameId/comment",commentRouter )


//router to rate API
router.use("/:gameId/rate",rateRouter )

// Add Game Data
router.post('/add',
    myMulter(fileFormat.image).single('mainPic'),HME,
    auth(gameRoles.A_SA),
    gameController.addGame
)
//add image
router.post('/:gameId/add/pics',
    myMulter(fileFormat.image).array('pics', 5),HME,
    auth(gameRoles.A_SA),
    gameController.addGamePics
)
//remove an image
router.patch('/:gameId/pics/remove/:publicId',
    auth(gameRoles.A_SA),
    gameController.removeImage)

router.post('/:gameId/add/video',
    myMulter(fileFormat.video).single('video'),HME,
    auth(gameRoles.A_SA),
    gameController.addGameVid
)

//Delete Game
router.patch('/:gameId/delete', auth(gameRoles.A_SA), gameController.removeGame)
//unDelete Game
router.patch('/:gameId/undelete', auth(gameRoles.A_SA), gameController.unRemoveGame)

//Update Game
router.put('/:gameId/update',
    myMulter(fileFormat.image).single('mainPic'),
    auth(gameRoles.A_SA),
    gameController.updateGame)


//Get Game/s
router.get("/all",gameController.getGames)
router.get("/:gameId",gameController.getGame)
router.get("/user/:userId",gameController.getUserGames)



export default router
