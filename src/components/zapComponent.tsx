import React, {useEffect, useState} from "react";
import Web3 from 'web3';
import {AbiItem} from 'web3-utils';
import {Big} from "big.js";
import {BigNumberInput} from "big-number-input";
import {Button, Loader, Select, Text, TextField, Title} from "@gnosis.pm/safe-react-components";
import {useSafeAppsSDK} from "@gnosis.pm/safe-apps-react-sdk";

import {getTokenList, TokenItem} from "../config";
import {BnbAbi} from "../abis/BnbAbi";
import {WbnbAbi} from "../abis/WbnbAbi";
import {BunnyAbi as tokenAbi} from "../abis/BunnyAbi";
import {ZapBscAbi as zapAbi} from "../abis/ZapBscAbi";
import {BottomLargeMargin, ButtonContainer, PoolInfo, SelectContainer} from "./styleComponents";

export const ZapComponent: React.FC = () => {

    const [web3, setWeb3] = useState<Web3 | undefined>();
    const {sdk: appsSdk, safe: safeInfo, connected} = useSafeAppsSDK();

    const [tokenList, setTokenList] = useState<Array<TokenItem>>();
    const [selectedFromToken, setSelectedFromToken] = useState<any>();
    const [selectedToToken, setSelectedToToken] = useState<any>();

    const [fromTokenInstance, setFromTokenInstance] = useState<any>();
    const [toTokenInstance, setToTokenInstance] = useState<any>();
    const [zapInstance, setZapInstance] = useState<any>();

    const [bnbBalance, setBnbBalance] = useState('0');
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
            }
        }
        getBnbBalance();
    }, [web3, safeInfo.safeAddress]);

    // load tokens list and initialize with Bnb and Bunny
    useEffect(() => {
        if (!safeInfo) {
            return;
        }

        const tokenListRes = getTokenList(safeInfo.network);
        setTokenList(tokenListRes);

        var findSelectedFromToken = tokenListRes.find((t) => t.id === 'Bnb');
        if (localStorage.getItem('selectedFromToken')) {
            findSelectedFromToken = tokenListRes.find((t) => t.id === localStorage.getItem('selectedFromToken'));
        }
        setSelectedFromToken(findSelectedFromToken);

        var findSelectedToToken = tokenListRes.find((t) => t.id === 'Bunny');
        if (localStorage.getItem('selectedToToken')) {
            findSelectedToToken = tokenListRes.find((t) => t.id === localStorage.getItem('selectedToToken'));
        }
        setSelectedToToken(findSelectedToToken);

    }, [safeInfo]);

    // make token and zap instances
    useEffect(() => {
        const setNewZap = async() => {
            if (!selectedFromToken || !selectedToToken || !web3) {
                return;
            }

            if (selectedFromToken.id === 'Bnb') {
                await setFromTokenInstance(new web3.eth.Contract(BnbAbi as AbiItem[], selectedFromToken.tokenAddr));
            }
            else if (selectedFromToken.id ==='Wbnb') {
                await setFromTokenInstance(new web3.eth.Contract(WbnbAbi as AbiItem[], selectedFromToken.tokenAddr));
            }
            else {
                await setFromTokenInstance(new web3.eth.Contract(tokenAbi as AbiItem[], selectedFromToken.tokenAddr));
            }

            // toToken instance is unnecessary, unless toToken is Wbnb
            if (selectedToToken.id ==='Wbnb') {
                await setToTokenInstance(new web3.eth.Contract(WbnbAbi as AbiItem[], selectedToToken.tokenAddr));
            }

            let zapAddr = '0xdC2bBB0D33E0e7Dea9F5b98F46EDBaC823586a0C'
            setZapInstance(new web3.eth.Contract(zapAbi as AbiItem[], zapAddr))
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
                return;
            }

            // get selectedFromToken Balance
            let fromTokenBalance;
            if (selectedFromToken.id === 'Bnb') {
                fromTokenBalance = bnbBalance;
            } else {
                fromTokenBalance = await fromTokenInstance.methods.balanceOf(safeInfo.safeAddress).call();
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
        if (!selectedFromToken) {
            return '';
        }
        return new Big(value).div(10 ** selectedFromToken.decimals).toFixed(4);
    };

    // approve fromToken
    const tokenApprove = async () => {
        if (!selectedFromToken || !web3) {
            return;
        }

        //maximum unint256 as allowance
        const allowance = web3.utils.toBN("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

        let zapAddr = '0xdC2bBB0D33E0e7Dea9F5b98F46EDBaC823586a0C'

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
    }

    //zap
    const zap = () => {
        if (!selectedFromToken || !selectedToToken || !web3) {
            return;
        }

        let zapAddr = '0xdC2bBB0D33E0e7Dea9F5b98F46EDBaC823586a0C';
        const zapParameter = web3.utils.toBN(tokenInputValue.toString());

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

            <PoolInfo>
                <div>
                    <Text size="lg"> {selectedFromToken.label} available to Zap </Text>
                    <Text size="lg"> {bNumberToHumanFormat(fromTokenBalance)}</Text>
                </div>
            </PoolInfo>

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
    );
}