const {Blockchain,Transaction}=require('../Src/Blockchain');
const EC = require('elliptic').ec; 
const ec = new EC ('secp256k1');

const myKey = ec.keyFromPrivate('b6aed25c144510bcc268f5a9e015d8a620c03eb35d0cb2d71312e6ae269c7fb0');
const myWalletAddress = myKey.getPublic('hex');

let xAmpcoin = new Blockchain(); 
// Creating Some Transactions
// xAmpcoin.createTransaction(new Transaction('address1','address2',100));  // Address1 and Address2 are Public Keys of someone's Wallet 
// xAmpcoin.createTransaction(new Transaction('address2','address1',50));  

const tx1 = new Transaction(myWalletAddress,'Public Key goes here',10);
tx1.signTransaction(myKey);
xAmpcoin.addTransaction(tx1);

// After Creating Txns there are in Pending State... So, Miner Starts Mining them
console.log('\n Starting the miner.....');
xAmpcoin.minePendingTransactions(myWalletAddress)
console.log('\n Balance of Akshay is',xAmpcoin.getBalanceOfAddress(myWalletAddress));

//xAmpcoin.chain[1].transactions[0].amount =1;  // This is Used to Check Wheather Data is Tampper or Not 

console.log('is Chain Valid:',xAmpcoin.isChainValid());