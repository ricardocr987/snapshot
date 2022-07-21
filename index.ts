import { Connection, PublicKey, AccountInfo, ParsedAccountData, ConfirmedSignatureInfo, RpcResponseAndContext } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";
import { writeFileSync } from 'fs';

type Account = {
  pubkey: PublicKey;
  account: AccountInfo<Buffer | ParsedAccountData>;
}

type Holder = {
    pubkey: PublicKey;
    nftCounter: number;
}

async function getTokenAccounts(connection: Connection, pubkey: PublicKey) {
    const tokenAccounts: RpcResponseAndContext<Account[]> = await connection.getTokenAccountsByOwner(
        new PublicKey(pubkey),     
        { 
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        }
    )
    return tokenAccounts.value;
};

async function getBotborgsHoldersWallet(connection: Connection, programSignatures: ConfirmedSignatureInfo[], borgsHoldersWallet: PublicKey[]){
    let totalNftCounter = 0
    let holderCounter = 0
    let holdersInfo: Holder[] = []
    
    await Promise.all(
        borgsHoldersWallet.map(async (holdersWallet) => {
            const holderSignatures: ConfirmedSignatureInfo[] = await getSignatures(connection, holdersWallet.toString())
            console.log("Holder Counter: " + holderCounter++)
            programSignatures.map(async (programSignature) => {
                holderSignatures.map(async(holderSignature) => {
                    let nftCounter = 0;
                    if (programSignature.signature == holderSignature.signature) {
                        const transaction = await connection.getTransaction(programSignature.signature)
                        if(transaction != null){
                            const tokenAccounts: Account[] = await getTokenAccounts(connection, transaction.transaction.message.accountKeys[6]);

                            tokenAccounts.map(async (tokenAccount) => {
                                const accountInfo = await connection.getAccountInfo(
                                    tokenAccount.pubkey
                                );
                    
                                const accountDataEncoded = accountInfo?.data
                    
                                if(accountDataEncoded != undefined){
                                    const accountData = AccountLayout.decode(accountDataEncoded); // decoding AccountInfo with borsh to get the data
                                    nftCounter += Number(accountData.amount)
                                }
                            })
                        }
                    }
                    const holderInfo: Holder = { 
                        pubkey: holdersWallet, 
                        nftCounter: nftCounter 
                    }

                    holdersInfo.push(holderInfo);
                    totalNftCounter += nftCounter
                })
            })
    
        })
    );

    console.log(totalNftCounter)
    return holdersInfo
}

async function getSignatures(connection: Connection, pubkey: string) {
    let i = 1
    let totalSignatures: ConfirmedSignatureInfo[] = await connection.getConfirmedSignaturesForAddress2(new PublicKey(pubkey))
    while(totalSignatures.length % 1000 == 0){
        const currentSignatures: ConfirmedSignatureInfo[] = [] = await connection.getConfirmedSignaturesForAddress2(
            new PublicKey(pubkey),
            {
                before: totalSignatures[i*999].signature
            }
        )
        totalSignatures = totalSignatures.concat(currentSignatures)
        i++
    }
    const firstSignature = totalSignatures.length - 1
    console.log('Calls to getConfirmedSignatures' + i + ': TotalSignatures: ' + totalSignatures.length + ' | Last signature Blocktime: ' + totalSignatures[firstSignature].blockTime)
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
    "https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/"
);

const borgsHoldersWallet: PublicKey[] = await getBorgsHoldersWallets(connection);
const programSignatures: ConfirmedSignatureInfo[] = await getSignatures(connection, '8Lhgy2yNAegAKhL4Mky4bnUBFVSWfzwLZVWaZGGkWKdV');
const botborgsHoldersWallet: Holder[] = await getBotborgsHoldersWallet(connection, programSignatures, borgsHoldersWallet);
console.log(botborgsHoldersWallet)

writeFileSync('./holderList.json', JSON.stringify(botborgsHoldersWallet));


console.log('BorgsHolders: ' + borgsHoldersWallet.length + ' ProgramSignatures: ' + programSignatures.length + ' BotborgsHolders: ' + botborgsHoldersWallet.length)


