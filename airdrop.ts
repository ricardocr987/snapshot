import { readFileSync, writeFileSync } from 'fs';
import { format, Options } from 'prettier'
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, transfer, /*TOKEN_PROGRAM_ID,*/ AccountLayout } from '@solana/spl-token';
import dotenv from "dotenv";
import bs58 from "bs58";
import promiseRetry from "promise-retry"
//import { Metaplex } from "@metaplex-foundation/js"

// Necesario para poder firmar transacciones, sin tener que publicar la PrivateKey en el repositorio (en .env que se incluye en el .gitignore)
dotenv.config();
const airdropWallet = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || ""))

// RPC provider
const connection = new Connection(
    "https://wild-hidden-sky.solana-mainnet.quiknode.pro/7fd663b97aa09842059a88da476fb21e22cb3ba2/"
);

// Necesario para poder obtener la metadata de un NFT
//const metaplex = new Metaplex(connection);

// Me permite poder formatear las HashMaps como si fuera un json sin tener que modificar el "string" a mano
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

//*********** Tipos //
// Utilizado en HashMap de mintMap como valor
interface NftInfo {
    plotSize: number,
    tokenAccount: PublicKey
}

// Utilizado en el vector arrayHolder y como atributo del HashMao finalData
interface Holder {
    pubkey: string,
    amountBorgs: number,
    numHolderMints: number
}

// Utilizado en el HashMap finalData
interface HolderAirdrop {
    dataHolder : Holder | null,
    airdrops : number[]
}
/*
// Utilizado para leer el fichero de los stakers conseguido ejecutando el archivo index (o haciendo el snapshot)
type HolderData = {
    holderMints: string[],
    amountBorgs: number
}

// Devuelve el token account a partir de una pubkey
async function getTokenAccounts(connection: Connection, pubkey: PublicKey) {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        pubkey,     
        { 
            programId: TOKEN_PROGRAM_ID
        }
    )
    return tokenAccounts.value;
};

// Devuelve el tipo de plot según el mint del NFT, leyendo la metadata del NFT
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

// lee el archivo stakersMap
const holders: Record<string, HolderData> = JSON.parse(readFileSync('./snapshot/stakersMap.json', 'utf8'))
// utilizado para ordenar según los BORGS
let holdersArray: Array<Holder> = []
// simplemente para tener más información sobre los mapas
let totalStacked : number = 0
let totalBorgs : number = 0

// a partir de la variable holders consigo estrucurar la información importante en el array
for(let [pubkey, data] of Object.entries(holders)){
    let holder: Holder = {
        pubkey: pubkey, 
        amountBorgs: data.amountBorgs, 
        numHolderMints: data.holderMints.length
    };
    holdersArray.push(holder);
}

// función que ordena el array
function cmpHolder(h1:Holder, h2:Holder) : number{
    let resultado : number = 0
    resultado = h2.amountBorgs - h1.amountBorgs
    if(resultado == 0){
        resultado = h2.numHolderMints - h1.numHolderMints
    }
    return resultado
}

// ordeno array
holdersArray.sort(cmpHolder)

// funcion que elimina los holders que tienen menos de 2 botborgs en staking
function isBigEnough(holder: Holder) { 
    return holder.numHolderMints >= 2; 
} 

// elimino pequeños con 1 botborg
holdersArray = holdersArray.filter(isBigEnough);

// Obtenemos el total de NFTs en staking y el total de BORGS después del filter
for (const holder of holdersArray) {
    totalStacked += holder.numHolderMints,
    totalBorgs += holder.amountBorgs
}

// en funcion de la posicion devuelve un vector de probabilidad distinto.
function getProbVector(i:number) : number []{
    let probMap : Record<number, number []> = {
        10: [12, 42, 82, 92, 100],
        100: [8, 33, 68, 85, 100],
        250: [5, 20, 40, 75, 100],
        500: [2, 10, 20, 65, 100],
        1000: [1, 4, 15, 50, 100],
    } 
    if(i <= 10){
        return probMap[10];
    }
    else{
        if(i <= 100){
            return probMap[100]
        }
        else{
            if(i <= 250){
                return probMap[250]
            }
            else{
                if(i <= 500){
                    return probMap[500]
                }
                else{
                    return probMap[1000]
                }
            }
        }
    }
}

// vector que me permite decrementar las rarezas que se van entregando y así comprobar que no hay ninguna negativa
let rest = [250 , 500 , 1000 , 1500 , 1750]
// recibo el vector holder
function getAirdrops(holders: Holder[]): Record<string, number[]>{


    let airdropMap: Record<string, number[]> = {}
    // descuento del vector la cantidad ya asignada.
    for(const pubkey of Object.keys(airdropMap)){
        for(let i = 0; i < 5; i++){
            rest[i] -= airdropMap[pubkey][i]
        }
    }

    for(let i = 0; i < holders.length; i++){
        let pos = 0
        let airdrop: number[] = [0,0,0,0,0]
        let tries = holders[i].numHolderMints/2
        let probsSelected  = getProbVector(i) // obtengo el vector de probs en funcion de la posicion.
        while(tries > 0){            
            let x = Math.random() * 100;
            if(x <= probsSelected[0]){
                pos = 0
            }
            else{
                if(x <= probsSelected[1]){
                    pos = 1
                }
                else{
                    if(x <= probsSelected[2]){
                        pos = 2
                    }
                    else{
                        if(x <= probsSelected[3]){
                            pos = 3
                        }
                        else{
                            pos = 4
                        }
                    }
                }
            }
            if(rest[pos] >= 0){
                airdrop[pos]++
                rest[pos]--
                tries--
            }
        } 
        airdropMap[holders[i].pubkey] = airdrop
    }
    return airdropMap
}

let airdropMap: Record<string, number[]> = getAirdrops(holdersArray)
writeFileSync(`./airdrop/airdropMap.json`, format(JSON.stringify(airdropMap).trim(), options));

console.log(rest) // COMPROBAR ANTES DE EJECUTAR -> NO PUEDE DARSE EL CASO DE QUE HAYAN VALORES NEGATIVOS

let finalData: Record<string, HolderAirdrop> = {}
for (const holder of holdersArray) {
    const airdrop = airdropMap[holder.pubkey]
    const dataHolder: HolderAirdrop = {
        dataHolder: holder, 
        airdrops: airdrop
    }
    finalData[holder.pubkey] = dataHolder;
}
writeFileSync(`./airdrop/finalData.json`, format(JSON.stringify(finalData).trim(), options));

let mintMap: Record<string, NftInfo> = {}
const tokenAccounts = await getTokenAccounts(connection, new PublicKey("E8QyTvY4dyXZCWKLd6B7kFuBMhNKcSeScdAiGkVNby1D")); // wallet donde están los NFTs
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
            if(plotSize != 0){
                const nftInfo: NftInfo = {
                    plotSize: plotSize,
                    tokenAccount: tokenAccount.pubkey
                }
                mintMap[nftMint] = nftInfo
            }
        }
    }
}
writeFileSync(`./airdrop/mintMap.json`, format(JSON.stringify(mintMap).trim(), options));
console.log("MINT MAP LENGTH: " + Object.keys(mintMap).length)
*/

async function getConfirmTransaction(txid: string) {
    const res = await promiseRetry(
        async (retry) => {
        let txResult = await connection.getTransaction(txid, {
            commitment: "confirmed",
        });
        if (!txResult) {
            const error = new Error("Transaction was not confirmed");

            retry(error);
            return;
        }
        return txResult;
        },
        {
        retries: 40,
        minTimeout: 500,
        maxTimeout: 1000,
        }
    );
    if(res != null && res.meta != null){
        if (res.meta.err) {
            throw new Error("Transaction failed");
        }
    }
    return txid;
};

async function getAmount(tokenAccount: PublicKey){
    let amount = 0
    const accountInfo = await connection.getAccountInfo(
        tokenAccount
    );
    const accountDataEncoded = accountInfo?.data
    if(accountDataEncoded != undefined){
        const accountData = AccountLayout.decode(accountDataEncoded); // decoding AccountInfo with borsh to get the data
        amount = Number(accountData.amount);
    }
    return amount
}

async function getMintRarity(mintMap: Record<string, NftInfo>, posRarity: number){
    let landSize = [250, 100, 50, 20, 10]
    let mintSel = ""
    let fromATA = ""
    let plotSize: number = 0

    for(let [mint, nftInfo] of Object.entries(mintMap)){
        plotSize = landSize[posRarity]
        if(plotSize == nftInfo.plotSize){
            const ataPubkey = await getAssociatedTokenAddress(new PublicKey(mint), airdropWallet.publicKey)
            fromATA = ataPubkey.toString()
            const amount = await getAmount(new PublicKey(fromATA))
            if(amount == 1){
                mintSel = mint
                break
            }
        }
    }

    return { mintSel, fromATA, plotSize }
}

let finalData: Record<string, HolderAirdrop> = JSON.parse(readFileSync('./backup/finalData.json', 'utf8')) // carpeta airdrop PARA PRIMERA EJECUCIÓN
let mintMap: Record<string, NftInfo> = JSON.parse(readFileSync('./backup/mintMap.json', 'utf8')) //carpeta airdrop PARA DE PRIMERA EJECUCIÓN
let backup: Record<string, NftInfo[]> = JSON.parse(readFileSync('./backup/backup.json', 'utf8')) // {} PARA LA PRIMERA EJECUCIÓN
for (const [pubkey, airdropInfo] of Object.entries(finalData)) {
    let arrayNftInfo: NftInfo[] = [] // 1 pubkey 1 arrayNFTInfo, almaceno la información de las transacciones que se han realizado
    if(Object.keys(backup).includes(pubkey)){
        if(Object.values(backup[pubkey]).length != 0){
            for(const nftInfo of Object.values(backup[pubkey])){
                arrayNftInfo.push(nftInfo)
            }
        }
    }
    let airdropsAux: number[] = [] // 1 pubkey 1 airdropAux, la utilizo para ir decrementando los valores que se irán decrementando de finalData
    for(let posRarity = 0; posRarity < airdropInfo.airdrops.length; posRarity++){ // para cada rareza (vector, cada posicion representa la cantidad a airdropear de las diferentes rarezas)
        for(let i = airdropInfo.airdrops[posRarity]; i > 0 ; i--){ // cuando es 0 implica que no hay que airdropear más a este usuario la rareza correspondiente, se va reduciendo la posición del vector por iteración
            let signature = ""
            try {
                const { mintSel, fromATA, plotSize } = await getMintRarity(mintMap, posRarity) // recibe mint de un NFT que cuadre con la rareza correspondiente, ATA donde está almacenado el NFT en la wallet desde donde se airdropea y el plotSize
                const toATA = await getOrCreateAssociatedTokenAccount(connection, airdropWallet, new PublicKey(mintSel), new PublicKey(pubkey)) // creo el ATA al usuario que va a recibir el NFT
                signature = await transfer(
                    connection,
                    airdropWallet,
                    new PublicKey(fromATA),
                    toATA.address,
                    airdropWallet,
                    1
                );
                await getConfirmTransaction(signature);
                console.log(`Success: https://solscan.io/tx/${signature}`);

                airdropsAux = airdropInfo.airdrops // almaceno todo el vector actual de la variable actual
                airdropsAux[posRarity] -= 1 // reduzco el valor de la posición actual del vector de airdrops
                const holderData: HolderAirdrop = {
                    dataHolder : null,
                    airdrops: airdropsAux
                }
                finalData[pubkey] = holderData // actualizo la variable
                writeFileSync(`./backup/finalData.json`, format(JSON.stringify(finalData).trim(), options)); // sobreescribo el archivo para tener info actual en caso de crashear en próximas iteraciones

                delete mintMap[mintSel]; // elimino el mint del mapa para que no vuelve a intentarse enviar
                writeFileSync(`./backup/mintMap.json`, format(JSON.stringify(mintMap).trim(), options)); // sobreescribo el archivo

                const nftInfo: NftInfo = {
                    plotSize: plotSize,
                    tokenAccount: new PublicKey(mintSel) // atributo es tokenAccount pero realmente es un mint
                }
                arrayNftInfo.push(nftInfo)
                backup[pubkey] = arrayNftInfo // almaceno la información eliminada de los otros mapas para saber que es lo que ha estado pasando durante la ejecución del programa
                writeFileSync(`./backup/backup.json`, format(JSON.stringify(backup).trim(), options)); // sobreescribo el archivo

            } catch (e) {
                console.log(`Failed: https://solscan.io/tx/${signature}`);
                i++
            }
        }
    }
    delete finalData[pubkey]; // cuando este holder no tenga que recibir más airdrops (porque ya ha terminado el for) se elimina totalmente su presencia de finalData
    writeFileSync(`./backup/finalData.json`, format(JSON.stringify(finalData).trim(), options)); // sobreescribo el archivo
}

console.log("AIRDROP DONE")