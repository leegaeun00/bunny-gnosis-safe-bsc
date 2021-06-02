import { Networks } from '@gnosis.pm/safe-apps-sdk';
import { contractAddresses } from './contractAddresses';

//need to add images
//import daiIcon from './images/asset_DAI.svg';
//import batIcon from './images/asset_BAT.svg';
//import wbtcIcon from './images/asset_BTC.svg';
//import ethIcon from './images/asset_ETH.svg';
//import repIcon from './images/asset_REP.svg';
//import usdcIcon from './images/asset_USDC.svg';
//import usdtIcon from './images/asset_USDT.svg';
//import zrxIcon from './images/asset_ZRX.svg';

export type PoolItem = {
    id: string;
    label: string;
    tokenLabel: string;
    profitLabel: Array<string>;
    twoTokenProfit: boolean;
    //need to add images
    //iconUrl: string;
    decimals: number;
    tokenAddr: string;
    poolAddr: string;
    dashboardAddr: string;
};

export const getPoolList = (network: Networks): Array<PoolItem> => {
    const lowercaseNetwork = network.toLowerCase();
    if (lowercaseNetwork !== 'mainnet') {
        throw Error(`Not supported Network ${network}`);
    }

    const contractAddressesByNetwork = contractAddresses[lowercaseNetwork];

    if (!contractAddressesByNetwork) {
        throw Error(`No token configuration for ${network}`);
    }

    return [
        //for profit label, BUNNY must always go second
        {
            id: 'BunnyPool',
            label: 'BUNNY Pool',
            tokenLabel: 'BUNNY',
            profitLabel: ['WBNB'],
            twoTokenProfit: false,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Bunny,
            poolAddr: contractAddressesByNetwork.BunnyPool,
            dashboardAddr: '',
        },
        {
            id: 'BunnyBoostPool',
            label: 'BUNNY Boost Pool',
            tokenLabel: 'BUNNY',
            profitLabel: ['BUNNY'],
            twoTokenProfit: false,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Bunny,
            poolAddr: contractAddressesByNetwork.BunnyBoostPool,
            dashboardAddr: '',
        },
        {
            id: 'CakePool',
            label: 'CAKE Pool',
            tokenLabel: 'CAKE',
            profitLabel: ['CAKE','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Cake,
            poolAddr: contractAddressesByNetwork.CakePool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'CakeBnbFlipPool',
            label: 'CAKE-BNB FLIP Pool',
            tokenLabel: 'CAKE-BNB FLIP',
            profitLabel: ['CAKE-BNB FLIP','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.CakeBnbFlip,
            poolAddr: contractAddressesByNetwork.CakeBnbFlipPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'CakeBnbFlipCakeMaximizerPool',
            label: 'CAKE-BNB FLIP CAKE Maximizer Pool',
            tokenLabel: 'CAKE-BNB FLIP',
            profitLabel: ['CAKE','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.CakeBnbFlip,
            poolAddr: contractAddressesByNetwork.CakeBnbFlipCakeMaximizerPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'BtcbBnbFlipPool',
            label: 'BTCB-BNB FLIP Pool',
            tokenLabel: 'BTCB-BNB FLIP',
            profitLabel: ['BTCB-BNB FLIP','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.BtcbBnbFlip,
            poolAddr: contractAddressesByNetwork.BtcbBnbFlipPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'BtcbBnbFlipCakeMaximizerPool',
            label: 'BTCB-BNB FLIP CAKE Maximizer Pool',
            tokenLabel: 'BTCB-BNB FLIP',
            profitLabel: ['CAKE','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.BtcbBnbFlip,
            poolAddr: contractAddressesByNetwork.BtcbBnbFlipCakeMaximizerPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'EthBnbFlipPool',
            label: 'ETH-BNB FLIP Pool',
            tokenLabel: 'ETH-BNB FLIP',
            profitLabel: ['ETH-BNB FLIP','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.EthBnbFlip,
            poolAddr: contractAddressesByNetwork.EthBnbFlipPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'EthBnbFlipCakeMaximizerPool',
            label: 'ETH-BNB FLIP CAKE Maximizer Pool',
            tokenLabel: 'ETH-BNB FLIP',
            profitLabel: ['CAKE','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.EthBnbFlip,
            poolAddr: contractAddressesByNetwork.EthBnbFlipCakeMaximizerPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'BusdBnbFlipPool',
            label: 'BUSD-BNB FLIP Pool',
            tokenLabel: 'BUSD-BNB FLIP',
            profitLabel: ['BUSD-BNB FLIP','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.BusdBnbFlip,
            poolAddr: contractAddressesByNetwork.BusdBnbFlipPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'BusdBnbFlipCakeMaximizerPool',
            label: 'BUSD-BNB FLIP CAKE Maximizer Pool',
            tokenLabel: 'BUSD-BNB FLIP',
            profitLabel: ['CAKE','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.BusdBnbFlip,
            poolAddr: contractAddressesByNetwork.BusdBnbFlipCakeMaximizerPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'UsdtBnbFlipPool',
            label: 'USDT-BNB FLIP Pool',
            tokenLabel: 'USDT-BNB FLIP',
            profitLabel: ['USDT-BNB FLIP','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.UsdtBnbFlip,
            poolAddr: contractAddressesByNetwork.UsdtBnbFlipPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'UsdtBnbFlipCakeMaximizerPool',
            label: 'USDT-BNB FLIP CAKE Maximizer Pool',
            tokenLabel: 'USDT-BNB FLIP',
            profitLabel: ['CAKE','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.UsdtBnbFlip,
            poolAddr: contractAddressesByNetwork.UsdtBnbFlipCakeMaximizerPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'UsdtBusdFlipPool',
            label: 'USDT-BUSD FLIP Pool',
            tokenLabel: 'USDT-BUSD FLIP',
            profitLabel: ['USDT-BUSD FLIP','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.UsdtBusdFlip,
            poolAddr: contractAddressesByNetwork.UsdtBusdFlipPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'UsdtBusdFlipCakeMaximizerPool',
            label: 'USDT-BUSD FLIP CAKE Maximizer Pool',
            tokenLabel: 'USDT-BUSD FLIP',
            profitLabel: ['CAKE','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.UsdtBusdFlip,
            poolAddr: contractAddressesByNetwork.UsdtBusdFlipCakeMaximizerPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'VaiBusdFlipPool',
            label: 'VAI-BUSD FLIP Pool',
            tokenLabel: 'VAI-BUSD FLIP',
            profitLabel: ['VAI-BUSD FLIP','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.VaiBusdFlip,
            poolAddr: contractAddressesByNetwork.VaiBusdFlipPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'VaiBusdFlipCakeMaximizerPool',
            label: 'VAI-BUSD FLIP CAKE Maximizer Pool',
            tokenLabel: 'VAI-BUSD FLIP',
            profitLabel: ['CAKE','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.VaiBusdFlip,
            poolAddr: contractAddressesByNetwork.VaiBusdFlipCakeMaximizerPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'BnbPool',
            label: 'BNB Pool',
            tokenLabel: 'BNB',
            profitLabel: ['BNB','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Bnb,
            poolAddr: contractAddressesByNetwork.BnbPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'EthPool',
            label: 'ETH Pool',
            tokenLabel: 'ETH',
            profitLabel: ['ETH','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Eth,
            poolAddr: contractAddressesByNetwork.EthPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'BtcbPool',
            label: 'BTCB Pool',
            tokenLabel: 'BTCB',
            profitLabel: ['BTCB','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Btcb,
            poolAddr: contractAddressesByNetwork.BtcbPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'UsdtPool',
            label: 'USDT Pool',
            tokenLabel: 'USDT',
            profitLabel: ['USDT','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Usdt,
            poolAddr: contractAddressesByNetwork.UsdtPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
        {
            id: 'BusdPool',
            label: 'BUSD Pool',
            tokenLabel: 'BUSD',
            profitLabel: ['BUSD','BUNNY'],
            twoTokenProfit: true,
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.Busd,
            poolAddr: contractAddressesByNetwork.BusdPool,
            dashboardAddr: contractAddressesByNetwork.DashboardBsc,
        },
    ];
};

export type TokenItem = {
    id: string;
    label: string;
    //need to add images
    //iconUrl: string;
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
        //for profit label, BUNNY must always go second
        {
            id: 'Bnb',
            label: 'BNB',
            //iconUrl: daiIcon,
            decimals: 18,
            //used Wbnb address
            tokenAddr: contractAddressesByNetwork.Bnb,
            useZapIn: true,
            useZapInToken: false,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Wbnb',
            label: 'WBNB',
            //iconUrl: daiIcon,
            decimals: 18,
            //used Wbnb address of Bnb address
            tokenAddr: contractAddressesByNetwork.Bnb,
            useZapIn: false,
            useZapInToken: true,
            useZapOut: false,
            decompositionLabel: [],
        },
        {
            id: 'Bunny',
            label: 'BUNNY',
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
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
            //iconUrl: daiIcon,
            decimals: 18,
            tokenAddr: contractAddressesByNetwork.VaiBusdFlip,
            useZapIn: false,
            useZapInToken: false,
            useZapOut: true,
            decompositionLabel: ['VAI','BUSD']
        },
    ];
};