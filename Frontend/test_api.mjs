import fs from 'fs';
try {
  await import('./api/index.js');
  console.log('API loaded successfully');
} catch (error) {
  fs.writeFileSync('clean_error.txt', error.stack, 'utf8');
  console.log('Saved to clean_error.txt');
}
