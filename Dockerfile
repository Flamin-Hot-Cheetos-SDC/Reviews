FROM node:18-alpine
WORKDIR /Reviews
COPY . .
RUN npm install --production
CMD ["node", "./script.js"]
EXPOSE 3000
