FROM node:18 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN echo "REACT_APP_GROQ_API_KEY=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" > .env
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]