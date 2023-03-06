
import { find } from './../../DB/DBmethods.js';
import rateModel from './../../DB/models/rate.model.js';

const calcAvgRate = async (gameId) => {
    const allRatings = await find({ model: rateModel, filter: { gameId }, select: "-_id value" })
    const totalNum = allRatings.length
    let total = 0;

    for (let i = 0; i < totalNum; i++) {
        total += allRatings[i].value
    }

    return Math.round((total / totalNum) * 10) / 10;
}

export default calcAvgRate