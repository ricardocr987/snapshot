import { writeFileSync, readFile } from 'fs';

for(let i = 0; i < 250; i++) {
    const json = `{
    "name": "LandKey #${i}",
    "symbol": "KL",
    "description": "250 Cubic Land Area on Planet Borgia",
    "seller_fee_basis_points": 1000,
    "image": "${i}.png",
    "attributes": [
        {
            "trait_type": "Plot",
            "value": "250x250"
        }
    ],
    "properties": {
        "files": [
            {
                "uri": "${i}.png",
                "type": "image/png"
            }
        ],
        "category": "image",
        "creators": [
          {
            "address": "2UTtp7U5SSVxF6dtJvnVPsym5GUTCfG9qKJ3Vx4WVBkk",
            "share": 100
          }
        ]
    }
}`
    writeFileSync(`./assets/${i}.json`, json);

    readFile('baseAssets/250.png', function (err, data) {
        if (err) throw err;
        writeFileSync(`./assets/${i}.png`, data)
    });
}

for(let i = 250; i < 750; i++) {
    const json = `{
    "name": "LandKey #${i}",
    "symbol": "KL",
    "description": "100 Cubic Land Area on Planet Borgia",
    "seller_fee_basis_points": 1000,
    "image": "${i}.png",
    "attributes": [
        {
            "trait_type": "Plot",
            "value": "100x100"
        }
    ],
    "properties": {
        "files": [
            {
                "uri": "${i}.png",
                "type": "image/png"
            }
        ],
        "category": "image",
        "creators": [
          {
            "address": "2UTtp7U5SSVxF6dtJvnVPsym5GUTCfG9qKJ3Vx4WVBkk",
            "share": 100
          }
        ]
    }
}`

    writeFileSync(`./assets/${i}.json`, json);

    readFile('baseAssets/100.png', function (err, data) {
        if (err) throw err;
        writeFileSync(`./assets/${i}.png`, data)
    });
}

for(let i = 750; i < 1750; i++) {
    const json = `{
    "name": "LandKey #${i}",
    "symbol": "KL",
    "description": "50 Cubic Land Area on Planet Borgia",
    "seller_fee_basis_points": 1000,
    "image": "${i}.png",
    "attributes": [
        {
            "trait_type": "Plot",
            "value": "50x50"
        }
    ],
    "properties": {
        "files": [
            {
                "uri": "${i}.png",
                "type": "image/png"
            }
        ],
        "category": "image",
        "creators": [
          {
            "address": "2UTtp7U5SSVxF6dtJvnVPsym5GUTCfG9qKJ3Vx4WVBkk",
            "share": 100
          }
        ]
    }
}`

    writeFileSync(`./assets/${i}.json`, json);

    readFile('baseAssets/50.png', function (err, data) {
        if (err) throw err;
        writeFileSync(`./assets/${i}.png`, data)
    });
}

for(let i = 1750; i < 3250; i++) {
    const json = `{
    "name": "LandKey #${i}",
    "symbol": "KL",
    "description": "20 Cubic Land Area on Planet Borgia",
    "seller_fee_basis_points": 1000,
    "image": "${i}.png",
    "attributes": [
        {
            "trait_type": "Plot",
            "value": "20x20"
        }
    ],
    "properties": {
        "files": [
            {
                "uri": "${i}.png",
                "type": "image/png"
            }
        ],
        "category": "image",
        "creators": [
          {
            "address": "2UTtp7U5SSVxF6dtJvnVPsym5GUTCfG9qKJ3Vx4WVBkk",
            "share": 100
          }
        ]
    }
}`

    writeFileSync(`./assets/${i}.json`, json);

    readFile('baseAssets/20.png', function (err, data) {
        if (err) throw err;
        writeFileSync(`./assets/${i}.png`, data)
    });
}

for(let i = 3250; i < 5000; i++) {
    const json = `{
    "name": "LandKey #${i}",
    "symbol": "KL",
    "description": "10 Cubic Land Area on Planet Borgia",
    "seller_fee_basis_points": 1000,
    "image": "${i}.png",
    "attributes": [
        {
            "trait_type": "Plot",
            "value": "10x10"
        }
    ],
    "properties": {
        "files": [
            {
                "uri": "${i}.png",
                "type": "image/png"
            }
        ],
        "category": "image",
        "creators": [
          {
            "address": "2UTtp7U5SSVxF6dtJvnVPsym5GUTCfG9qKJ3Vx4WVBkk",
            "share": 100
          }
        ]
    }
}`

    writeFileSync(`./assets/${i}.json`, json);

    readFile('baseAssets/10.png', function (err, data) {
        if (err) throw err;
        writeFileSync(`./assets/${i}.png`, data)
    });
}

