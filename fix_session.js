const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('const session = await getServerSession(authOptions);')) {
      content = content.replace(/const session = await getServerSession\(authOptions\);/g, 'const session: any = await getServerSession(authOptions);');
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log('Fixed in: ' + filePath);
    }
  }
});

console.log(`Successfully fixed session type in ${modifiedCount} files.`);
