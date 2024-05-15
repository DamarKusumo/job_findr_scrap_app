import axios, { AxiosError } from "axios"
import { DataObject } from "./interface";
import selenium from 'selenium-webdriver';
import { Options } from "selenium-webdriver/chrome";

export const initDriver = async (url: string) => {
    var options = new Options()
    options.addArguments("--start-maximized")
    options.addArguments("-disable-notifications")
    // options.addArguments('--headless')
    options.addArguments('--no-sandbox')
    options.addArguments('--disable-dev-shm-usage')

    const driver = new selenium.Builder()
        .forBrowser('chrome')
        // .setChromeOptions(options)
        .build();
    await driver.get(url);
    return driver;
}

export const consoleData = (data: DataObject[]) => {
    data.forEach(async item => {
        console.log(item);
    });
}

export const saveData = (data: DataObject[]) => {
    data.forEach(async item => {
        await save(item);
    });
}

const save = async (data: DataObject) => {
    const url = 'http://localhost:3000/api/data';
    try {
        const response = await axios.post(url, data);
        console.log(response.data);
    } catch (error) {
        if (!(error instanceof AxiosError)) {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.data) {
                const errMessage = axiosError.response.data;
                console.error(`Server Error: ${errMessage}`);
            } else {
                console.error('Unknown error occurred');
            }
        }
    }
}