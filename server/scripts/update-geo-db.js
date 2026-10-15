const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const GEO_DIR = path.join(__dirname, '..', 'geo');
const MMDB_PATH = path.join(GEO_DIR, 'GeoLite2-City.mmdb');

(async () => {
  if (!fs.existsSync(GEO_DIR)) fs.mkdirSync(GEO_DIR, { recursive: true });

  // Extract from bundled geolite2-city package
  const pkgPath = path.join(__dirname, '..', '..', 'node_modules', 'geolite2-city', 'GeoLite2-City.mmdb.gz');
  if (!fs.existsSync(pkgPath)) {
    console.error('geolite2-city package not found. Run: npm install geolite2-city');
    process.exit(1);
  }

  const compressed = fs.readFileSync(pkgPath);
  const data = zlib.gunzipSync(compressed);
  fs.writeFileSync(MMDB_PATH, data);
  const size = fs.statSync(MMDB_PATH).size;
  console.log(`Extracted GeoLite2-City.mmdb (${(size / 1024 / 1024).toFixed(1)} MB)`);
})();
