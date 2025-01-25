const random = function getRandomIntInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const string = ["Bủh", "Lmao", "Bủh Bủh", "Bủh Lmao", "Chmúa mhề", "Dảk", "Bro go go", "go go brh brh"];

module.exports =  {
    random,
    string
}
