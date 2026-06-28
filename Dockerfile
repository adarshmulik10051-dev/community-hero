FROM node:18 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ARG REACT_APP_GROQ_API_KEY
RUN REACT_APP_GROQ_API_KEY=$REACT_APP_GROQ_API_KEY npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]