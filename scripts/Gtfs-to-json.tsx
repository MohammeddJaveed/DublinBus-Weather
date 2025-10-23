// scripts/gtfs-to-json.js
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const GTFS_DIR = path.join(__dirname, '..', 'assets', 'gtfs');
const OUT_DIR = path.join(__dirname, '..', 'src', 'data');

// Ensure output dir exists
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs
  .readdirSync(GTFS_DIR)
  .filter(f => f.endsWith('.txt') || f.endsWith('.csv'));

files.forEach(file => {
  const inPath = path.join(GTFS_DIR, file);
  const outName = file.replace(/\.(txt|csv)$/i, '.json');
  const outPath = path.join(OUT_DIR, outName);

  const content = fs.readFileSync(inPath, { encoding: 'utf8' });

  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
  // Convert numeric fields that look like numbers
  const data = parsed.data.map(row => {
    const cleaned = {};
    for (const k of Object.keys(row)) {
      const v = row[k];
      if (v === '') {
        cleaned[k] = null;
      } else if (!Number.isNaN(Number(v)) && v.trim() !== '') {
        // But keep IDs as strings if field name ends with _id or contains 'code'
        if (/(_id$|stop_id|route_id|trip_id|vehicle_id|code)/i.test(k)) {
          cleaned[k] = String(v);
        } else {
          cleaned[k] = Number(v);
        }
      } else {
        cleaned[k] = v;
      }
    }
    return cleaned;
  });

  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Converted ${file} -> ${outName} (${data.length} rows)`);
});
