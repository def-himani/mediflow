# Build stage
FROM node:18-alpine AS build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json package-lock.json* ./
# If a package-lock.json exists use `npm ci`, otherwise fall back to `npm install`.
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi
COPY . .
RUN npm run build

# Production stage (nginx)
FROM nginx:stable-alpine
# Remove default nginx static
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config (if present)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
