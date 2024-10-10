FROM node:18-alpine

WORKDIR /src

COPY package.json yarn.lock ./

RUN yarn install
# or
# RUN npm install 

COPY . .

EXPOSE 3000

CMD [ "yarn", "start" ]
# or
# CMD [ "npm", "start" ]