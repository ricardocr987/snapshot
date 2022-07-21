import { Connection, PublicKey, AccountInfo, ParsedAccountData, ConfirmedSignatureInfo, RpcResponseAndContext } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";
import { writeFileSync } from 'fs';

type Account = {
  pubkey: PublicKey;
  account: AccountInfo<Buffer | ParsedAccountData>;
}

type NFT = {
    holdingTime: number,
}

async function getTokenAccounts(connection: Connection, pubkey: PublicKey) {
    const tokenAccounts: RpcResponseAndContext<Account[]> = await connection.getTokenAccountsByOwner(
        pubkey,     
        { 
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        }
    )
    return tokenAccounts.value;
};
// hasmap -> clave pubkey, objecto (numero de nfts, tiempo holdeado, cantidad borgs), 
// holding time -> borgs
async function getBotborgsHoldersWallet(connection: Connection, programSignatures: ConfirmedSignatureInfo[]): Promise<Record<string, Record<string, NFT>>>{
    let holderInfo: Record<string, Record<string, NFT>> = {}
    let nftInfo: Record<string, NFT> = {}
    for(const programSignature of programSignatures) {
        const transaction = await connection.getTransaction(programSignature.signature);
        if(transaction != undefined){
            if(holderInfo[transaction.transaction.message.accountKeys[0].toString()] == undefined){
                const check = await connection.getAccountInfo(transaction.transaction.message.accountKeys[6]);
                if(check == null){
                    const tokenAccounts: Account[] = await getTokenAccounts(connection, transaction.transaction.message.accountKeys[6]);
                    for(const tokenAccount of tokenAccounts){
                        const accountInfo = await connection.getAccountInfo(
                            tokenAccount.pubkey
                        );
                        const accountDataEncoded = accountInfo?.data
                        if(accountDataEncoded != undefined){
                            const accountData = AccountLayout.decode(accountDataEncoded); // decoding AccountInfo with borsh to get the data
                            const nftMint = accountData.mint.toString();
                            const mintSignatures: ConfirmedSignatureInfo[] = await getSignatures(connection, nftMint);
                            const blocktime = mintSignatures[0].blockTime;
                            let totalDays: number = 0;
                            if(typeof blocktime == "number"){
                                let today = new Date();
                                let staked = new Date(blocktime)
                                let difference = today.getTime() - staked.getTime();
                                totalDays = Math.floor(difference/1000/60/60/24);
                            }
                            const nftData: NFT = {
                                holdingTime: totalDays
                            }
                            nftInfo[nftMint] = nftData;
                        }
                    }
                    holderInfo[transaction.transaction.message.accountKeys[0].toString()] = nftInfo;
                    console.log(holderInfo)
                    console.log(Object.keys(holderInfo).length)
                }
            }
        }
    }
    return holderInfo
}

async function getSignatures(connection: Connection, pubkey: string) {
    let i = 1;
    let totalSignatures: ConfirmedSignatureInfo[] = await connection.getConfirmedSignaturesForAddress2(new PublicKey(pubkey));
    if(totalSignatures.length == 1000){
        while(totalSignatures.length % 1000 == 0){
            const currentSignatures: ConfirmedSignatureInfo[] = [] = await connection.getConfirmedSignaturesForAddress2(
                new PublicKey(pubkey),
                {
                    before: totalSignatures[i*999].signature
                }
            );
            totalSignatures = totalSignatures.concat(currentSignatures);
            i++;
        }
    }
    //const firstSignature = totalSignatures.length - 1
    //console.log('Calls to getConfirmedSignatures: ' + i + ' | TotalSignatures: ' + totalSignatures.length + ' | First signature Blocktime: ' + totalSignatures[firstSignature].blockTime)
    return totalSignatures
};


async function getBorgsHoldersWallets(connection: Connection): Promise<PublicKey[]> {
    const tokenAccounts: Account[] = await connection.getParsedProgramAccounts(
        // SPL Token Account (Size in Bytes): 32 (mint) + 32 (owner) + 8 (amount) + 36 (delegate) + 1 (state) + 12 (is_native) + 8 (delegated_amount) + 36 (close_authority)
        TOKEN_PROGRAM_ID,
        {
            filters: [
                // these filters allow us to narrow the array the scope of our query
                {
                    dataSize: 165, // number of bytes of a token account, it returns account with this fixed size
                },
                {
                    memcmp: {
                        // returns that are an exact match on bytes
                        offset: 0, // number of bytes, where we are going to start to read from the token account,
                        bytes: '36EsmEsa5rp3VrZAzLna3UFDEBFihwjsRFciUTfoZ5Qt', // base58 encoded string, used to find the owner of the token account
                    },
                    // offset: the position at which to begin comparing data, position measured in bytes and expressed as an integer
                    // bytes: the data of the query should match the account's data
                },
            ],
        }
    )

    const holdersWallet = await Promise.all(
        tokenAccounts.map(async (tokenAccount): Promise<PublicKey> => {
            const accountInfo = await connection.getAccountInfo(
                tokenAccount.pubkey
            );

            const accountDataEncoded = accountInfo?.data

            if(accountDataEncoded != undefined){
                const accountData = AccountLayout.decode(accountDataEncoded); // decoding AccountInfo with borsh to get the data
                const owner = new PublicKey(accountData.owner);
                return owner;
            }
            else{
                return new PublicKey("")
            }
        })
    );
    return holdersWallet;
};

const connection = new Connection(
    ""
);

const borgsHoldersWallet: PublicKey[] = await getBorgsHoldersWallets(connection);
const programSignatures: ConfirmedSignatureInfo[] = await getSignatures(connection, '8Lhgy2yNAegAKhL4Mky4bnUBFVSWfzwLZVWaZGGkWKdV');
const botborgsHoldersWallet: Record<string, Record<string, NFT>> = {} = await getBotborgsHoldersWallet(connection, programSignatures);
console.log(botborgsHoldersWallet)

writeFileSync('./holderList.json', JSON.stringify(botborgsHoldersWallet));

console.log('BorgsHolders: ' + borgsHoldersWallet.length + ' ProgramSignatures: ' + programSignatures.length + ' BotborgsHolders: ' + Object.keys(botborgsHoldersWallet).length)
console.log('Success')


