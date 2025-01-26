const img = (name) =>{
    return {
        "attachment": {
            "type": "image",
            "payload": {
                "url": `"${name}"`
            }
        }
    };
}
module.exports = {
    img
}