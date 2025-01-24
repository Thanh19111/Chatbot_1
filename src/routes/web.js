import express from "express";
import homeController from "../controllers/homeController";
import webhook from "../controllers/webhookController";

const router = express.Router();
const initWebRoutes = (app)=>{
    router.get("/" , homeController.getHomePage );
    router.get("/webhook", webhook.getWebHook );
    router.post("/webhook", webhook.postWebHook );
    return app.use("/",router);
}
module.exports = initWebRoutes;