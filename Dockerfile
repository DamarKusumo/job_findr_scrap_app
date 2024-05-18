FROM node:20
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY ./package.json ./package-lock.json ./tsconfig.json .
RUN npm install 
COPY src/ .
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start"]