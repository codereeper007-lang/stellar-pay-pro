const fs = require('fs');
const content = fs.readFileSync('node_modules/@creit-tech/stellar-wallets-kit/esm/StellarWalletsKit.d.ts', 'utf-8');
console.log(content.slice(0, 500));
