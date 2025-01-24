import express from 'express'
import configView from './configs/configView'
import initWebRoutes from './routes/web'
require('dotenv').config()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const hostname = 'localhost';
const port = 8000;

configView(app);
initWebRoutes(app);

app.listen(port, hostname, () => {
    console.log(`Hello Pham Thanh, I am running at ${ hostname }:${ port }/`)
})