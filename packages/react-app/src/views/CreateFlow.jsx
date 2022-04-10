import React, { useState, useEffect } from "react";
import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import { usePoller, useOnBlock } from "eth-hooks";

function CreateFlow({ readContracts, userProviderAndSigner, selectedChainId, address, writeContracts }) {
    const [recipient, setRecipient] = useState("");
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [flowRate, setFlowRate] = useState("");
    const [flowRateDisplay, setFlowRateDisplay] = useState("");

    const [actualFlow, setActualFlow] = useState("")

    useEffect(() => {
        async function getData() {
            const actualFlow = await getFlow();
            setActualFlow(actualFlow);
        }

        getData();

    }, [writeContracts.DAOFound]);

    function getDAITokenContract(chainId) {
        switch (chainId) {
            case 42:
                // kovan
                return "0xe3cb950cb164a31c66e32c320a800d477019dcff";
            case 4:
                // rinkeby
                return "0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90";
            case 80001:
                // mumbai
                return "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f";
            default:
                // eslint-disable-next-line no-throw-literal
                throw `Unsupported network: ${chainId}`;
        }
    }

    async function getSuperfluidFramework() {
        const provider = userProviderAndSigner.provider

        const signer = userProviderAndSigner.signer;

        const chainId = selectedChainId;
        const sf = await Framework.create({
            chainId: selectedChainId,
            provider: provider
        });

        const daiTokenContract = getDAITokenContract(chainId);

        return { sf, daiTokenContract, signer };
    }

    async function deleteFlow() {
        const { sf, daiTokenContract, signer } = await getSuperfluidFramework();

        const recipient = readContracts.DAOFound.address;

        try {
            const deleteFlowOperation = sf.cfaV1.deleteFlow({
                sender: address,
                receiver: recipient,
                superToken: daiTokenContract
            });
            console.log("Deleting your stream...");

            await deleteFlowOperation.exec(signer);

            console.log(
                `Congrats - you've just deleted your money stream!
           Super Token: DAIxF
           Sender: ${address}
           Receiver: ${recipient}
        `
            );
        } catch (error) {
            console.error(error);
        }


    }

    async function createNewFlow() {
        const { sf, daiTokenContract, signer } = await getSuperfluidFramework();

        const recipient = readContracts.DAOFound.address;

        try {
            const createFlowOperation = sf.cfaV1.createFlow({
                receiver: recipient,
                flowRate: flowRate,
                superToken: daiTokenContract,
            });

            console.log("Creating your stream...");

            const result = await createFlowOperation.exec(signer);
            console.log(result);

            console.log(
                `Congrats - you've just created a money stream!
        View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
        Super Token: DAIx
        Sender: ${signer}
        Receiver: ${recipient},
        FlowRate: ${flowRate}
        `
            );
        } catch (error) {
            console.log(
                "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
            );
            console.error(error);
        }
    }

    async function getFlow() {
        const { sf, daiTokenContract, signer } = await getSuperfluidFramework();

        const recipient = readContracts.DAOFound.address;



        const response = await sf.cfaV1.getFlow({
            superToken: daiTokenContract,
            sender: address,
            receiver: recipient,
            providerOrSigner: signer
        })

        return response;

    }



    function calculateFlowRate(amount) {
        if (typeof Number(amount) !== "number" || isNaN(Number(amount)) === true) {
            alert("You can only calculate a flowRate based on a number");
            return;
        } else if (typeof Number(amount) === "number") {
            if (Number(amount) === 0) {
                return 0;
            }
            const amountInWei = ethers.BigNumber.from(amount);
            const monthlyAmount = ethers.utils.formatEther(amountInWei.toString());
            const calculatedFlowRate = monthlyAmount * 3600 * 24 * 30;
            return calculatedFlowRate;
        }
    }



    const handleFlowRateChange = (e) => {
        setFlowRate(e.target.value);
        let newFlowRateDisplay = calculateFlowRate(e.target.value);
        setFlowRateDisplay(newFlowRateDisplay.toString());
    };

    return (
        <div>

            <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
                <Input placeholder="Flow rate"
                    onChange={handleFlowRateChange}
                />
                <Button
                    style={{ marginTop: 8 }}
                    onClick={() => {
                        createNewFlow();
                    }}
                >
                    Create stream!
                </Button>
            </div>


            <div className="description">

                <div className="calculation">
                    <p>Your stream will be equal to:</p>
                    <p>
                        <b>${flowRateDisplay !== " " ? flowRateDisplay : 0}</b> DAIx/month
                    </p>
                </div>
            </div>
            <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
                {actualFlow && actualFlow.flowRate != 0 ? (
                    <>
                        <Button onClick={async () => {
                            deleteFlow();
                        }}>
                            DELETE STREAM
                        </Button>
                        <Divider />
                        <Card>
                            <dt>Total deposit </dt>
                            <dd> {actualFlow.deposit}</dd>
                            <dt>Flow per second </dt>
                            <dd> {actualFlow.flowRate}</dd>

                        </Card>
                    </>
                ) : (
                    <></>
                )
                }
            </div>
        </div>
    );
};

export default CreateFlow;
