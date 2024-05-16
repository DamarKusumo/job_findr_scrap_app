import { By, WebDriver, until } from "selenium-webdriver";
import { DataObject } from "./interface";
import { saveData, initDriver, consoleData, delay } from "./utils";

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
  // limit retries to max 3 times
  try {
    await getData(driver, jobType);
  } catch {
    await driver.get(BASE_URL(jobType));
    try {
      await getData(driver, jobType);
    } catch {
      await driver.get(BASE_URL(jobType));
      try {
        await getData(driver, jobType);
      } catch {
        await driver.quit();
        console.error(`Unable to scrape ${jobType} jobs from LinkedIn`);
      }
    }
  }
};

const getData = async (driver: WebDriver, jobType: string) => {
  // check if it is the right page => has certain element
  await driver.findElement(By.className("switcher-tabs__placeholder"));

  var data: DataObject[] = [];

  // first page get up to 60 data; 1x load +10 data
  // keep scrolling until the show more btn is found => normally 6x scroll => get up to 120 data
  for (let i = 0; i < 10; i++) {
    await driver.executeScript(
      "window.scrollTo(0, document.body.scrollHeight);"
    );
    await delay(3000);
  }

  // data that can be retrieved is up to 450 => (450 - 120) / 10 = 33 clicks
  // try to find show more btn then click it
  for (let i = 0; i < 40; i++) {
    try {
      let showMoreBtn = await driver.findElement(
        By.className("infinite-scroller__show-more-button--visible")
      );
      showMoreBtn.click();
      await delay(3000);
    } catch {
      break;
    }
  }

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

    let temp /*: DataObject*/ = {
      id: "",
      title: "",
      publicationDate: "",
      location: "",
      company: "",
      sourceSite: "LinkedIn Job",
      link: "",
      logo: "",
      role: jobType,
    };

    // handle lazy load huhu
    let companyImg = await job.findElement(
      By.className("artdeco-entity-image")
    );
    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      companyImg
    );
    temp.logo = await companyImg.getAttribute("src");
    temp.id = "linkedin:".concat(
      (
        await job
          .findElement(By.className("base-search-card--link"))
          .getAttribute("data-entity-urn")
      )
        .split(":")
        .slice(-1)[0]
    );
    temp.title = await job
      .findElement(By.className("base-search-card__title"))
      .getAttribute("innerText");
    let splitDate = publicationDate.split("-");
    temp.publicationDate = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
    temp.location = await job
      .findElement(By.className("job-search-card__location"))
      .getAttribute("innerText");
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
