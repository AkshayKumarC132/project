/**
 * Elliptic Library used to gentrate Public and Private key 
 * and have Methods to Sign something  and Verify a Signature
 */
 const EC = require('elliptic').ec; 
 const ec = new EC ('secp256k1'); // SECP256K1 is Elliptic Curve used by Bitcoin to implement Key 
 
 const key = ec.genKeyPair();    // Generating Both Public and Private Key
 const publicKey = key.getPublic('hex');  // gets Public Key value in Hex Format
 const privateKey = key.getPrivate('hex'); // gets Private Key value in Hex Format
 
 console.log();
 console.log( ' Public key: ' , publicKey ); // Displaying Key in Console 
 
 console.log();
 console.log( ' Private key: ' , privateKey ); //Displaying Key in Console 

 