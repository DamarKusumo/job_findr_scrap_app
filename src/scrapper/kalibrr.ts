import { By, until } from "selenium-webdriver";
import { DataObject } from "./interface";
import { saveData, initDriver, consoleData } from "./utils";

const url = (job: String) => `https://www.kalibrr.com/home/te/${job.split(' ').join('-')}`;

export const kalibrrRunner = async () => {
    await save("Programmer");
    // await save("Data");
    // await save("Network");
    // await save("Cyber Security");
}

const save = async (job: string) => {
    const driver = await initDriver(url(job));
    // while contains <button class="k-btn-primary">Load more jobs</button>
    while (true) {
        await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
        await driver.sleep(2000);
        const loadMoreButton = (await driver.findElements(By.className("k-btn-primary")))
            .filter(async (button) => {
                return await button.getText() === "Load more jobs";
            });
        await driver.sleep(2000);
        if (loadMoreButton.length === 0) break;

        await loadMoreButton[0].click();
        await driver.sleep(2000);
    }
    // sleep for 5 seconds
    await driver.sleep(5000);
    driver.quit();
}