const swk = require('@creit-tech/stellar-wallets-kit');
console.log('Exports:', Object.keys(swk));
if (swk.StellarWalletsKit) {
  console.log('StellarWalletsKit prototype:', Object.getOwnPropertyNames(swk.StellarWalletsKit.prototype));
}
