import { Metaplex } from "@metaplex-foundation/js"
import { PublicKey, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { writeFileSync } from 'fs';

const connection = new Connection(
    "https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/"
);

const metaplex = new Metaplex(connection);

async function getTokenAccounts(pubkey: PublicKey) {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        pubkey,     
        { 
            programId: TOKEN_PROGRAM_ID
        }
    )
    return tokenAccounts.value;
};

async function isPlot(mint: string) {
    try{
        const nft = await metaplex.nfts().findByMint(new PublicKey(mint)).run();
        const description = nft.json?.description
        let plotBool = false

        if(description?.includes("100")){
            plotBool = true
        }
        else{
            if(description?.includes("20")){
                plotBool = true
            }
            else{
                if(description?.includes("250")){
                    plotBool = true
                }
                else{
                    if(description?.includes("10")){
                        plotBool = true
                    }
                    else{
                        plotBool = true
                    }
                }
            }
        }
        return plotBool
    }
    catch(e){
        return false
    }
};

const tokenAccounts = await getTokenAccounts(new PublicKey("E8QyTvY4dyXZCWKLd6B7kFuBMhNKcSeScdAiGkVNby1D"))
let mintArray: string[] = []
let numMints = 0
for(const tokenAccount of tokenAccounts){
    const accountInfo = await connection.getAccountInfo(
        tokenAccount.pubkey
    );
    const accountDataEncoded = accountInfo?.data
    if(accountDataEncoded != undefined){
        const accountData = AccountLayout.decode(accountDataEncoded); // decoding AccountInfo with borsh to get the data
        if(Number(accountData.amount) == 1){
            const nftMint: string = accountData.mint.toString();
            const plotBool = await isPlot(nftMint)
            if(plotBool == true){
                mintArray.push(nftMint)
                numMints++
            }
        }
    }
}

console.log(numMints)
writeFileSync(`./mintArray.json`, JSON.stringify(mintArray));
