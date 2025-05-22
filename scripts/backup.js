const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.resolve(__dirname, '../backups');
const files = ['player-db.json', 'match-db.json', 'team-db.json'];

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

files.forEach(file => {
  const src = path.resolve(__dirname, `../src/infrastructure/adapters/persistence/files/${file}`);
  const dest = path.join(backupDir, `${file.replace('.json', '')}_${timestamp}.json`);
  fs.copyFileSync(src, dest);
  console.log(`Backed up ${file} to ${dest}`);
});
