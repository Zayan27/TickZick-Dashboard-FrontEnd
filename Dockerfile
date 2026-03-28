FROM node:22

WORKDIR /tickzick-dashboard

# Increase Node memory for build
ENV NODE_OPTIONS=--max-old-space-size=4096

# Install dependencies
COPY package*.json ./
#RUN npm install --legacy-peer-deps
RUN npm install apexcharts@latest && npm install

# Copy source
COPY . .

# Build React app
RUN npm run build

# Install static file server
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
