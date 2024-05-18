import { By, until } from "selenium-webdriver";
import { DataObject } from "./interface";
import { saveData, initDriver, consoleData } from "./utils";
import * as cheerio from "cheerio";
import axios from "axios";
import { formatDate } from "./date-format";

const url = (job: String) => `https://www.kalibrr.com/home/te/${job.split(' ').join('-')}/co/Indonesia`;

export const kalibrrRunner = async () => {
    let res: DataObject[] = [];
    const programmer = await save("Programmer");
    if (programmer) for (const d of programmer) res.push(d);
    const data = await save("Data");
    if (data) for (const d of data) res.push(d);
    const network = await save("Network");
    if (network) for (const d of network) res.push(d);
    const cs = await save("Cyber Security");
    if (cs) for (const d of cs) res.push(d);
    consoleData(res);
    return res.length;
}

const save = async (job: string) => {
    let data: DataObject[] = [];
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
    await driver.quit();

    $('.k-font-dm-sans.k-rounded-lg.k-bg-white.k-border-solid.k-border.k-border.k-group.k-flex.k-flex-col.k-justify-between.css-1otdiuc').each((_, element) => {
        const jobCard = $(element);

        let temp: DataObject = {
            id: `kalibrr-${jobCard.find('a.k-text-black[itemprop="name"]').attr('href')?.split('/')[4]}`,
            title: jobCard.find('a.k-text-black[itemprop="name"]').text().trim(),
            publicationDate: '',
            location: $(jobCard.find('.k-flex.k-gap-4.k-text-gray-300 span')[0]).text().trim(),
            company: jobCard.find('a.k-text-subdued.k-font-bold').text().trim(),
            sourceSite: "kalibrr.com",
            linkDetail: 'https://www.kalibrr.com' + jobCard.find('a.k-text-black[itemprop="name"]').attr('href') || '',
            logoImgLink: jobCard.find('img.k-block').attr('src') || '',
            position: job,
        };
        getDatePublished(temp.linkDetail);
        data.push(temp);
    });

    for (const job of data) {
        const publicationDate = await getDatePublished(job.linkDetail);
        job.publicationDate = formatDate(publicationDate);
    }

    console.log("Fetching date published for kalibrr: " + job);

    const now = new Date();
    data = data.filter((job) => {
        const jobDate = new Date(job.publicationDate);
        return (now.getFullYear() - jobDate.getFullYear()) * 12 + now.getMonth() - jobDate.getMonth() < 2;
    });

    console.log("Finished scraping kalibrr: " + job);
    console.log('Found ' + data.length + ' jobs');

    // saveData(data);
    return data;

}

const getDatePublished = async (link: string): Promise<Date> => {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const date = new Date();
    const postedText = $('div.k-text-subdued.k-text-caption.md\\:k-text-right > p').first().text()
    const splitted = postedText.split(' ');

    if (splitted[1] == 'a')
        splitted[1] = '1';

    if (splitted[0] == 'Expired') {
        date.setFullYear(1970)
        return date;
    }

    if (splitted[2] in ['few', 'second', 'seconds', 'minute', 'minutes', 'hour', 'hours']) return date;

    if (splitted[2] == 'day' || splitted[2] == 'days') {
        date.setDate(date.getDate() - parseInt(splitted[1]));
        return date;
    }

    if (splitted[2] == 'month' || splitted[2] == 'months') {
        date.setMonth(date.getMonth() - parseInt(splitted[1]));
        return date;
    }

    if (splitted[2] == 'year' || splitted[2] == 'years') {
        date.setFullYear(date.getFullYear() - parseInt(splitted[1]));
        return date;
    }

    return date;
}