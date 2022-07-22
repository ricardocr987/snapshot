import { Connection, PublicKey, AccountInfo, ParsedAccountData, ConfirmedSignatureInfo, RpcResponseAndContext } from "@solana/web3.js";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { writeFileSync } from 'fs';
import { format, Options } from 'prettier'

const options: Options = {
    semi: false,
    singleQuote: true,
    trailingComma: 'es5',
    useTabs: false,
    tabWidth: 2,
    arrowParens: 'always',
    printWidth: 80,
    parser: 'json',
}
type Account = {
  pubkey: PublicKey;
  account: AccountInfo<Buffer | ParsedAccountData>;
}

type HolderData = {
    holderMints: string[],
    amountBorgs: number
}

async function getAmountBorgs(connection: Connection, pubkey: PublicKey) {
    let amount = 0
    const tokenAccounts: RpcResponseAndContext<Account[]> = await connection.getTokenAccountsByOwner(
        pubkey,     
        { 
            programId: TOKEN_PROGRAM_ID
        }
    )
    for(const tokenAccount of tokenAccounts.value){
        const accountInfo = await connection.getAccountInfo(
            tokenAccount.pubkey
        );
        const accountDataEncoded = accountInfo?.data
        if(accountDataEncoded != undefined){
            const accountData = AccountLayout.decode(accountDataEncoded); // decoding AccountInfo with borsh to get the data
            if(accountData.mint.toString() == '36EsmEsa5rp3VrZAzLna3UFDEBFihwjsRFciUTfoZ5Qt'){
                amount = Number(accountData.amount)/1000000000;
            }
        }
    }
    return amount;
};

async function getTokenAccounts(connection: Connection, pubkey: PublicKey) {
    const tokenAccounts: RpcResponseAndContext<Account[]> = await connection.getTokenAccountsByOwner(
        pubkey,     
        { 
            programId: TOKEN_PROGRAM_ID
        }
    )
    return tokenAccounts.value;
};
// hasmap -> clave pubkey, objecto (numero de nfts, tiempo holdeado, cantidad borgs), 
// holding time -> borgs
async function getBotborgsHoldersWallet(connection: Connection, programSignatures: ConfirmedSignatureInfo[]): Promise<Record<string, HolderData>> {
    let holderInfo: Record<string, HolderData> = {}//holders
    let positionStartReadingSignatures = 0
    let siguientesSignatures = programSignatures.slice(-positionStartReadingSignatures)
    for(const programSignature of siguientesSignatures) {
        let transaction = await connection.getTransaction(programSignature.signature);
        while(transaction == undefined) {
            transaction = await connection.getTransaction(programSignature.signature);
        }
        positionStartReadingSignatures--
        console.log(positionStartReadingSignatures)
        if(transaction != undefined){
            if(holderInfo[transaction.transaction.message.accountKeys[0].toString()] == undefined){
                const amountBorgs = await getAmountBorgs(connection, transaction.transaction.message.accountKeys[0])
                let holderMints: string[] = []
                let index = 0
                let found = false
                for(const account of transaction.transaction.message.accountKeys) {
                    const accountInfo = await connection.getAccountInfo(account);
                    const accountDataEncoded = accountInfo?.data
                    if(accountDataEncoded == undefined && account.toString() != "BpiJvaF9qPYr5gnpwvesZ5wAgZn4S73cGyc77ntH2X83" && transaction.transaction.message.accountKeys[0] != account){
                        found = true
                        break;
                    }
                    index++
                }
                if(found){
                    let tokenAccounts: Account[] = await getTokenAccounts(connection, transaction.transaction.message.accountKeys[index]);
                    while(tokenAccounts == undefined) {
                        tokenAccounts = await getTokenAccounts(connection, transaction.transaction.message.accountKeys[index]);
                    }
                    for(const tokenAccount of tokenAccounts){
                        const accountInfo = await connection.getAccountInfo(
                            tokenAccount.pubkey
                        );
                        const accountDataEncoded = accountInfo?.data
                        if(accountDataEncoded != undefined){
                            const accountData = AccountLayout.decode(accountDataEncoded); // decoding AccountInfo with borsh to get the data
                            if(Number(accountData.amount) == 1){
                                const nftMint = accountData.mint.toString();
                                holderMints.push(nftMint)
                            }
                        }
                    }
                    const holderData: HolderData = {
                        holderMints: holderMints,
                        amountBorgs: amountBorgs
                    }
                    holderInfo[transaction.transaction.message.accountKeys[0].toString()] = holderData;
                    writeFileSync(`./holders/${Object.keys(holderInfo).length}.json`, format(JSON.stringify(holderInfo).trim(), options));
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

/*
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
*/

const connection = new Connection(
    "https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/"
);


//const holders: Record<string, HolderData> = JSON.parse(readFileSync('./holders/681.json', 'utf8'))

const programSignatures: ConfirmedSignatureInfo[] = await getSignatures(connection, '8Lhgy2yNAegAKhL4Mky4bnUBFVSWfzwLZVWaZGGkWKdV');
const stakersMap: Record<string, HolderData> = await getBotborgsHoldersWallet(connection, programSignatures);

console.log('ProgramSignatures: ' + programSignatures.length + ' BotborgsHolders: ' + Object.keys(stakersMap).length)
console.log('Success')
