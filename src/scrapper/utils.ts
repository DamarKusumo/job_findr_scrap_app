import axios, { AxiosError } from "axios"
import { DataObject } from "./interface";
import selenium from 'selenium-webdriver';
import { Options } from "selenium-webdriver/chrome";

export const initDriver = async (url: string) => {
    const opt = new Options();
    opt.addArguments("--start-maximized")
    opt.addArguments('--ignore-ssl-errors=yes');
    opt.addArguments('--ignore-certificate-errors');
    let driver: selenium.WebDriver;
    console.log(process.env.SELENIUM_SERVER as string)
    if (process.env.NODE_ENV === 'development') {
        driver = new selenium.Builder()
        .forBrowser('chrome')
        .setChromeOptions(opt)
        .build();
        console.log("dev")
    } else {
        opt.addArguments("--headless")
        opt.addArguments("--disable-gpu")
        opt.addArguments("--no-sandbox")
        driver = new selenium.Builder()
        .forBrowser('chrome')
        .setChromeOptions(opt)
        .build();
        console.log("prod");
    }
    await driver.get(url);
    return driver;
}

export const consoleData = (data: DataObject[]) => {
    data.forEach(async item => {
        console.log(item);
    });
    console.log(data.length);
}

export const saveData = (data: DataObject[]) => {
    data.forEach(async item => {
        await save(item);
    });
}

const save = async (data: DataObject) => {
    const url = process.env.NEXT_PUBLIC_API_URL as string;
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
export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}