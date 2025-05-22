const fs = require('fs');
const path = require('path');

const backupName = process.argv[2];

if (!backupName) {
  console.error('❌ Please provide the backup name (without extension).');
  console.error('Example: npm run restore player-db_2025-05-21T22-13-00-000Z');
  process.exit(1);
}

const types = ['player', 'match', 'team'];
const filesDir = path.resolve(__dirname, '../data');

types.forEach(type => {
  const backupFile = path.resolve(__dirname, `../backups/${type}-db_${backupName}.json`);
  const targetFile = path.join(filesDir, `${type}-db.json`);

  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    return;
  }

  fs.copyFileSync(backupFile, targetFile);
  console.log(`✅ Restored ${type}-db.json from backup ${backupFile}`);
});
