const puppeteer = require('puppeteer');

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
    console.log(imageUrls);

    await browser.close();
    return imageUrls;
};
module.exports ={
    searchGoogleImages
}
