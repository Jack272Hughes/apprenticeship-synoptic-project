FROM node:12.9.1
COPY . .
RUN yarn install
EXPOSE 8080
CMD ["yarn", "start:server"]