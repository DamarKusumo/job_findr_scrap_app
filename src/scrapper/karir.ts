import { By, until } from "selenium-webdriver";
import { DataObject } from "./interface";
import { saveData, initDriver, consoleData } from "./utils";

const baseURL = 'https://karir.com/search-lowongan?keyword=';

export const karirRunner = async () => {
    await save("Programmer");
    await save("Data");
    await save("Network");
    await save("Cyber Security");
}

export const save = async (job: string) => {
    const driver = await initDriver(baseURL + job);
    let data: DataObject[] = [];
    await driver.wait(until.elementLocated(By.xpath("//div/div[2]/div[3]/div/div/div")), 10000);
    const outerDiv = await driver.findElement(By.xpath("//div/div[2]/div[3]/div/div/div"));

    const containers = await outerDiv.findElements(By.className("info-company-button-stack"));

    for (const container of containers) {
        let temp: DataObject = {
            id: "",
            title: "",
            publicationDate: "",
            location: "",
            company: "",
            sourceSite: "Karir.com",
            link: "",
        }
        temp.title = await container.findElement(By.css(".info-company-stack p:nth-child(1)")).getText();
        temp.company = await container.findElement(By.css(".info-company-stack p:nth-child(2)")).getText();
        temp.location = await container.findElement(By.css(".info-company-stack p:nth-child(4)")).getText();
        const bottomStackElement = await container.findElement(By.xpath("following-sibling::div[contains(@class, 'bottom-stack')]"));
        // temp.deadline = await bottomStackElement.findElement(By.css(".MuiTypography-root")).getText();
        await container.click();
        // await driver.wait(until.elementTextIs(driver.findElement(By.css('.MuiTypography-root.MuiTypography-body1')), temp.title), 10000);


        // Print job information
        console.log(temp);
        await driver.wait(until.elementLocated(By.id("job-header-wrapper")), 10000);
        const detail = await outerDiv.findElement(By.id("job-header-wrapper"));

        // console.log(text);
        console.log("------------");

        data.push(temp);
    }
    driver.quit();
    consoleData(data);
    // saveData(data);
}