import { Networks } from '@gnosis.pm/safe-apps-sdk';
import { contractAddresses } from './contractAddresses';


export type TokenItem = {
    id: string;
    label: string;
    decimals: number;
    tokenAddr: string;
    //set which zap function to use
    useZapIn: boolean;
    useZapInToken: boolean;
    useZapOut: boolean;
    decompositionLabel: Array<string>;
};

export const getTokenList = (network: Networks): Array<TokenItem> => {
    const lowercaseNetwork = network.toLowerCase();
    if (lowercaseNetwork !== 'mainnet') {
        throw Error(`Not supported Network ${network}`);
    }

    const contractAddressesByNetwork = contractAddresses[lowercaseNetwork];

    if (!contractAddressesByNetwork) {
        throw Error(`No token configuration for ${network}`);
    }

    return [
        {
            id: 'Bnb',
            label: 'BNB',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Bnb,
            useZapIn: true,
            useZapInToken: false,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Wbnb',
            label: 'WBNB',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Bnb,
            useZapIn: false,
            useZapInToken: true,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Bunny',
            label: 'BUNNY',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Bunny,
            useZapIn: false,
            useZapInToken: true,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Cake',
            label: 'CAKE',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Cake,
            useZapIn: false,
            useZapInToken: true,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Busd',
            label: 'BUSD',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Busd,
            useZapIn: false,
            useZapInToken: true,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Usdt',
            label: 'USDT',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Usdt,
            useZapIn: false,
            useZapInToken: true,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Btcb',
            label: 'BTCB',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Btcb,
            useZapIn: false,
            useZapInToken: true,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Eth',
            label: 'ETH',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Eth,
            useZapIn: false,
            useZapInToken: true,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Vai',
            label: 'VAI',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Vai,
            useZapIn: false,
            useZapInToken: true,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'BunnyBnbFlip',
            label: 'BUNNY-BNB FLIP',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.BunnyBnbFlip,
            useZapIn: false,
            useZapInToken: false,
            useZapOut: true,
            decompositionLabel: ['BUNNY','BNB'],
        },
        {
            id: 'CakeBnbFlip',
            label: 'CAKE-BNB FLIP',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.CakeBnbFlip,
            useZapIn: false,
            useZapInToken: false,
            useZapOut: true,
            decompositionLabel: ['CAKE','BNB'],
        },
        {
            id: 'BusdBnbFlip',
            label: 'BUSD-BNB FLIP',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.BusdBnbFlip,
            useZapIn: false,
            useZapInToken: false,
            useZapOut: true,
            decompositionLabel: ['BUSD','BNB']
        },
        {
            id: 'UsdtBnbFlip',
            label: 'USDT-BNB FLIP',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.UsdtBnbFlip,
            useZapIn: false,
            useZapInToken: false,
            useZapOut: true,
            decompositionLabel: ['USDT','BNB']
        },
        {
            id: 'BtcbBnbFlip',
            label: 'BTCB-BNB FLIP',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.BtcbBnbFlip,
            useZapIn: false,
            useZapInToken: false,
            useZapOut: true,
            decompositionLabel: ['BTCB','BNB']
        },
        {
            id: 'EthBnbFlip',
            label: 'ETH-BNB FLIP',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.EthBnbFlip,
            useZapIn: false,
            useZapInToken: false,
            useZapOut: true,
            decompositionLabel: ['ETH','BNB']
        },
        {
            id: 'UsdtBusdFlip',
            label: 'USDT-BUSD FLIP',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.UsdtBusdFlip,
            useZapIn: false,
            useZapInToken: false,
            useZapOut: true,
            decompositionLabel: ['USDT','BUSD']
        },
        {
            id: 'VaiBusdFlip',
            label: 'VAI-BUSD FLIP',
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.VaiBusdFlip,
            useZapIn: false,
            useZapInToken: false,
            useZapOut: true,
            decompositionLabel: ['VAI','BUSD']
        },
    ];
};