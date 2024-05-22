import axios, { AxiosError } from "axios"
import { DataObject } from "./interface";
// import { remote } from 'webdriverio';
import selenium from 'selenium-webdriver';
import { Options, ServiceBuilder } from "selenium-webdriver/chrome";

export const initDriver = async (url: string) => {
    // const service = new ServiceBuilder("/usr/bin/google-chrome-stable");
    const opt = new Options();
    opt.addArguments('--ignore-ssl-errors=yes');
    opt.addArguments('--ignore-certificate-errors');
    // opt.addArguments("--headless");
    let driver: selenium.WebDriver;
    driver = new selenium.Builder()
            .forBrowser('chrome')
            // .setChromeService(service)
            .setChromeOptions(opt)
            .build();
        console.log("dev")
        await driver.get(url);
    // if (process.env.NODE_ENV === 'development') {
    //     driver = new selenium.Builder()
    //         .forBrowser('chrome')
    //         .setChromeOptions(opt)
    //         .build();
    //     console.log("dev")
    //     await driver.get(url);
    // } else {
    //     driver = await remote({
    //         capabilities: {
    //             browserName: 'chrome',
    //             'goog:chromeOptions': {
    //                 args: [
    //                     '--headless',
    //                     '--disable-gpu',
    //                     'window-size=1024,768',
    //                     '--no-sandbox'
    //                 ]
    //             }
    //         }
    //     });
        // await driver.url(url);
    // }

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
    const url = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL as string : "http://localhost:3000/api/data";
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