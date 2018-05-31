FROM node:9.7.1-alpine
WORKDIR /usr/src/app
# where available (npm@5+)
COPY package*.json ./
RUN npm install --only=production
# Bundle app source
COPY . .
CMD [ "npm", "start" ]
