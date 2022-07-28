import { Metaplex } from "@metaplex-foundation/js"
import { PublicKey, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';

const connection = new Connection(
    "https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/"
);

const metaplex = new Metaplex(connection);


async function getPlotType(mint: string) {
    try{
        const nft = await metaplex.nfts().findByMint(new PublicKey(mint)).run();
        const description = nft.json?.description
        let plotType: number = 0

        if(description?.includes("100")){
            plotType = 100
        }
        else{
            if(description?.includes("20")){
                plotType = 20
            }
            else{
                if(description?.includes("250")){
                    plotType = 250
                }
                else{
                    if(description?.includes("10")){
                        plotType = 10
                    }
                    else{
                        plotType = 50
                    }
                }
            }
        }
        return plotType
    }
    catch(e){
        return 0
    }
};

async function getTokenAccounts(pubkey: PublicKey) {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        pubkey,     
        { 
            programId: TOKEN_PROGRAM_ID
        }
    )
    return tokenAccounts.value;
};

const tokenAccounts = await getTokenAccounts(new PublicKey("E8QyTvY4dyXZCWKLd6B7kFuBMhNKcSeScdAiGkVNby1D"))
let rarityArray: number[] = [0, 0, 0, 0, 0]

for(const tokenAccount of tokenAccounts){
    const accountInfo = await connection.getAccountInfo(
        tokenAccount.pubkey
    );
    const accountDataEncoded = accountInfo?.data
    if(accountDataEncoded != undefined){
        const accountData = AccountLayout.decode(accountDataEncoded); // decoding AccountInfo with borsh to get the data
        if(Number(accountData.amount) == 1){
            const nftMint: string = accountData.mint.toString();
            const plotSize: number = await getPlotType(nftMint);
            switch(plotSize){
                case 250:
                    rarityArray[0]++
                    break;
                case 100:
                    rarityArray[1]++
                    break;
                case 50:
                    rarityArray[2]++
                    break;
                case 20:
                    rarityArray[3]++
                    break;
                case 10:
                    rarityArray[4]++
                    break;
            }
        }
    }
}

console.log(rarityArray)

let total = 0
for(const position of rarityArray) {
    total += position
}

console.log(total)