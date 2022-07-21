import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";
async function getSignatures(connection, holdersWalletsPubkeys) {
    const programSignatures = await connection.getConfirmedSignaturesForAddress2(new PublicKey('8Lhgy2yNAegAKhL4Mky4bnUBFVSWfzwLZVWaZGGkWKdV'));
    holdersWalletsPubkeys.forEach(async (holdersWallet) => {
        const holderSignatures = await connection.getConfirmedSignaturesForAddress2(new PublicKey(holdersWallet));
        programSignatures.forEach((programSignature) => {
            holderSignatures.forEach((holderSignature) => {
                if (programSignature.signature == holderSignature.signature) {
                    console.log(holderSignature.signature);
                }
            });
        });
    });
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
await getSignatures(connection, borgsHoldersWallet);
//# sourceMappingURL=index.js.map