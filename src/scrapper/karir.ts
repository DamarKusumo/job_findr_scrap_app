import { By, until, Key } from "selenium-webdriver";
import { DataObject } from "./interface";
import { saveData, initDriver, consoleData, sleep } from "./utils";

const baseURL = 'https://karir.com/search-lowongan';

export const karirRunner = async () => {
    let res: DataObject[] = [];
    const driver = await initDriver(baseURL);

    const programmer = await searchByJob("Programmer", driver);
    if (programmer !== undefined) for (const d of programmer) res.push(d);
    const data = await searchByJob("Data", driver);
    console.log(data?.length);
    if (data !== undefined) for (const d of data) res.push(d);
    const network = await searchByJob("Network", driver);
    if (network !== undefined) for (const d of network) res.push(d);
    const cyberSecurity = await searchByJob("Cyber Security", driver);
    if (cyberSecurity !== undefined) for (const d of cyberSecurity) res.push(d);
    driver.quit();

    consoleData(res);
    return res.length;
}

const searchByJob = async (job: string, driver: any) => {
    let data: DataObject[] = [];
    const searchField = await driver.findElement(By.xpath("//div/input"));
    await searchField.sendKeys(Key.chord(Key.CONTROL, "a")); 
    await searchField.sendKeys(Key.BACK_SPACE);
    await searchField.sendKeys(job);
    await driver.findElement(By.xpath("//button[contains(.,'Cari')]")).click();
    await driver.wait(async () => {
        const currentUrl = await driver.getCurrentUrl();
        return currentUrl === (baseURL + `?keyword=${encodeURIComponent(job)}`);
    }, 10000, 'URL did not match expected value');
    try {
        await driver.wait(until.elementLocated(By.className("pagination")), 10000);
    } catch {
        return
    }
    const pagination = await driver.findElement(By.className("pagination"));
    const pages = await pagination.findElements(By.xpath(".//div"));
    const pagesLen = pages.length;
    for (let i = 0; i < pagesLen; i++) {
        const nextPage = pages[i];
        await nextPage.click();
        await sleep(2000);

        const containers = await driver.findElements(By.className("info-company-button-stack"));
        const contLen = containers.length;

        for (let j = 0; j < contLen; j++) {
            let temp: DataObject = {
                id: "",
                title: "",
                publicationDate: "",
                location: "",
                company: "",
                sourceSite: "Karir.com",
                linkDetail: baseURL + `?keyword=${job}`,
                position: job,
                logoImgLink: "",
            }
            await containers[j].click();

            await driver.wait(until.elementLocated(By.xpath("(//p[@type='Body2'])[6]")), 10000);
            const strPubDate = (await driver.findElement(By.xpath("(//p[@type='Body2'])[6]")).getText());
            const formatedDate = formatDate(strPubDate);
            if (!formatedDate) continue;
            temp.publicationDate = formatedDate

            const title = await containers[j].findElement(By.css(".info-company-stack p:nth-child(1)")).getText();
            temp.title = title;
            const company = await containers[j].findElement(By.css(".info-company-stack p:nth-child(2)")).getText();
            temp.company = company;
            temp.id = `${title}-${company}-karir`;
            temp.location = await containers[j].findElement(By.css(".info-company-stack p:nth-child(4)")).getText();
            const pictElement = await driver.findElement(By.xpath(`(//img[@alt='job image'])[${j + 1}]`));
            temp.logoImgLink = await pictElement.getAttribute("src");

            data.push(temp);
        }
    }
    
    return data;
}

const formatDate = (strDate: string) => {
    const totalDate = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    if (year % 4 === 0) totalDate[1] = 29;
    const lstStr = strDate.split(" ");
    const strNumber = parseInt(lstStr[1]);
    const strTime = lstStr[2];
    if (strTime.toLowerCase() === "hari") {
        if (day > strNumber) day -= strNumber;
        else {
            day += totalDate[month - 2] - strNumber;
            month -= 1;
        }
    } else if (strTime.toLowerCase() === "bulan") {
        if (strNumber > 2) return null
        if (month > 2) month -= strNumber;
        else {
            month += 12 - strNumber;
            year -= 1;
        }
    } else if (strTime.toLowerCase() === "tahun") {
        return null
    }

    return `${year}-${month}-${day}`
}