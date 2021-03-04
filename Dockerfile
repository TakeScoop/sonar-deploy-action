FROM node:14.16.0-alpine

COPY package.json package-lock.json /

RUN npm ci --quiet

COPY /src /src

CMD ["node", "/src/index"]
