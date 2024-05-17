import { DataObject } from "./interface";
import { saveData, consoleData } from "./utils";
import axios from "axios";
import * as cheerio from "cheerio";
import { formatDate } from "./date-format";

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
        console.log(`Scraping page ${page} of ${jobUrl}`);
        const response = await axios.get(
            jobUrl,
            { params: { page: page } },
        );
        const $ = cheerio.load(response.data);

        const jobCards = $('article[data-card-type="JobCard"]');
        if (jobCards.length === 0) break;

        jobCards.each((_, element) => {
            const jobCard = $(element);
            const temp: DataObject = {
                id: `jobstreet-${jobCard.attr('data-job-id')}`,
                title: jobCard.find('h3 a[data-automation="jobTitle"]').text().trim(),
                publicationDate: processDate(jobCard.find('span[data-automation="jobListingDate"]').text().trim()),
                location: jobCard.find('a[data-automation="jobLocation"]').map((_, el) => $(el).text()).get().join(', '),
                company: jobCard.find('a[data-automation="jobCompany"]').text().trim(),
                sourceSite: "Jobstreet.co.id",
                linkDetail: `https://www.jobstreet.co.id/id/job/${jobCard.attr('data-job-id')}`,
                logoImgLink: jobCard.find('[data-automation="company-logo"] img').attr('src') || '',
                position: job,
            }

            data.push(temp);
        })

    }

    console.log(`Finished scraping ${job} from Jobstreet`);
    console.log(`Found ${data.length} jobs`);

    saveData(data);
}

const processDate = (publicationDate: String) => {
    let date = new Date();
    if (publicationDate.split(' ')[1] != 'hari') return formatDate(date);
    let days = publicationDate.split(' ')[0];
    if (days.includes('+'))
        days = '30';
    date.setDate(date.getDate() - parseInt(days));
    return formatDate(date);
}

