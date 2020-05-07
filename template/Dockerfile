FROM node:10

RUN mkdir /opt/app

WORKDIR /opt/app

ADD package.json .
ADD package-lock.json .

RUN npm install

ADD src ./src
ADD tsconfig.json .

RUN npm run build

CMD ["node", "dist/server.js"]
