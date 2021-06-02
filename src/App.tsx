import React, { useCallback, useState, useEffect } from 'react';
import web3Utils from 'web3-utils';
import Web3 from 'web3';
import {AbiItem} from 'web3-utils';
import {Big} from 'big.js';
import {BigNumberInput} from 'big-number-input';
import axios from 'axios';

import styled from 'styled-components';
import { Button, Loader, Title, Select, Section, TextField, Text, Divider } from '@gnosis.pm/safe-react-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

import { getPoolList, PoolItem } from './config';
import { WidgetWrapper, SelectContainer, DaiInfo, ButtonContainer, BottomLargeMargin, BottomSmallMargin} from './components';

// below two abis work for bunny pool, bunny boost pool, flip, and cake maximizer pools
import { BunnyAbi as tokenAbi} from './abis/BunnyAbi';
import { BunnyPoolAbi as poolAbi} from  './abis/BunnyPoolAbi';
import { BnbAbi } from './abis/BnbAbi';
import { BnbPoolAbi } from './abis/BnbPoolAbi';
import { DashboardBscAbi as dashboardAbi} from './abis/DashboardBscAbi';
import { GnosisSafeAbi } from './abis/GnosisSafeAbi';

//added for zap
import { getTokenList, TokenItem } from './config';
import { ZapBscAbi as zapAbi} from './abis/ZapBscAbi';
import { WbnbAbi } from './abis/WbnbAbi';

const StyledTitle = styled(Title)`
  margin-top: 0;
`;

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const App: React.FC = () => {
  const [web3, setWeb3] = useState<Web3 | undefined>();
  const {sdk: appsSdk, safe: safeInfo, connected} = useSafeAppsSDK();

  const [bnbBalance, setBnbBalance] = useState('0');
  const [poolList, setPoolList] = useState<Array<PoolItem>>();

  const [selectedPool, setSelectedPool] = useState<PoolItem>();
  const [tokenInstance, setTokenInstance] = useState<any>();
  const [poolInstance, setPoolInstance] = useState<any>();
  const [dashboardInstance, setDashboardInstance] = useState<any>();

  //added for gasEstimate but failed to use
  const [safeInstance, setSafeInstance] = useState<any>();
  const [threshold, setThreshold] = useState(0);
  const [owners, setOwners] = useState<any>();
  const [gasEstimate, setGasEstimate] = useState(0);

  const [isPoolApproved, setIsPoolApproved] = useState<boolean>();
  const [poolBalance, setPoolBalance] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [interestEarn, setInterestEarn] = useState<Array<string>>(['0', '0']);

  const [poolInputValue, setPoolInputValue] = useState<string>('');
  const [poolInputError, setPoolInputError] = useState<string | undefined>();

  //added for zap
  const [tokenList, setTokenList] = useState<Array<TokenItem>>();
  const [selectedFromToken, setSelectedFromToken] = useState<any>();
  const [selectedToToken, setSelectedToToken] = useState<any>();

  const [fromTokenInstance, setFromTokenInstance] = useState<any>();
  const [toTokenInstance, setToTokenInstance] = useState<any>();
  const [zapInstance, setZapInstance] = useState<any>();

  const [fromTokenBalance, setFromTokenBalance] = useState<string>('0');
  const [isTokenApproved, setIsTokenApproved] = useState<boolean>();

  const [tokenInputValue, setTokenInputValue] = useState<string>('');
  const [tokenInputError, setTokenInputError] = useState<string | undefined>();

  // set web3 instance
  useEffect(() => {
    if (!safeInfo) {
      return;
    }
    const web3Instance = new Web3(`https://bsc-dataseed.binance.org/`);
    setWeb3(web3Instance);
    console.log("web3Instance: ", web3Instance);
    console.log("safeInfo.network: ", safeInfo.network);
    console.log("connected: ", connected)
    console.log("safeInfo:",appsSdk.txs.getBySafeTxHash)
  }, [safeInfo]);

  useEffect(() => {
    if (!safeInfo || !web3){
      return;
    }

    //get bnb balance
    const getBnbBalance = async () => {
      //try {
        //console.log("safeInfo.safeAddress: ", safeInfo.safeAddress);
        //if (safeInfo.safeAddress) {
          const balance = await web3?.eth.getBalance(safeInfo.safeAddress);
          console.log("bnbBalance: ", balance)
          //if (balance) {
            setBnbBalance(balance);
          //}
        //}
      //} catch (err) {
      //  console.error(err);
      //}
    };
    getBnbBalance();

    // set safe instance, get threshold, get owner accounts
    const getMoreSafeInfo = async() => {
      const safeInstance = await new web3.eth.Contract(GnosisSafeAbi as AbiItem[], safeInfo.safeAddress);
      setSafeInstance(safeInstance);
      const threshold = await safeInstance.methods.getThreshold().call();
      setThreshold(threshold);
      const owners = await safeInstance.methods.getOwners().call();
      setOwners(owners);
      console.log('safe instance:', safeInstance);
      console.log('safe instance threshold:', threshold);
      console.log('safe instance owner: ', owners);
    }

    getMoreSafeInfo();

  }, [web3, safeInfo.safeAddress]);


  // load tokens list and initialize with Bunny
  useEffect(() => {
    if (!safeInfo) {
      return;
    }

    const poolListRes = getPoolList(safeInfo.network);
    console.log("poolListRes: ", poolListRes)
    setPoolList(poolListRes);

    var findSelectedPool = poolListRes.find((t) => t.id === 'BunnyPool');
    if (localStorage.getItem('selectedPool')) {
      findSelectedPool = poolListRes.find((t) => t.id === localStorage.getItem('selectedPool'));
    }
    setSelectedPool(findSelectedPool);
    console.log("selected pool: ", findSelectedPool)
  }, [safeInfo]);

  // on selectedPool
  useEffect(() => {
    const setNewPool = async() => {
      if (!selectedPool || !web3) {
        return;
      }
      setInterestEarn(['0', '0']);
      setTokenBalance('0');
      setPoolBalance('0');
      setPoolInputValue('');
      setPoolInputError(undefined);

      console.log("selectedPool.id: ", selectedPool.id)
      console.log("selectedPool.tokenAddr: ", selectedPool.tokenAddr)
      console.log("selectedPool.poolAddr: ", selectedPool.poolAddr)
      console.log("selectedPool.dashboardAddr: ", selectedPool.dashboardAddr)

      if (selectedPool.id === 'BnbPool') {
        await setTokenInstance(new web3.eth.Contract(BnbAbi as AbiItem[], selectedPool.tokenAddr));
        await setPoolInstance(new web3.eth.Contract(BnbPoolAbi as AbiItem[], selectedPool.poolAddr));
      }
      else {
        await setTokenInstance(new web3.eth.Contract(tokenAbi as AbiItem[], selectedPool.tokenAddr));
        await setPoolInstance(new web3.eth.Contract(poolAbi as AbiItem[], selectedPool.poolAddr));
      }

      if (selectedPool.twoTokenProfit) {
        await setDashboardInstance(new web3.eth.Contract(dashboardAbi as AbiItem[], selectedPool.dashboardAddr));
      }

      // before using one abi for each token and pool
      // if (selectedPool.id === 'BunnyPool') {
      //   setTokenInstance(new web3.eth.Contract(BunnyAbi as AbiItem[], selectedPool.tokenAddr));
      //   setPoolInstance(new web3.eth.Contract(BunnyPoolAbi as AbiItem[], selectedPool.poolAddr));
      // } else if (selectedPool.id == 'BunnyBoostPool') {
      //   setTokenInstance(new web3.eth.Contract(BunnyAbi as AbiItem[], selectedPool.tokenAddr));
      //   setPoolInstance(new web3.eth.Contract(BunnyBoostPoolAbi as AbiItem[], selectedPool.poolAddr));
      // } else if (selectedPool.id == 'CakeBnbFlipCakeMaximizerPool') {
      //   setTokenInstance(new web3.eth.Contract(CakeBnbFlipAbi as AbiItem[], selectedPool.tokenAddr));
      //   setPoolInstance(new web3.eth.Contract(CakeBnbFlipCakeMaximizerPoolAbi as AbiItem[], selectedPool.poolAddr));
      //   setDashboardInstance(new web3.eth.Contract(DashboardBscAbi as AbiItem[], selectedPool.dashboardAddr));
      // } else if (selectedPool.id == 'BusdBnbFlipCakeMaximizerPool') {
      //   setTokenInstance(new web3.eth.Contract(BusdBnbFlipAbi as AbiItem[], selectedPool.tokenAddr));
      //   setPoolInstance(new web3.eth.Contract(BusdBnbFlipCakeMaximizerPoolAbi as AbiItem[], selectedPool.poolAddr));
      //   setDashboardInstance(new web3.eth.Contract(DashboardBscAbi as AbiItem[], selectedPool.dashboardAddr));
      // } else if (selectedPool.id == 'UsdtBnbFlipCakeMaximizerPool') {
      //   setTokenInstance(new web3.eth.Contract(UsdtBnbFlipAbi as AbiItem[], selectedPool.tokenAddr));
      //   setPoolInstance(new web3.eth.Contract(UsdtBnbFlipCakeMaximizerPoolAbi as AbiItem[], selectedPool.poolAddr));
      //   setDashboardInstance(new web3.eth.Contract(DashboardBscAbi as AbiItem[], selectedPool.dashboardAddr));
      // } else {
      // }

      console.log('tokenInstance:', tokenInstance)
      console.log('poolInstance:', poolInstance)
      console.log('dashboardInstance', dashboardInstance)
    }
    setNewPool();
  }, [selectedPool, web3]);

  // get data
  useEffect(() => {
    const getData = async () => {
      if (!safeInfo.safeAddress || !selectedPool || !poolInstance || !tokenInstance) {
        return;
      }

      // wait until pool is correctly updated
      if (selectedPool.poolAddr.toLocaleLowerCase() !== poolInstance?._address.toLocaleLowerCase()) {
        console.log("selectedPool.poolAddr: ", selectedPool.poolAddr)
        console.log("poolInstance?._address: ", poolInstance?._address)
        return;
      }

      // wait until token is correctly updated
      if (selectedPool.tokenAddr.toLocaleLowerCase() !== tokenInstance?._address.toLocaleLowerCase()) {
        console.log("selectedPool.tokenAddr: ", selectedPool.tokenAddr)
        console.log("tokenInstance?._address: ", tokenInstance?._address)
        console.log("selectedPool.dashboardAddr: ",selectedPool.dashboardAddr)
        console.log("dashboardInstance?._address: ",dashboardInstance?._address)
        return;
      }

      // wait until dashboard is correctly updated
      if ((selectedPool.twoTokenProfit) && (selectedPool.dashboardAddr.toLocaleLowerCase() !== dashboardInstance?._address.toLocaleLowerCase())) {
        console.log("selectedPool.dashboardAddr: ",selectedPool.dashboardAddr)
        console.log("dashboardInstance?._address: ",dashboardInstance?._address)
        return;
      }

      // get token Balance
      let tokenBalance;
      // should consider deleting first if statement
      if (selectedPool.id === 'BnbPool') {
        tokenBalance = bnbBalance;
      } else {
        tokenBalance = await tokenInstance.methods.balanceOf(safeInfo.safeAddress).call();
        console.log(selectedPool.label, 'tokenBalance: ', tokenBalance)
      }

      // get pool balance
      let poolBalance = await poolInstance.methods.balanceOf(safeInfo.safeAddress).call();
      console.log(selectedPool.label, 'poolBalance: ', poolBalance)

      let interestEarn;
      // get interest
      if (!selectedPool.twoTokenProfit) {
        let interest = await poolInstance.methods.earned(safeInfo.safeAddress).call();
        interestEarn = [interest.toString(), '0'];
        console.log('interestEarn: ', interestEarn)
        console.log('bNumberToHumanFormat(interestEarn[0]): ', bNumberToHumanFormat(interestEarn[0]))
      } else if (selectedPool.twoTokenProfit) {
        let interest = await dashboardInstance.methods.profitOfPool(selectedPool.poolAddr, safeInfo.safeAddress).call();
        interestEarn = [interest.profit.toString(), interest.bunny.toString()]
        console.log('interestEarn: ', interestEarn)
        console.log('bNumberToHumanFormat(interestEarn[0]): ', bNumberToHumanFormat(interestEarn[0]))
        console.log('bNumberToHumanFormat(interestEarn[1]): ', bNumberToHumanFormat(interestEarn[1]))
      } else {
        interestEarn = ["0", "0"];
      }

      // get allowance (only in console)
      let allowance = await tokenInstance.methods.allowance(safeInfo.safeAddress,selectedPool.poolAddr).call()
      console.log("allowance: ", allowance)

      // get isPoolApproved
      let isPoolApproved;
      if (localStorage.getItem(selectedPool.id+"ApprovedBefore")===null){
        isPoolApproved=false
      }
      if (localStorage.getItem(selectedPool.id+"ApprovedBefore")==='true'){
        isPoolApproved=true
      }

      setTokenBalance(tokenBalance);
      setPoolBalance(poolBalance);
      setInterestEarn(interestEarn);
      setIsPoolApproved(isPoolApproved);

    };


    getData();
  }, [safeInfo, selectedPool, poolInstance, tokenInstance, dashboardInstance, bnbBalance]);

  // added for Zap
  // load tokens list and initialize with Bunny
  useEffect(() => {
    if (!safeInfo) {
      return;
    }

    const tokenListRes = getTokenList(safeInfo.network);
    console.log("tokenListRes: ", tokenListRes)
    setTokenList(tokenListRes);

    var findSelectedFromToken = tokenListRes.find((t) => t.id === 'Bnb');
    if (localStorage.getItem('selectedFromToken')) {
      findSelectedFromToken = tokenListRes.find((t) => t.id === localStorage.getItem('selectedFromToken'));
    }
    setSelectedFromToken(findSelectedFromToken);
    console.log("selected from token: ", findSelectedFromToken)

    var findSelectedToToken = tokenListRes.find((t) => t.id === 'Bunny');
    if (localStorage.getItem('selectedToToken')) {
      findSelectedToToken = tokenListRes.find((t) => t.id === localStorage.getItem('selectedToToken'));
    }
    setSelectedToToken(findSelectedToToken);
    console.log("selected to token: ", findSelectedToToken)

  }, [safeInfo]);

  // on zap to and from tokens
  useEffect(() => {
    const setNewZap = async() => {
      if (!selectedFromToken || !selectedToToken || !web3) {
        return;
      }

      console.log("selectedFromToken.id: ", selectedFromToken.id)
      console.log("selectedFromToken.tokenAddr: ", selectedFromToken.tokenAddr)

      if (selectedFromToken.id === 'Bnb') {
        await setFromTokenInstance(new web3.eth.Contract(BnbAbi as AbiItem[], selectedFromToken.tokenAddr));
      }
      else if (selectedFromToken.id ==='Wbnb') {
        await setFromTokenInstance(new web3.eth.Contract(WbnbAbi as AbiItem[], selectedFromToken.tokenAddr));
      }
      else {
        await setFromTokenInstance(new web3.eth.Contract(tokenAbi as AbiItem[], selectedFromToken.tokenAddr));
      }
      console.log('fromTokenInstance:', fromTokenInstance)

      //toTokenInstance is unnecessary, unless toToken is Wbnb
      if (selectedToToken.id ==='Wbnb') {
        await setToTokenInstance(new web3.eth.Contract(WbnbAbi as AbiItem[], selectedToToken.tokenAddr));
      }

      let zapAddr = '0xdC2bBB0D33E0e7Dea9F5b98F46EDBaC823586a0C'
      setZapInstance(new web3.eth.Contract(zapAbi as AbiItem[], zapAddr))
      console.log('zapInstance: ',zapInstance)
    }
    setNewZap();
  }, [selectedFromToken, web3]);

  // get selectedFromToken balance
  useEffect(() => {
    const getData = async () => {
      if (!safeInfo.safeAddress || !selectedFromToken || !fromTokenInstance) {
        return;
      }

      // wait until fromToken is correctly updated
      if (selectedFromToken.tokenAddr.toLocaleLowerCase() !== fromTokenInstance?._address.toLocaleLowerCase()) {
        console.log("selectedFromToken.tokenAddr: ", selectedFromToken.tokenAddr)
        console.log("fromTokenInstance?._address: ", fromTokenInstance?._address)
        return;
      }

      // get fromToken Balance
      let fromTokenBalance;
      // should consider deleting first if statement
      if (selectedFromToken.id === 'Bnb') {
        fromTokenBalance = bnbBalance;
      } else {
        fromTokenBalance = await fromTokenInstance.methods.balanceOf(safeInfo.safeAddress).call();
        console.log(selectedFromToken.label, 'tokenBalance: ', tokenBalance)
      }

      let isTokenApproved;
      if (localStorage.getItem(selectedFromToken.id+"ApprovedBefore")===null){
        isTokenApproved=false
      }
      if (localStorage.getItem(selectedFromToken.id+"ApprovedBefore")==='true'){
        isTokenApproved=true
      }

      setFromTokenBalance(fromTokenBalance);
      setIsTokenApproved(isTokenApproved);
    };

    getData();
  }, [safeInfo, selectedFromToken, fromTokenInstance, bnbBalance]);

  const bNumberToHumanFormat = (value: string) => {
    if (!selectedPool) {
      return '';
    }
    return new Big(value).div(10 ** selectedPool.decimals).toFixed(4);
  };

  //왜 있어야되는지 몰라서 지움
  //const validateInputValue = (): boolean => {
  //  setInputError(undefined);

  //const currentValueBN = new Big(inputValue);
  //const comparisonValueBN = new Big(tokenBalance)

  //if (currentValueBN.gt(comparisonValueBN)) {
  //    const value = tokenBalance;
  //    setInputError(`Max value is ${bNumberToHumanFormat(value)}`);
  //    return false;
  //  }

  //  return true;
  //};

  const poolApprove = async () => {
    if (!selectedPool || !web3) {
      return;
    }
    //if (!selectedToken || !validateInputValue() || !web3) {
    //  return;
    //}

    //maximum unint256 as allowance
    const allowance = web3.utils.toBN("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    console.log("allowance: ",allowance)
    console.log("selectedPool.poolAddr: ", selectedPool.poolAddr)
    console.log('selectedPool.tokenAddr: ',selectedPool.tokenAddr)
    console.log('encodeAbi: ', await tokenInstance.methods.approve(selectedPool.poolAddr, allowance).encodeABI())

    let txs;
    txs = [
      {
        to: selectedPool.tokenAddr,
        value: '0',
        data: tokenInstance.methods.approve(selectedPool.poolAddr, allowance).encodeABI(),
      },
    ];
    const params = {
      //bunny,usdt-bnb,busd-bnb 모두 30000 괜찮
      safeTxGas: 30000,
    };

    //appsSdk.txs.send({txs});
    appsSdk.txs.send({txs, params});

    let approvedKey = selectedPool.id + "ApprovedBefore";
    localStorage.setItem(approvedKey, 'true');
    console.log(selectedPool.id + "ApprovedBefore",localStorage.getItem(approvedKey))
  }

  const deposit = () => {
    if (!selectedPool || !web3) {
      return;
    }
    //if (!selectedToken || !validateInputValue() || !web3) {
    //  return;
    //}

    const depositParameter = web3.utils.toBN(poolInputValue.toString());
    console.log('depositParameter ', depositParameter.toString())

    let txs;
    if (selectedPool.id === 'BnbPool') {
      txs = [
        {
          to: selectedPool.poolAddr,
          value: depositParameter.toString(),
          data: poolInstance.methods.depositBNB().encodeABI(),
        },
      ];
    }
    else {
      txs = [
        {
          to: selectedPool.poolAddr,
          value: '0',
          data: poolInstance.methods.deposit(depositParameter).encodeABI(),
        },
      ];
    }

    const params = {
      safeTxGas: 1000000,
    };

    //appsSdk.txs.send({txs})
    appsSdk.txs.send({txs, params});

    setPoolInputValue('');
  };

  const withdraw = () => {
    if (!selectedPool || !web3) {
      return;
    }
    //if (!selectedToken || !validateInputValue() || !web3) {
    //  return;
    //}

    const withdrawParameter = web3.utils.toBN(poolInputValue.toString());
    console.log(withdrawParameter.toString());

    let txs;
    if (selectedPool.id === 'BnbPool'){
      txs = [
        {
          to: selectedPool.poolAddr,
          value: '0',
          data: poolInstance.methods.withdrawUnderlying(withdrawParameter).encodeABI(),
        },
      ];
    }
    else {
      txs = [
        {
          to: selectedPool.poolAddr,
          value: '0',
          data: poolInstance.methods.withdraw(withdrawParameter).encodeABI(),
        },
      ];
    }

    const params = {
      safeTxGas:
      1000000
    };

    //appsSdk.txs.send({txs})
    appsSdk.txs.send({txs, params});

    setPoolInputValue('');
  };

  const withdrawAll = () => {
    if (!selectedPool || !web3) {
      return;
    }
    //if (!selectedToken || !validateInputValue() || !web3) {
    //  return;
    //}

    const txs = [
      {
        to: selectedPool.poolAddr,
        value: '0',
        data: poolInstance.methods.withdrawAll().encodeABI(),
      },
    ];

    const params = {
      safeTxGas: 1000000,
    };

    //appsSdk.txs.send({txs})
    appsSdk.txs.send({txs, params});

    setPoolInputValue('');
  };

  const getReward = () => {
    if (!selectedPool || !web3) {
      return;
    }
    //if (!selectedToken || !validateInputValue() || !web3) {
    //  return;
    //}

    const txs = [
      {
        to: selectedPool.poolAddr,
        value: '0',
        data: poolInstance.methods.getReward().encodeABI(),
      },
    ];

    const params = {
      safeTxGas: 1000000,
    };

    appsSdk.txs.send({txs, params});

    setPoolInputValue('');
  };

  const isWithdrawDisabled = () => {
    if (!!poolInputError || !poolInputValue || !isPoolApproved || !selectedPool) {
      return true;
    }

    const bigInput = new Big(poolInputValue);

    console.log('isWithdrawDisabled: ', bigInput.eq('0') || bigInput.gt(poolBalance))

    return bigInput.eq('0') || bigInput.gt(poolBalance);

  };

  const isDepositDisabled = () => {
    if (!!poolInputError || !poolInputValue || !isPoolApproved || !selectedPool) {
      return true;
    }

    const bigInput = new Big(poolInputValue);

    console.log('isSupplyDisabled: ', bigInput.eq('0') || bigInput.gt(tokenBalance))

    return bigInput.eq('0') || bigInput.gt(tokenBalance);
  };

  const isWithdrawAllDisabled = () => {
    if (!!poolInputError || !isPoolApproved || !selectedPool) {
      return true;
    }
    return poolBalance==='0';
  }

  const isGetRewardDisabled = () => {
    if (!!poolInputError || !isPoolApproved || !selectedPool) {
      return true;
    }

    if (!selectedPool.twoTokenProfit){
      return interestEarn[0]==='0'
    }
    else if (selectedPool.twoTokenProfit) {
      return interestEarn[0]==='0' || interestEarn[1]==='0';
    }
  }
  const onSelectPool = async (id: string) => {
    if (!poolList) {
      return;
    }
    const selectedPool = await poolList.find((t) => t.id === id);
    if (!selectedPool) {
      return;
    }
    await setSelectedPool(selectedPool);
    await localStorage.setItem('selectedPool', selectedPool.id);
  };

  const onPoolInputChange = (value: string) => {
    setPoolInputError(undefined);
    setPoolInputValue(value);
  };

  if (!selectedPool || !connected) {
    return <Loader size="md"/>;
  }

  //added for Zap
  const tokenApprove = async () => {
    if (!selectedFromToken || !web3) {
      return;
    }
    //if (!selectedFromToken || !validateInputValue() || !web3) {
    //  return;
    //}

    //maximum unint256 as allowance
    const allowance = web3.utils.toBN("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    console.log("allowance: ",allowance)
    console.log("selectedFromToken.tokenAddr: ", selectedFromToken.tokenAddr)
    console.log('selectedToToken.tokenAddr: ',selectedToToken.tokenAddr)

    let zapAddr = '0xdC2bBB0D33E0e7Dea9F5b98F46EDBaC823586a0C'
    console.log('encodeAbi: ', await tokenInstance.methods.approve(zapAddr, allowance).encodeABI())

    const txs = [
      {
        to: selectedFromToken.tokenAddr,
        value: '0',
        data: fromTokenInstance.methods.approve(zapAddr, allowance).encodeABI(),
      },
    ];

    const params = {
      safeTxGas: 30000,
    };

    appsSdk.txs.send({txs, params});

    let approvedKey = selectedFromToken.id + "ApprovedBefore";
    localStorage.setItem(approvedKey, 'true');
    console.log(selectedFromToken.id + "ApprovedBefore",localStorage.getItem(approvedKey))
  }

  const zap = () => {
    if (!selectedFromToken || !selectedToToken || !web3) {
      return;
    }
    //if (!selectedToken || !validateInputValue() || !web3) {
    //  return;
    //}

    let zapAddr = '0xdC2bBB0D33E0e7Dea9F5b98F46EDBaC823586a0C';
    const zapParameter = web3.utils.toBN(tokenInputValue.toString());
    console.log(zapParameter.toString());

    console.log("selectedFromToken.tokenAddr,selectedToToken.tokenAddr: ",selectedFromToken.tokenAddr,selectedToToken.tokenAddr)
    let txs;
    if (selectedFromToken.id==='Bnb' && selectedToToken.id==='Wbnb'){
      txs = [
        {
          to: selectedToToken.tokenAddr,
          value: zapParameter.toString(),
          data: toTokenInstance.methods.deposit().encodeABI(),
        },
      ];
    } else if (selectedFromToken.id==='Wbnb' && selectedToToken.id==='Bnb'){
      txs = [
        {
          to: selectedFromToken.tokenAddr,
          value: '0',
          data: fromTokenInstance.methods.withdraw(zapParameter).encodeABI(),
        },
      ];
    } else if (selectedFromToken.useZapInToken) {
      txs = [
        {
          to: zapAddr,
          value: '0',
          data: zapInstance.methods.zapInToken(selectedFromToken.tokenAddr,zapParameter,selectedToToken.tokenAddr).encodeABI(),
        },
      ];
    } else if (selectedFromToken.useZapOut) {
      txs = [
        {
          to: zapAddr,
          value: '0',
          data: zapInstance.methods.zapOut(selectedFromToken.tokenAddr,zapParameter).encodeABI(),
        },
      ];
    // when fromToken uses ZapIn function (such as when fromToken is BNB)
    } else {
      txs = [
        {
          to: zapAddr,
          value: zapParameter.toString(),
          data: zapInstance.methods.zapIn(selectedToToken.tokenAddr).encodeABI(),
        },
      ];
    }

      const params = {
      safeTxGas: 1000000,
    };

    appsSdk.txs.send({txs, params});

    setTokenInputValue('');
  };

  const isZapDisabled = () => {
    if (!!tokenInputError || !tokenInputValue || !isTokenApproved || !selectedFromToken || !selectedToToken) {
      return true;
    }

    const bigInput = new Big(tokenInputValue);

    console.log('isZapDisabled: ', (bigInput.eq('0') || bigInput.gt(fromTokenBalance)) || (selectedFromToken.id===selectedToToken.id));

    return (bigInput.eq('0') || bigInput.gt(fromTokenBalance)) || (selectedFromToken.id===selectedToToken.id);

  };

  const onSelectFromToken = async (id: string) => {
    if (!tokenList) {
      return;
    }
    const selectedFromToken = await tokenList.find((t) => t.id === id);
    if (!selectedFromToken) {
      return;
    }
    await setSelectedFromToken(selectedFromToken);
    console.log('selectedFromToken: ', selectedFromToken);
    await localStorage.setItem('selectedFromToken', selectedFromToken.id);
  };

  const onSelectToToken = async (id: string) => {
    if (!tokenList) {
      return;
    }
    const selectedToToken = await tokenList.find((t) => t.id === id);
    if (!selectedToToken) {
      return;
    }
    await setSelectedToToken(selectedToToken);
    console.log('selectedToToken: ', selectedToToken);
    await localStorage.setItem('selectedToToken', selectedToToken.id);
  };

  const onTokenInputChange = (value: string) => {
    setTokenInputError(undefined);
    setTokenInputValue(value);
  };

  if (!selectedFromToken || !selectedToToken || !connected) {
    return <Loader size="md"/>;
  }

  return (
      <WidgetWrapper>
        <StyledTitle size="xs"> Your PancakeBunny Pool Balance </StyledTitle>
          <BottomSmallMargin>
            <SelectContainer>
              <Select items={poolList || []} activeItemId={selectedPool.id} onItemClick={onSelectPool}/>
            </SelectContainer>
          </BottomSmallMargin>

        <BottomLargeMargin>
          <DaiInfo>
            <div>
              <Text size="lg"> {selectedPool.tokenLabel} available to deposit </Text>
              <Text size="lg"> {bNumberToHumanFormat(tokenBalance)}</Text>
            </div>
            <Divider/>
            <div>
              <Text size="lg"> {selectedPool.tokenLabel} already deposited </Text>
              <Text size="lg"> {bNumberToHumanFormat(poolBalance)}</Text>
            </div>
            <Divider/>
            <div>
              <Text size="lg"> Profit </Text>
              {!selectedPool.twoTokenProfit
                  ? <Text size="lg"> {bNumberToHumanFormat(interestEarn[0])} {selectedPool.profitLabel[0]} </Text>
                  :
                  <Text size='lg'> {bNumberToHumanFormat(interestEarn[0])} {selectedPool.profitLabel[0]}
                    <br/>
                    + {bNumberToHumanFormat(interestEarn[1])} {selectedPool.profitLabel[1]} </Text>
              }
            </div>

          </DaiInfo>
        </BottomLargeMargin>

        <Title size="xs">Withdraw or Deposit</Title>

        <BottomLargeMargin>
          {!isPoolApproved ?
              <ButtonContainer>
                <Button size="lg" color="primary" variant="contained" onClick={poolApprove}> Approve PancakeBunny <br/>
                  to transact your {selectedPool.tokenLabel} </Button>
                {/*consider also using 'in {selectedPool.label}'*/}
              </ButtonContainer>
          :
            <div>
              <BigNumberInput
                  decimals={selectedPool.decimals}
                  onChange={onPoolInputChange}
                  value={poolInputValue}
                  //renderInput={(props: any) => <TextField label="Amount" meta={{ error: inputError }} {...props} />}
                  renderInput={(props: any) => <TextField label="Amount" {...props} />}
              />

              <ButtonContainer>
              <Button size="lg" color="secondary" variant="contained" onClick={withdraw} disabled={isWithdrawDisabled()}>
              Withdraw
              </Button>
              <div>&nbsp;&nbsp;&nbsp;</div>
              <Button size="lg" color="primary" variant="contained" onClick={deposit} disabled={isDepositDisabled()}>
              Deposit
              </Button>
              </ButtonContainer>

              <ButtonContainer>
                <Button size="lg" color="secondary" variant="contained" onClick={withdrawAll} disabled={isWithdrawAllDisabled()}>
                  Withdraw All
                </Button>
                <div>&nbsp;&nbsp;&nbsp;</div>
                <Button size="lg" color="primary" variant="contained" onClick={getReward} disabled={isGetRewardDisabled()}>
                Claim All Profit
                </Button>
              </ButtonContainer>
            </div>
          }
        </BottomLargeMargin>

        {/*//added for Zap*/}
        <BottomLargeMargin>
          <Title size={'xs'}>
            Zap
          </Title>
          <ButtonContainer>
            <SelectContainer>
              From: &nbsp;&nbsp; <Select items={tokenList || []} activeItemId={selectedFromToken.id} onItemClick={onSelectFromToken}/>
            </SelectContainer>
            {/*//if fromToken is not Pancake Swap LP token*/}
            {!selectedFromToken.useZapOut ?
              <SelectContainer>
                To: &nbsp;&nbsp; <Select items={tokenList || []} activeItemId={selectedToToken.id} onItemClick={onSelectToToken}/>
              </SelectContainer>
            :
              <SelectContainer>
              To: &nbsp;{selectedFromToken.decompositionLabel[0]} and {selectedFromToken.decompositionLabel[1]}
              </SelectContainer>
            }
          </ButtonContainer>

          <DaiInfo>
            <div>
              <Text size="lg"> {selectedFromToken.label} available to Zap </Text>
              <Text size="lg"> {bNumberToHumanFormat(fromTokenBalance)}</Text>
            </div>
          </DaiInfo>

          {!isTokenApproved ?
          <ButtonContainer>
            <Button size="lg" color="primary" variant="contained" onClick={tokenApprove}> Approve PancakeBunny <br/> to Zap your &nbsp;{selectedFromToken.label} </Button>
          </ButtonContainer>
          :
          <div>
            <BigNumberInput
                decimals={selectedFromToken.decimals}
                onChange={onTokenInputChange}
                value={tokenInputValue}
                //renderInput={(props: any) => <TextField label="Amount" meta={{ error: inputError }} {...props} />}
                renderInput={(props: any) => <TextField label="Amount" {...props} />}
            />

            <ButtonContainer>
              <Button size="lg" color="primary" variant="contained" onClick={zap} disabled={isZapDisabled()}>
                Zap
              </Button>
            </ButtonContainer>
          </div>
          }
        </BottomLargeMargin>

      </WidgetWrapper>
  );
}
  export default App;
