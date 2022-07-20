"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
function getAccounts(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const accounts = yield connection.getProgramAccounts(new web3_js_1.PublicKey("8Lhgy2yNAegAKhL4Mky4bnUBFVSWfzwLZVWaZGGkWKdV"));
        for (const account of accounts) {
            if (account.pubkey.toString() == '6yZ65vJJ3cNGnysVxujkYktRdGtKEdVXSbtb7JQmh7dJ') {
                console.log(account);
            }
        }
        console.log(yield connection.getAccountInfo(new web3_js_1.PublicKey('6yZ65vJJ3cNGnysVxujkYktRdGtKEdVXSbtb7JQmh7dJ')));
        return accounts;
    });
}
;
const connection = new web3_js_1.Connection("https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/");
getAccounts(connection);
/*
    {
      filters: [
        // these filters allow us to narrow the array the scope of our query
        {
          dataSize: 165, // number of bytes of a token account, it returns account with this fixed size
        },
        {
          memcmp: {
            // returns that are an exact match on bytes
            offset: 32, // number of bytes, where we are going to start to read from the token account,
            bytes: walletAddress, // base58 encoded string, used to find the owner of the token account
          },
          // offset: the position at which to begin comparing data, position measured in bytes and expressed as an integer
          // bytes: the data of the query should match the account's data
        },
        {
          // another filter to get only the token accounts to distinguish btw NFT and fungible tokens (it isn't perfect bc the user can hold 1 unit of fungible token)
          memcmp: {
            offset: 32 + 32,
            bytes: bs58.encode(Buffer.from([1])),
          },
        },
      ],
    }
*/ 
//# sourceMappingURL=index.js.map