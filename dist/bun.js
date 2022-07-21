import { Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
async function getBorgsTokenAccounts(connection) {
    const token_accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
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
    let token_accounts_pubkey = [];
    token_accounts.forEach((token_account) => {
        token_accounts_pubkey.push(token_account.pubkey);
    });
    console.log(token_accounts_pubkey);
    return token_accounts_pubkey;
}
;
const connection = new Connection("https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/");
const token_accounts_pubkey = await getBorgsTokenAccounts(connection);
console.log(token_accounts_pubkey);
//# sourceMappingURL=bun.js.map