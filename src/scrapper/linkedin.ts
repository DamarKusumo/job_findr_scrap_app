import { By, WebDriver, until } from "selenium-webdriver";
import { DataObject } from "./interface";
import { saveData, initDriver, consoleData } from "./utils";

const BASE_URL = (jobType: string) =>
  `https://www.linkedin.com/jobs/search/?keywords=${jobType}&location=Indonesia`;

export const linkedinRunner = async () => {
  await scrape("Programmer");
  // await scrape("Data");
  // await scrape("Network");
  // await scrape("Cyber Security");
};

const scrape = async (jobType: string) => {
  const driver = await initDriver(BASE_URL(jobType));
  try {
    await getData(driver);
  } catch {
    await driver.get(BASE_URL(jobType));
    await getData(driver);
    // kayanya bisa jadi perlu beberapa kali
  }
};

const getData = async (driver: WebDriver) => {
  var data: DataObject[] = [];

  // TODO scroll terus sampe nemu show more button, click then scroll lagi, repeat
  await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");

  var jobList = await driver
    .findElement(By.className("jobs-search__results-list"))
    .findElements(By.css("li"));

  const today = new Date();
  for (var job of jobList) {
    let publicationDate = await job
      .findElement(By.css("time"))
      .getAttribute("datetime");

    let maxDate = new Date();
    maxDate.setDate(today.getDate() - 60); // assumed 2 months = 60 days

    if (new Date(publicationDate) < maxDate) continue;

    let temp: DataObject = {
      id: "",
      title: "",
      publicationDate: publicationDate,
      location: "",
      company: "",
      sourceSite: "LinkedIn Job",
      link: "",
    };

    temp.id = (
      await job
        .findElement(By.className("base-search-card--link"))
        .getAttribute("data-entity-urn")
    )
      .split(":")
      .slice(-1)[0];
    temp.title = await job
      .findElement(By.className("base-search-card__title"))
      .getAttribute("innerText");
    temp.location = (
      await job
        .findElement(By.className("job-search-card__location"))
        .getAttribute("innerText")
    ).split(", ")[0];
    temp.company = await job
      .findElement(By.className("base-search-card__subtitle"))
      .getAttribute("innerText");
    temp.link = await job.findElement(By.css("a")).getAttribute("href");

    data.push(temp);
  }

  await driver.quit();
  console.log(data);
  console.log("total", data.length);
};
