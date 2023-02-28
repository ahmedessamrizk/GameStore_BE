import { Router } from 'express'
import auth from '../../middleware/auth.js';
import { gameRoles } from './game.roles.js';
import { myMulter, fileFormat } from './../../services/multer.js';
import * as gameController from './controller/game.js'
import { allRoles } from './../../middleware/auth.js';

const router = Router();


// Add Game Data
router.post('/add',
    myMulter(fileFormat.image).single('mainPic'),
    auth(gameRoles.A_SA),
    gameController.addGame
)
router.post('/:gameId/add/pics',
    myMulter(fileFormat.image).array('pics', 5),
    auth(gameRoles.A_SA),
    gameController.addGamePics
)
router.post('/:gameId/add/video',
    myMulter(fileFormat.video).single('video'),
    auth(gameRoles.A_SA),
    gameController.addGameVid
)

//Delete Game
router.patch('/:gameId/delete', auth(gameRoles.A_SA), gameController.removeGame)

//Update Game
router.put('/:gameId/update',
    myMulter(fileFormat.image).single('mainPic'),
    auth(gameRoles.A_SA),
    gameController.updateGame)

//ratings
// router.patch('/:gameId/rate', auth(allRoles), gameController.addRate)

export default router