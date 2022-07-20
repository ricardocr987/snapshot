import { Connection, PublicKey, AccountInfo, ParsedAccountData } from "@solana/web3.js";

type Account = {
  pubkey: PublicKey;
  account: AccountInfo<Buffer | ParsedAccountData>;
}

async function getAccounts(connection: Connection) {
  const accounts: Account[] = await connection.getProgramAccounts(
    new PublicKey("8Lhgy2yNAegAKhL4Mky4bnUBFVSWfzwLZVWaZGGkWKdV"),
  );

  for (const account of accounts){
    if(account.pubkey.toString() == '6yZ65vJJ3cNGnysVxujkYktRdGtKEdVXSbtb7JQmh7dJ'){
        console.log(account)
    }
  }
  console.log(await connection.getAccountInfo(new PublicKey('6yZ65vJJ3cNGnysVxujkYktRdGtKEdVXSbtb7JQmh7dJ')))
  return accounts;
};

const connection = new Connection(
    "https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/"
);

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