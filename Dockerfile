FROM node:20

RUN apt-get update
RUN apt-get install -y gconf-service libasound2 libatk1.0-0 libcairo2 libcups2 libfontconfig1 libgdk-pixbuf2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libxss1 fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install

RUN mkdir -p /opt/app
WORKDIR /opt/app

ENV NEXT_PUBLIC_API_URL="https://job-findr-app.vercel.app/api/data"

COPY ./package.json ./package-lock.json ./tsconfig.json ./

RUN npm install 

COPY src/ ./src/

RUN npm run build
EXPOSE 3000

CMD ["npm", "start"]
