const puppeteer = require('puppeteer');
const rd = require("../app/ran");

const searchGoogleImages = async (query) => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    // Hàm cuộn trang với phương pháp setTimeout thay vì page.waitForTimeout
    const scrollPage = async () => {
        let previousHeight = 0;
        let maxScrolls = 10;
        let scrollCount = 0;

        while (scrollCount < maxScrolls) {
            let newHeight = await page.evaluate('document.body.scrollHeight');

            if (newHeight === previousHeight) {
                console.log("Reached the end of the page.");
                break;
            }

            previousHeight = newHeight;
            await page.evaluate('window.scrollBy(0, document.body.scrollHeight)');

            // Sử dụng setTimeout để tạm dừng thay vì page.waitForTimeout
            await new Promise(resolve => setTimeout(resolve, 1000));

            scrollCount++;
            console.log(`Scrolled ${scrollCount} times`);
        }
    };

    await scrollPage();

    let imageUrls = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.startsWith('http'));
    });

    imageUrls = imageUrls.filter(url => url.includes('images?'));
    await browser.close();
    return imageUrls;
};

let getImageResults = async () => {
    const cats = await url.searchGoogleImages("cat meme gif");
    return cats;
};

const fetchData = async () => {
    let data = await getImageResults();
    return data[rd.randomIndex(0,data.length-1)];
};
module.exports ={
    fetchData
}
