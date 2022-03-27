/*
* SHA256(Secured Hash Algorithm) 
*An Library used to convert a Arbitary Length of input to fixed Length(256 Bit/ 32-Byte)
*/
const SHA256 = require('crypto-js/sha256');

const EC = require('elliptic').ec; 
const ec = new EC ('secp256k1');

// Creating  Tranactions Structure  
class Transaction{ 
    constructor(fromAddress, toAddress, amount){
        // Sender's Address
        this.fromAddress = fromAddress;
        // Recipient Address
        this.toAddress = toAddress;
        // Amount of Coins to be Sent
        this.amount = amount;
    }
    // Creating SHA256 hash of the transaction
    calculateHash(){
        return SHA256(this.fromAddress+this.toAddress+this.amount).toString();
    }

    /**
   * Signs a transaction with the given signingKey (which is an Elliptic keypair
   * object that contains a private key). The signature is then stored inside the
   * transaction object and later stored on the blockchain.
   */
    signTransaction(signingKey){
    // You can only send a transaction from the wallet that is linked to your
    // key. So here we check if the fromAddress matches your publicKey
        if( signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cant sign a Transaction for other wallet');
        }
         // Calculate the hash of this transaction, sign it with the key
         // and store it inside the transaction object
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx,'base64' );

        this.signature = sig.toDER('hex');
    }

    isValid(){
         // If the transaction doesn't have a from address we assume it's a
        // mining reward and that it's valid.
        if(!this.fromAddress === null) return true;

        if ( !this.signature || this.signature.length ===0){
            throw new Error('No Signature in this Transaction')
        }

        const publicKey= ec.keyFromPublic(this.fromAddress,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
} 

class Block{
    constructor(timestamp, transactions, previousHash=''){
        // Block's Creation TimeStamp
        this.timestamp = timestamp;
        // Data in Tranactions
        this.transactions = transactions;
        // Parent(Previous) Block Hash
        this.previousHash = previousHash;
        // Current Block Hash
        this.hash = this.calculateHash();
        // Nonce ==> Indicates number of zeros to be added
        this.nonce =0;
    }

    // Calculating Hash of the Block 
    // Used to Produce Unique (which is Immuteable)
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)+ this.nonce).toString();
    }
  /**
   * Starts the mining process on the block. It changes the 'nonce' until the hash
   * of the block starts with enough zeros (= difficulty)
   */
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !==Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log("Block Mined :" + this.hash);
    }
    /**
   * Validates all the transactions inside this block (signature + hash) then
   * returns true if valid. False if the block is invalid.
   */
    hasValidTransactions() {
        for(const tx of this.transactions){
            if(!tx.isValid()) {
            return false;
            }
        }
        return true;
    }
}

    // Collection of Multiple Blocks and adding to Chain to form BlockChain
class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        // Mining Difficulty
        this.difficulty = 2;
        // Status of Transaction 
        this.pendingTransactions = [];
        // Fixing Reward Amount to be Created after successfull Mining
        this.miningReward = 100;
    }

    // It is the  First Block in the Block Chain
    createGenesisBlock(){
        return new Block("15/03/2022", "Genesis block", "0");
    }
    // To get the Last Block added in a Chain 
    getLastestBlock(){
        return this.chain[this.chain.length - 1];
    }

   /**
   * Takes all the pending transactions, puts them in a Block and starts the
   * mining process. It also adds a transaction to send the mining reward to
   * the given address.
   */
    minePendingTransactions(miningRewardAddress){
        const block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        //  Prints the Output if Mining is Sucessfully Completed
        console.log('Block successfully mined!');
        // Adds the Block to Chain
        this.chain.push(block);

        this.pendingTransactions=[
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }
    //Add a new transaction to the list of pending transactions
    addTransaction(transaction){

        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Trasnaction Should Contaion From and To Address');
        }
        // Verify the transactiion
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    //  Returns the balance of a given wallet address
    getBalanceOfAddress(address){
        let balance =100;
        for(const block of this.chain){                 
            for( const trans of block.transactions){
                // Verifying the Address
                if(trans.fromAddress === address){  // === is used for equating Address and there DataTypes
                    balance -= trans.amount;  // Return as balance = balance - trans.amount
                }
                if(trans.toAddress === address){
                    balance += trans.amount;  // Return as balance = balance + trans.amount
                }
            }
        }
        return balance;   // Returns the Balance in the wallet
    }

    /* 
    *Check the blocks on the chain to see if there hashes and
    *signatures are correct
    */
    isChainValid(){
        for (let i=1; i<this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previuosBlock = this.chain[i - 1];

            if (previuosBlock.hash !== currentBlock.previousHash) {
                return false;
              }
        
              if (!currentBlock.hasValidTransactions()) {
                return false;
              }
        
              if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
              }
            }
        
        return true;
    }
}

module.exports.Blockchain=Blockchain;
module.exports.Block= Block;
module.exports.Transaction=Transaction;
