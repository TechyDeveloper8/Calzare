import fs from 'fs';
import https from 'https';
import path from 'path';

const assets = [
  {
    name: 'women-collection-image.jpg',
    url: 'https://solaworld.in/cdn/shop/files/women-collection-image.jpg?v=1792669682&width=1600'
  },
  {
    name: 'men-collection-image.jpg',
    url: 'https://solaworld.in/cdn/shop/files/men-collection-image.jpg?v=1792669682&width=1600'
  },
  {
    name: 'mid-banner-shadow.png',
    url: 'https://solaworld.in/cdn/shop/files/mid-banner-shadow.png?v=1788657784'
  }
];

const destDir1 = path.join('frontend', 'public', 'images', 'split');
const destDir2 = path.join('backend', 'uploads');
fs.mkdirSync(destDir1, { recursive: true });
fs.mkdirSync(destDir2, { recursive: true });

async function downloadOne(item) {
  return new Promise((resolve) => {
    const file1 = path.join(destDir1, item.name);
    const file2 = path.join(destDir2, item.name);
    const ws = fs.createWriteStream(file1);
    https.get(item.url, (res) => {
      console.log(item.name, 'status:', res.statusCode);
      res.pipe(ws);
      ws.on('finish', () => {
        ws.close(() => {
          fs.copyFileSync(file1, file2);
          resolve();
        });
      });
    }).on('error', (err) => {
      console.error('Error downloading', item.name, err.message);
      resolve();
    });
  });
}

async function run() {
  for (const a of assets) {
    await downloadOne(a);
  }
  console.log('All downloads finished');
  process.exit(0);
}

run();
