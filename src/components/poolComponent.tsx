import React, {useEffect, useState} from "react";
import Web3 from 'web3';
import {AbiItem} from 'web3-utils';
import {Big} from "big.js";
import {BigNumberInput} from "big-number-input";
import {Button, Divider, Loader, Select, Text, TextField, Title} from "@gnosis.pm/safe-react-components";
import {useSafeAppsSDK} from "@gnosis.pm/safe-apps-react-sdk";

import {getPoolList, PoolItem} from "../poolConfig";
import {BnbAbi} from "../abis/BnbAbi";
import {BnbPoolAbi} from "../abis/BnbPoolAbi";
import {BunnyAbi as tokenAbi} from "../abis/BunnyAbi";
import {BunnyPoolAbi as poolAbi} from "../abis/BunnyPoolAbi";
import {DashboardBscAbi as dashboardAbi} from "../abis/DashboardBscAbi";
import {BottomLargeMargin, BottomSmallMargin, ButtonContainer, Info, SelectContainer} from "./styleComponents";


export const PoolComponent: React.FC = () => {
    const [web3, setWeb3] = useState<Web3 | undefined>();
    const {sdk: appsSdk, safe: safeInfo, connected} = useSafeAppsSDK();

    const [poolList, setPoolList] = useState<Array<PoolItem>>();
    const [selectedPool, setSelectedPool] = useState<PoolItem>();

    const [tokenInstance, setTokenInstance] = useState<any>();
    const [poolInstance, setPoolInstance] = useState<any>();
    const [dashboardInstance, setDashboardInstance] = useState<any>();

    const [bnbBalance, setBnbBalance] = useState('0');
    const [poolBalance, setPoolBalance] = useState<string>('0');
    const [tokenBalance, setTokenBalance] = useState<string>('0');
    const [interestEarn, setInterestEarn] = useState<Array<string>>(['0', '0']);
    const [isPoolApproved, setIsPoolApproved] = useState<boolean>();

    const [poolInputValue, setPoolInputValue] = useState<string>('');
    const [poolInputError, setPoolInputError] = useState<string | undefined>();

    // set web3 instance
    useEffect(() => {
        if (!safeInfo) {
            return;
        }
        const web3Instance = new Web3(`https://bsc-dataseed.binance.org/`);
        setWeb3(web3Instance);
    }, [safeInfo]);

    // get Bnb balance
    useEffect(() => {
        if (!safeInfo || !web3){
            return;
        }
        const getBnbBalance = async () => {
            try {
                if (safeInfo.safeAddress) {
                    const balance = await web3?.eth.getBalance(safeInfo.safeAddress);
                    if (balance) {
                        setBnbBalance(balance);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
        getBnbBalance();

    }, [web3, safeInfo.safeAddress]);


    // load pool list and initialize with Bunny Pool
    useEffect(() => {
        if (!safeInfo) {
            return;
        }

        const poolListRes = getPoolList(safeInfo.network);
        setPoolList(poolListRes);

        var findSelectedPool = poolListRes.find((t) => t.id === 'BunnyPool');
        if (localStorage.getItem('selectedPool')) {
            findSelectedPool = poolListRes.find((t) => t.id === localStorage.getItem('selectedPool'));
        }
        setSelectedPool(findSelectedPool);
    }, [safeInfo]);

    // make pool, token, and dashboard instances
    useEffect(() => {
        const setNewPool = async() => {
            if (!selectedPool || !web3) {
                return;
            }

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
                return;
            }

            // wait until token is correctly updated
            if (selectedPool.tokenAddr.toLocaleLowerCase() !== tokenInstance?._address.toLocaleLowerCase()) {
                return;
            }

            // wait until dashboard is correctly updated
            if ((selectedPool.twoTokenProfit) && (selectedPool.dashboardAddr.toLocaleLowerCase() !== dashboardInstance?._address.toLocaleLowerCase())) {
                return;
            }

            // get token Balance
            let tokenBalance;

            if (selectedPool.id === 'BnbPool') {
                tokenBalance = bnbBalance;
            } else {
                tokenBalance = await tokenInstance.methods.balanceOf(safeInfo.safeAddress).call();
            }

            // get pool balance
            let poolBalance = await poolInstance.methods.balanceOf(safeInfo.safeAddress).call();

            // get interest earned
            let interestEarn;
            if (!selectedPool.twoTokenProfit) {
                let interest = await poolInstance.methods.earned(safeInfo.safeAddress).call();
                interestEarn = [interest.toString(), '0'];
            } else if (selectedPool.twoTokenProfit) {
                let interest = await dashboardInstance.methods.profitOfPool(selectedPool.poolAddr, safeInfo.safeAddress).call();
                interestEarn = [interest.profit.toString(), interest.bunny.toString()]
            } else {
                interestEarn = ["0", "0"];
            }

            // get allowance (only in console)
            let allowance = await tokenInstance.methods.allowance(safeInfo.safeAddress,selectedPool.poolAddr).call()

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

    const bNumberToHumanFormat = (value: string) => {
        if (!selectedPool) {
            return '';
        }
        return new Big(value).div(10 ** selectedPool.decimals).toFixed(4);
    };

    // approve pool
    const poolApprove = async () => {
        if (!selectedPool || !web3) {
            return;
        }

        //maximum unint256 as allowance
        const allowance = web3.utils.toBN("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

        let txs;
        txs = [
            {
                to: selectedPool.tokenAddr,
                value: '0',
                data: tokenInstance.methods.approve(selectedPool.poolAddr, allowance).encodeABI(),
            },
        ];
        const params = {
            safeTxGas: 30000,
        };

        appsSdk.txs.send({txs, params});

        let approvedKey = selectedPool.id + "ApprovedBefore";
        localStorage.setItem(approvedKey, 'true');
    }

    // deposit in pool
    const deposit = () => {
        if (!selectedPool || !web3) {
            return;
        }

        const depositParameter = web3.utils.toBN(poolInputValue.toString());

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

        appsSdk.txs.send({txs, params});

        setPoolInputValue('');
    };

    // withdraw from pool
    const withdraw = () => {
        if (!selectedPool || !web3) {
            return;
        }

        const withdrawParameter = web3.utils.toBN(poolInputValue.toString());

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
        appsSdk.txs.send({txs, params});

        setPoolInputValue('');
    };

    // withdraw all from pool
    const withdrawAll = () => {
        if (!selectedPool || !web3) {
            return;
        }

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

        appsSdk.txs.send({txs, params});
        setPoolInputValue('');
    };

    // deposit all from pool
    const depositAll = () => {
        if (!selectedPool || !web3) {
            return;
        }

        let txs;
        if (selectedPool.id === 'BnbPool') {
            txs = [
                {
                    to: selectedPool.poolAddr,
                    value: bnbBalance.toString(),
                    data: poolInstance.methods.depositBNB().encodeABI(),
                },
            ];
        }
        else {
            txs = [
                {
                    to: selectedPool.poolAddr,
                    value: '0',
                    data: poolInstance.methods.depositAll().encodeABI(),
                },
            ];
        }

        const params = {
            safeTxGas: 1000000,
        };

        appsSdk.txs.send({txs, params});
        setPoolInputValue('');
    };

    // claim rewards from pool
    const getReward = () => {
        if (!selectedPool || !web3) {
            return;
        }

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
        return bigInput.eq('0') || bigInput.gt(poolBalance);

    };

    const isDepositDisabled = () => {
        if (!!poolInputError || !poolInputValue || !isPoolApproved || !selectedPool) {
            return true;
        }

        const bigInput = new Big(poolInputValue);
        return bigInput.eq('0') || bigInput.gt(tokenBalance);
    };

    const isWithdrawAllDisabled = () => {
        if (!!poolInputError || !isPoolApproved || !selectedPool) {
            return true;
        }
        return poolBalance==='0';
    }

    const isDepositAllDisabled = () => {
        if (!!poolInputError || !isPoolApproved || !selectedPool) {
            return true;
        }
        return tokenBalance==='0';
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

    return (
        <div>
            <Title size="xs"> Pool Balance </Title>
            <div> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
            <BottomSmallMargin>
                <SelectContainer>
                    <Select items={poolList || []} activeItemId={selectedPool.id} onItemClick={onSelectPool}/>
                </SelectContainer>
            </BottomSmallMargin>

            <BottomLargeMargin>
                <Info>
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

                </Info>
            </BottomLargeMargin>

            <Title size="xs">
                Withdraw or Deposit
                <div> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
            </Title>

            <BottomLargeMargin>
                {!isPoolApproved ?
                    <ButtonContainer>
                        <Button size="lg" color="primary" variant="contained" onClick={poolApprove}> Approve PancakeBunny <br/>
                            to transact your {selectedPool.tokenLabel} </Button>
                    </ButtonContainer>
                    :
                    <div>
                        <BigNumberInput
                            decimals={selectedPool.decimals}
                            onChange={onPoolInputChange}
                            value={poolInputValue}
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
                            <Button size="lg" color="primary" variant="contained" onClick={depositAll} disabled={isDepositAllDisabled()}>
                                Deposit All
                            </Button>
                        </ButtonContainer>

                        <ButtonContainer>
                            <Button size="lg" color="primary" variant="contained" onClick={getReward} disabled={isGetRewardDisabled()}>
                                Claim All Profit
                            </Button>
                        </ButtonContainer>
                    </div>
                }
            </BottomLargeMargin>
        </div>
    );
}