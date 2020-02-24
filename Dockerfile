FROM node:alpine

WORKDIR testify-dynamodb
COPY ./package.json .
RUN npm install

COPY . .
CMD ["npm", "run", "dev"]