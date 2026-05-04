import https from 'https';
import fs from 'fs';

https.get('https://myshow-frontend.vercel.app/api/movie/all', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    fs.writeFileSync('error_body_prod.txt', `STATUS: ${res.statusCode}\nBODY:\n${body}`);
  });
}).on('error', e => console.error(e));
