import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";
import { writeFileSync } from 'fs';
async function getTokenAccounts(connection, pubkey) {
    const tokenAccounts = await connection.getTokenAccountsByOwner(new PublicKey(pubkey), {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    });
    return tokenAccounts.value;
}
;
async function getBotborgsHoldersWallet(connection, programSignatures) {
    let holderInfo = {};
    let nftInfo = {};
    await Promise.all(programSignatures.map(async (programSignature) => {
        const transaction = await connection.getTransaction(programSignature.signature);
        if (transaction != null) {
            let staker = transaction.transaction.message.accountKeys[0].toString();
            const tokenAccounts = await getTokenAccounts(connection, transaction.transaction.message.accountKeys[6]);
            tokenAccounts.map(async (tokenAccount) => {
                const accountInfo = await connection.getAccountInfo(tokenAccount.pubkey);
                const accountDataEncoded = accountInfo?.data;
                console.log(accountDataEncoded);
                if (accountDataEncoded != undefined) {
                    const accountData = AccountLayout.decode(accountDataEncoded);
                    const nftMint = accountData.mint.toString();
                    const mintSignatures = await getSignatures(connection, nftMint);
                    const blocktime = mintSignatures[0].blockTime;
                    console.log(blocktime);
                    let totalDays = 0;
                    if (typeof blocktime == "number") {
                        let today = new Date();
                        let staked = new Date(blocktime);
                        let difference = today.getTime() - staked.getTime();
                        totalDays = Math.floor(difference / 1000 / 60 / 60 / 24);
                    }
                    const nftData = {
                        holdingTime: totalDays
                    };
                    nftInfo[nftMint] = nftData;
                }
            });
            holderInfo[staker] = nftInfo;
        }
    }));
    return holderInfo;
}
async function getSignatures(connection, pubkey) {
    let i = 1;
    let totalSignatures = await connection.getConfirmedSignaturesForAddress2(new PublicKey(pubkey));
    if (totalSignatures.length == 1000) {
        while (totalSignatures.length % 1000 == 0) {
            const currentSignatures = [] = await connection.getConfirmedSignaturesForAddress2(new PublicKey(pubkey), {
                before: totalSignatures[i * 999].signature
            });
            totalSignatures = totalSignatures.concat(currentSignatures);
            i++;
        }
    }
    return totalSignatures;
}
;
async function getBorgsHoldersWallets(connection) {
    const tokenAccounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
        filters: [
            {
                dataSize: 165,
            },
            {
                memcmp: {
                    offset: 0,
                    bytes: '36EsmEsa5rp3VrZAzLna3UFDEBFihwjsRFciUTfoZ5Qt',
                },
            },
        ],
    });
    const holdersWallet = await Promise.all(tokenAccounts.map(async (tokenAccount) => {
        const accountInfo = await connection.getAccountInfo(tokenAccount.pubkey);
        const accountDataEncoded = accountInfo?.data;
        if (accountDataEncoded != undefined) {
            const accountData = AccountLayout.decode(accountDataEncoded);
            const owner = new PublicKey(accountData.owner);
            return owner;
        }
        else {
            return new PublicKey("");
        }
    }));
    return holdersWallet;
}
;
const connection = new Connection("https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/");
const borgsHoldersWallet = await getBorgsHoldersWallets(connection);
const programSignatures = await getSignatures(connection, '8Lhgy2yNAegAKhL4Mky4bnUBFVSWfzwLZVWaZGGkWKdV');
const botborgsHoldersWallet = {} = await getBotborgsHoldersWallet(connection, programSignatures);
console.log(botborgsHoldersWallet);
writeFileSync('./holderList.json', JSON.stringify(botborgsHoldersWallet));
console.log('BorgsHolders: ' + borgsHoldersWallet.length + ' ProgramSignatures: ' + programSignatures.length + ' BotborgsHolders: ' + Object.keys(botborgsHoldersWallet).length);
console.log('Success');
//# sourceMappingURL=index.js.map