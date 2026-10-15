#!/bin/bash
set -a
. /opt/daga-clone/.env
set +a
cd /opt/daga-clone
/usr/bin/node server/scraper/index.js >> /tmp/scraper.log 2>&1
# Ping search engines after scraper run
curl -s -X POST http://localhost:3001/api/ping-search-engines >> /tmp/scraper.log 2>&1
