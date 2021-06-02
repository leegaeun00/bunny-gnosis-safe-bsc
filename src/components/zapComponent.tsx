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
import {GnosisSafeAbi} from "../abis/GnosisSafeAbi";
import {BottomLargeMargin, ButtonContainer, PoolInfo, SelectContainer} from "./styleComponents";

export const ZapComponent: React.FC = () => {

    const [web3, setWeb3] = useState<Web3 | undefined>();
    const {sdk: appsSdk, safe: safeInfo, connected} = useSafeAppsSDK();

    const [bnbBalance, setBnbBalance] = useState('0');

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

    //added for gasEstimate but failed to use
    const [safeInstance, setSafeInstance] = useState<any>();
    const [threshold, setThreshold] = useState(0);
    const [owners, setOwners] = useState<any>();
    const [gasEstimate, setGasEstimate] = useState(0);

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
            try {
                console.log("safeInfo.safeAddress: ", safeInfo.safeAddress);
                if (safeInfo.safeAddress) {
                    const balance = await web3?.eth.getBalance(safeInfo.safeAddress);
                    console.log("bnbBalance: ", balance)
                    if (balance) {
                        setBnbBalance(balance);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
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

    // load tokens list and initialize with Bnb and Bunny
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
            if (selectedFromToken.id === 'Bnb') {
                fromTokenBalance = bnbBalance;
            } else {
                fromTokenBalance = await fromTokenInstance.methods.balanceOf(safeInfo.safeAddress).call();
                console.log(selectedFromToken.label, 'fromTokenBalance: ', fromTokenBalance)
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
        console.log('encodeAbi: ', await fromTokenInstance.methods.approve(zapAddr, allowance).encodeABI())

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