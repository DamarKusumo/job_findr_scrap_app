import { DataObject } from "./interface";
import { saveData, consoleData } from "./utils";
import axios from "axios";
import * as cheerio from "cheerio";

const url = (job: String) => `https://www.jobstreet.co.id/id/${job.split(' ').join('-')}-jobs`;

export const jobstreetRunner = async () => {
    await save("Programmer");
    await save("Data");
    await save("Network");
    await save("Cyber Security");
}

const save = async (job: string) => {
    const jobUrl = url(job);
    let page = 0;
    let data: DataObject[] = [];

    while (true) {
        page++;
        console.log(`Scraping ${job} page ${page}`)
        const response = await axios.get(
            jobUrl,
            { params: { page: page } },
        );
        const $ = cheerio.load(response.data);

        const jobCards = $('article[data-card-type="JobCard"]');
        if (jobCards.length === 0) break;

        jobCards.each((_, element) => {
            const jobCard = $(element);
            // TODO: add logo to interface
            const companyLogo = jobCard.find('[data-automation="company-logo"] img').attr('src') || '';
            const temp: DataObject = {
                id: `jobstreet-${jobCard.attr('data-job-id')}`,
                title: jobCard.find('h3 a[data-automation="jobTitle"]').text().trim(),
                publicationDate: processDate(jobCard.find('span[data-automation="jobListingDate"]').text().trim()),
                location: jobCard.find('a[data-automation="jobLocation"]').text().trim(),
                company: jobCard.find('a[data-automation="jobCompany"]').text().trim(),
                sourceSite: "Jobstreet.co.id",
                link: `https://www.jobstreet.co.id/id/job/${jobCard.attr('data-job-id')}`,
            }
            console.log(companyLogo);
            console.log(temp);

            data.push(temp);
        })

    }
    consoleData(data);
    // saveData(data);
}

const processDate = (publicationDate: String) => {
    let days = publicationDate.split(' ')[0];
    let date = new Date();
    if (days.includes('+'))
        days = '30';
    date.setDate(date.getDate() - parseInt(days));
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;

}