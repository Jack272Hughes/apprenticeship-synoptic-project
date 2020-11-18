FROM node:12.9.1 as build

COPY . .
RUN yarn install
RUN yarn build

FROM nginx:stable-alpine
COPY --from=build /build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]