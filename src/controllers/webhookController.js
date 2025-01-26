import request from 'request'
const mess = ["Bủh", "Lmao", "Bủh Bủh", "Bủh Lmao", "Chmúa mhề", "Dảk", "Bro go go", "go go brh brh"];
const obj = 'https://media1.tenor.com/m/zlKoX5HPPu8AAAAd/cat-annoyed.gif'
require('dotenv').config();

const rd = require("../app/ran")
const {fetchData} = require("../services/getURLImage");

const verifyToken = process.env.VERIFY_TOKEN;

const postWebHook =  (req,res) =>{
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}

const getWebHook = (req, res) => {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
            console.log(challenge)
        } else {
            res.sendStatus(403);
        }
    }
};

// Handles messages events
async function handleMessage(sender_psid, received_message) {
    let response;
    // Kiểm tra nếu tin nhắn chứa văn bản
    if (received_message.text) {
        response = {
            "text": `You say "${received_message.text}" I say "${mess[rd.randomIndex(0,mess.length - 1)]}"`
        };
        callSendAPI(sender_psid, response);

    } else if (received_message.attachments) {
        // Lấy URL của tệp đính kèm
        let attachment_url = received_message.attachments[0].payload.url;

        let response1 = {
            "attachment": {
                "type": "image",
                "payload": {
                    "url": "https://media4.giphy.com/media/wr7oA0rSjnWuiLJOY5/giphy.gif?cid=6c09b952n2qjjluh14edclbxofh4hdck7acj73bwec6wpfqr&ep=v1_gifs_search&rid=giphy.gif&ct=g"
                }
            }
        };

        // Gửi ảnh trước
        await callSendAPI(sender_psid, response1);
        console.log("Ảnh đã được gửi thành công!");

        // Sử dụng setTimeout để đảm bảo gửi ảnh trước rồi mới gửi nút
        setTimeout(async () => {
            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Bạn có muốn xem thêm nữa không?", // Tiêu đề
                                "buttons": [
                                    {
                                        "type": "postback",  // Nút khi bấm sẽ gửi postback
                                        "title": "Có :))",    // Tiêu đề nút
                                        "payload": "yes"      // Payload trả về khi nhấn
                                    },
                                    {
                                        "type": "postback",  // Nút khi bấm sẽ gửi postback
                                        "title": "Không :((",  // Tiêu đề nút
                                        "payload": "no"      // Payload trả về khi nhấn
                                    }
                                ]
                            }
                        ]
                    }
                }
            };

            await callSendAPI(sender_psid, response2);
            console.log("Nút đã được gửi thành công!");
        }, 7000);  // Chờ 2 giây trước khi gửi nút
    }
}


// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        let fake_message = {
            attachment: "temp"
            }

        await handleMessage(sender_psid, fake_message)

    } else if (payload === 'no') {
        response = { "text": "Oops, bye see ya" }
    }
    // Send the message to acknowledge the postback
    //callSendAPI(sender_psid, response);
}


// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

module.exports = {
    getWebHook,
    postWebHook
}