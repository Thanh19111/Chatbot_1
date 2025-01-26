const img = (nam) =>{
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