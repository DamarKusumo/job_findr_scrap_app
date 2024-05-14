import axios, { AxiosError } from "axios"
import { DataObject } from "./interface";
import selenium from 'selenium-webdriver';

export const initDriver = async (url: string) => {
    const driver = new selenium.Builder()
        .forBrowser('chrome')
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