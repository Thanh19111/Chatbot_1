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
        let scrollCount = 0;
        let maxScrolls = 3;  // Bạn có thể điều chỉnh số lần cuộn để thử

        while (scrollCount < maxScrolls) {
            let newHeight = await page.evaluate('document.body.scrollHeight');

            // Kiểm tra xem chiều cao trang đã thay đổi chưa
            if (newHeight === previousHeight) {
                console.log("Đã cuộn đến cuối trang.");
                break;  // Nếu không thay đổi chiều cao, dừng cuộn
            }

            previousHeight = newHeight;

            // Cuộn trang xuống dưới
            await page.evaluate('window.scrollBy(0, document.body.scrollHeight)');

            // Chờ để các ảnh mới được tải vào
            await new Promise(resolve => setTimeout(resolve, 2000));

            scrollCount++;
            console.log(`Cuộn trang lần ${scrollCount}`);
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

const fetchData = async () => {
    let data = await searchGoogleImages('cat meme gif');

    // Kiểm tra nếu mảng không trống
    if (data.length === 0) {
        console.log("Không tìm thấy hình ảnh.");
        return;
    }

    // Trả về hình ảnh ngẫu nhiên
    return data[rd.randomIndex(0, data.length - 1)];
};

module.exports = {
    fetchData
};
