import { readFileSync } from "fs"

const mints: string[] = JSON.parse(readFileSync('./hashmint/mints-cmid-7ZhMcPCzv7N3XQhVMadFnVLZofvWv7ULgnixQgjwPvpz.json', 'utf8'))

let counter = 0
for(let i = 0; i < mints.length; i++){
    counter++
}

console.log(counter)