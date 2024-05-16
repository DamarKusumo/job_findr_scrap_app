import { By, until } from "selenium-webdriver";
import { DataObject } from "./interface";
import { saveData, initDriver, consoleData } from "./utils";
import * as cheerio from "cheerio";

const url = (job: String) => `https://www.kalibrr.com/home/te/${job.split(' ').join('-')}/co/Indonesia`;

export const kalibrrRunner = async () => {
    await save("Programmer");
    await save("Data");
    await save("Network");
    await save("Cyber Security");
}

const save = async (job: string) => {
    const data: DataObject[] = [];
    const driver = await initDriver(url(job));
    while (true) {
        await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
        try {
            const loadMoreButton = await driver.findElement(By.xpath("//*[@class='k-btn-primary' and text()='Load more jobs']"));
            await loadMoreButton.click();
        } catch (_) { break; }
        await driver.sleep(200);
    }

    const $ = cheerio.load(await driver.getPageSource());

    $('.k-font-dm-sans.k-rounded-lg.k-bg-white.k-border-solid.k-border.k-border.k-group.k-flex.k-flex-col.k-justify-between.css-1otdiuc').each((_, element) => {
        const jobCard = $(element);

        let temp: DataObject = {
            id: `kalibrr-${jobCard.find('a.k-text-black[itemprop="name"]').attr('href')?.split('/')[4]}`,
            title: jobCard.find('a.k-text-black[itemprop="name"]').text().trim(),
            publicationDate: processDate($(jobCard.find('.k-flex.k-gap-4.k-text-gray-300 span')[3]).text().trim()),
            location: $(jobCard.find('.k-flex.k-gap-4.k-text-gray-300 span')[0]).text().trim(),
            company: jobCard.find('a.k-text-subdued.k-font-bold').text().trim(),
            sourceSite: "kalibrr.com",
            linkDetail: 'https://www.kalibrr.com' + jobCard.find('a.k-text-black[itemprop="name"]').attr('href') || '',
            logoImgLink: jobCard.find('img.k-block').attr('src') || '',
            position: job,
        };
        data.push(temp);
    });

    driver.quit();
    saveData(data);
    consoleData(data);
}

const processDate = (timeString: String) => {
    let splitted = timeString.split(' ');
    let date = new Date();
    if (splitted[4] in ['hours', 'hour', 'minutes', 'minute', 'seconds', 'second'])
        date = new Date();
    if (splitted[4] in ['days', 'day'])
        date.setDate(date.getDate() - parseInt(splitted[3]));
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
}