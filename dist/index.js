import { Connection, PublicKey } from "@solana/web3.js";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { writeFileSync, readFileSync } from 'fs';
import { format } from 'prettier';
const options = {
    semi: false,
    singleQuote: true,
    trailingComma: 'es5',
    useTabs: false,
    tabWidth: 2,
    arrowParens: 'always',
    printWidth: 80,
    parser: 'json',
};
async function getAmountBorgs(connection, pubkey) {
    let amount = 0;
    const tokenAccounts = await connection.getTokenAccountsByOwner(pubkey, {
        mint: new PublicKey('36EsmEsa5rp3VrZAzLna3UFDEBFihwjsRFciUTfoZ5Qt')
    });
    for (const tokenAccount of tokenAccounts.value) {
        const accountInfo = await connection.getAccountInfo(tokenAccount.pubkey);
        const accountDataEncoded = accountInfo?.data;
        if (accountDataEncoded != undefined) {
            const accountData = AccountLayout.decode(accountDataEncoded);
            if (accountData.mint.toString() == '36EsmEsa5rp3VrZAzLna3UFDEBFihwjsRFciUTfoZ5Qt') {
                amount = Number(accountData.amount) / 1000000000;
            }
        }
    }
    return amount;
}
;
async function getTokenAccounts(connection, pubkey) {
    const tokenAccounts = await connection.getTokenAccountsByOwner(pubkey, {
        programId: TOKEN_PROGRAM_ID
    });
    return tokenAccounts.value;
}
;
async function getBotborgsHoldersWallet(connection, programSignatures, holders) {
    let holderInfo = holders;
    let positionStartReadingSignatures = 0;
    let siguientesSignatures = programSignatures.slice(-positionStartReadingSignatures);
    for (const programSignature of siguientesSignatures) {
        let transaction = await connection.getTransaction(programSignature.signature);
        while (transaction == undefined) {
            transaction = await connection.getTransaction(programSignature.signature);
        }
        positionStartReadingSignatures--;
        console.log(positionStartReadingSignatures);
        if (transaction != undefined) {
            if (holderInfo[transaction.transaction.message.accountKeys[0].toString()] == undefined) {
                const amountBorgs = await getAmountBorgs(connection, transaction.transaction.message.accountKeys[0]);
                let holderMints = [];
                let index = 0;
                let found = false;
                for (const account of transaction.transaction.message.accountKeys) {
                    const accountInfo = await connection.getAccountInfo(account);
                    const accountDataEncoded = accountInfo?.data;
                    if (accountDataEncoded == undefined && account.toString() != "BpiJvaF9qPYr5gnpwvesZ5wAgZn4S73cGyc77ntH2X83" && transaction.transaction.message.accountKeys[0] != account) {
                        found = true;
                        break;
                    }
                    index++;
                }
                if (found) {
                    let tokenAccounts = await getTokenAccounts(connection, transaction.transaction.message.accountKeys[index]);
                    while (tokenAccounts == undefined) {
                        tokenAccounts = await getTokenAccounts(connection, transaction.transaction.message.accountKeys[index]);
                    }
                    for (const tokenAccount of tokenAccounts) {
                        const accountInfo = await connection.getAccountInfo(tokenAccount.pubkey);
                        const accountDataEncoded = accountInfo?.data;
                        if (accountDataEncoded != undefined) {
                            const accountData = AccountLayout.decode(accountDataEncoded);
                            if (Number(accountData.amount) == 1) {
                                const nftMint = accountData.mint.toString();
                                holderMints.push(nftMint);
                            }
                        }
                    }
                    const holderData = {
                        holderMints: holderMints,
                        amountBorgs: amountBorgs
                    };
                    if (holderMints.length != 0) {
                        holderInfo[transaction.transaction.message.accountKeys[0].toString()] = holderData;
                        writeFileSync(`./holders/${Object.keys(holderInfo).length}.json`, format(JSON.stringify(holderInfo).trim(), options));
                    }
                }
            }
        }
    }
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
    const firstSignature = totalSignatures.length - 1;
    console.log('Calls to getConfirmedSignatures: ' + i + ' | TotalSignatures: ' + totalSignatures.length + ' | First signature Blocktime: ' + totalSignatures[firstSignature].blockTime);
    return totalSignatures;
}
;
const connection = new Connection("https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/");
const holders = JSON.parse(readFileSync('./holders/2190.json', 'utf8'));
let nftsStaked = 0;
for (const [pubkey, holderInfo] of Object.entries(holders)) {
    nftsStaked += holderInfo.holderMints.length;
    pubkey;
}
console.log(nftsStaked);
const programSignatures = await getSignatures(connection, '8Lhgy2yNAegAKhL4Mky4bnUBFVSWfzwLZVWaZGGkWKdV');
for (const programSignature of programSignatures) {
    if (programSignature.signature == '22MwFew2MjTgiEkjmckQvp594QQVdRA29pHcNBVbpDpkYUr6FTQB14TA9qhgLcpyzkP2gMmA3rSdYq6vFRcGt6ej') {
        "ENCONTRADA";
    }
}
const stakersMap = await getBotborgsHoldersWallet(connection, programSignatures, holders);
console.log('ProgramSignatures: ' + programSignatures.length + ' BotborgsHolders: ' + Object.keys(stakersMap).length);
console.log('Success');
//# sourceMappingURL=index.js.map