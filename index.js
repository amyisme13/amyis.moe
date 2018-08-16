const fs = require('fs');
const fetch = require('node-fetch');
const pug = require('pug');

const { BASE_URL } = process.env;

const downloadImage = async (url, filename) => {
  const res = await fetch(url);
  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(`./public/images/${filename}`);
    res.body.pipe(dest);
    res.body.on('error', err => {
      reject(err);
    });
    dest.on('finish', () => {
      resolve();
    });
    dest.on('error', err => {
      reject(err);
    });
  });
};

const main = async () => {
  const res = await fetch(`${BASE_URL}/project`);
  const projects = await res.json();

  const indexFn = pug.compileFile('index.pug');

  await Promise.all(
    projects.map(p =>
      downloadImage(
        `${BASE_URL}${p.image.url}`,
        `${p.image.hash}${p.image.ext}`,
      ),
    ),
  );

  const indexHtml = indexFn({
    projects,
  });
  fs.writeFileSync('./public/index.html', indexHtml);
};

main();
