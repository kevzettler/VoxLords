FROM base_web
COPY package.json /dist/package.json
RUN mkdir /dist/node_modules && cd /dist && npm install
RUN npm install -g electron-prebuilt
ADD . /srv/www
RUN ln -s /dist/node_modules /srv/www/node_modules

## ubuntu electron links TerrainLoader images absolutely?
RUN ln -s /srv/www/maps /srv/www/dist/maps
RUN ln -s /srv/www/maps /dist/maps

WORKDIR /srv/www
ENTRYPOINT ["/usr/local/bin/npm", "run"]
EXPOSE 8888
