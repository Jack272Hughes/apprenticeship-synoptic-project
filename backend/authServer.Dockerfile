FROM node:12.9.1
COPY . .
RUN yarn install
EXPOSE 5000
CMD ["yarn", "start:auth"]