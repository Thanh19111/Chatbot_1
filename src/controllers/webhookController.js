import request from 'request'

const obj = require("../services/default")
const cnt = obj.obj.length;
const imgrd = require("../app/imgrd");
const mess = obj.mess;


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

        await callSendAPI(sender_psid, response);

        let response1 = imgrd.img(obj.obj[rd.randomIndex(0,cnt - 1)]);

        await callSendAPI(sender_psid, response1);
        console.log("Ảnh đã được gửi thành công!");

    } else if (received_message.attachments) {

        console.log(received_message.attachments);

        // Lấy URL của tệp đính kèm
        let attachment_url = received_message.attachments[0].payload.url;

        let response1 = imgrd.img(obj.obj[rd.randomIndex(0,cnt - 1)]);

        // Gửi ảnh trước
        console.log(response1);
        console.log(obj.obj.length);

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
        }, 12000);
    }
}


// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        console.log("User clicked YES, resending image...");

        // Tạo một tin nhắn giả lập giống như khi nhận ảnh từ người dùng
        let fake_message = {
            attachments: [
                {
                    type: 'image',
                    payload: {
                        url: 'https://scontent.xx.fbcdn.net/v/t39.1997-6/39178562_1505197616293642_5411344281094848512_n.png?stp=cp0_dst-png&_nc_cat=1&ccb=1-7&_nc_sid=23dd7b&_nc_ohc=Ie9ABoejEpUQ7kNvgEssQ0p&_nc_ad=z-m&_nc_cid=0&_nc_zt=26&_nc_ht=scontent.xx&_nc_gid=AUVFzgVzPzXG0eWga_pxHED&oh=00_AYBvCUYI-nW5jp7tuELsogcQaN01aJXrJi6VE1uiSSyl_A&oe=679BC74B',
                        sticker_id: 369239263222822
                    }
                }
            ]
        };

        // Gọi lại hàm handleMessage với tin nhắn giả lập
        await handleMessage(sender_psid, fake_message);

    } else if (payload === 'no') {
        response = { "text": "Oops, bye see ya" }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
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