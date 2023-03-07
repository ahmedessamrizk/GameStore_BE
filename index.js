import dotenv from 'dotenv'
dotenv.config({ path: ('./config/.env') })
import express from 'express'
import { appRouter } from './src/modules/index.router.js';


const app = express()
const port = process.env.PORT
appRouter(app);

app.listen(port, () => console.log(`Server is running on port ${port}!`));
