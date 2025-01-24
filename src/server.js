import express from 'express'
import configView from './configs/configView'
import initWebRoutes from './routes/web'
require('dotenv').config()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

configView(app);
initWebRoutes(app);

app.listen(port, () => {
    console.log(`Hello Pham Thanh, I am running at localhost:${ port }/`)
})