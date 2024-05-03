import { By } from "selenium-webdriver";
import { DataObject } from "./interface";
import { saveData, initDriver } from "./utils";

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
    const outerDiv = await driver.findElement(By.css("div[style*='box-sizing']"));

    const containers = await outerDiv.findElements(By.css(".info-company-button-stack"));

    for (const container of containers) {
        let temp: DataObject = {
            title: "",
            publicationDate: "",
            deadline: "",
            location: "",
            company: "",
            sourceSite: "Karir.com",
            link: "",
        }
        temp.title = await container.findElement(By.css(".info-company-stack p:nth-child(1)")).getText();
        temp.company = await container.findElement(By.css(".info-company-stack p:nth-child(2)")).getText();
        temp.location = await container.findElement(By.css(".info-company-stack p:nth-child(4)")).getText();
        const bottomStackElement = await container.findElement(By.xpath("following-sibling::div[contains(@class, 'bottom-stack')]"));
        temp.deadline = await bottomStackElement.findElement(By.css(".MuiTypography-root")).getText();
        // container.click();
        // temp.publicationDate = await outerDiv.findElement(By.css('p.MuiTypography-body1[type="Body2"][type="Body2"]')).getText();

        // Print job information
        console.log(temp);
        console.log("------------");

        data.push(temp);
    }
    driver.quit();
    saveData(data);
}