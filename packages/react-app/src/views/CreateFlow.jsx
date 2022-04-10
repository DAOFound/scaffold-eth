import React, { useState, useEffect } from "react";
import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import { ConsoleSqlOutlined } from "@ant-design/icons";

function CreateFlow({ readContracts }) {
    const [recipient, setRecipient] = useState("");
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [flowRate, setFlowRate] = useState("");
    const [flowRateDisplay, setFlowRateDisplay] = useState("");
    const [currentAccount, setCurrentAccount] = useState("");

    function getDAITokenContract(chainId) {
        switch (parseInt(chainId, 16)) {
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
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const sf = await Framework.create({
            chainId: Number(chainId),
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
                sender: currentAccount,
                receiver: recipient,
                superToken: daiTokenContract
            });
            console.log("Deleting your stream...");

            await deleteFlowOperation.exec(signer);

            console.log(
                `Congrats - you've just deleted your money stream!
           Super Token: DAIx
           Sender: ${currentAccount}
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
            sender: currentAccount,
            receiver: recipient,
            providerOrSigner: signer
        })

        console.log(response.flowRate);

    }

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }
            const accounts = await ethereum.request({
                method: "eth_requestAccounts"
            });
            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
            // let account = currentAccount;
            // Setup listener! This is for the case where a user comes to our site
            // and connected their wallet for the first time.
            // setupEventListener()
        } catch (error) {
            console.log(error);
        }
    };

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });
        const chain = await window.ethereum.request({ method: "eth_chainId" });
        let chainId = chain;
        console.log("chain ID:", chain);
        console.log("global Chain Id:", chainId);
        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account);
            // Setup listener! This is for the case where a user comes to our site
            // and ALREADY had their wallet connected + authorized.
            // setupEventListener()
        } else {
            console.log("No authorized account found");
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

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

    function CreateButton({ isLoading, children, ...props }) {
        return (
            <Button variant="success" className="button" {...props}>
                {isButtonLoading ? <Spin animation="border" /> : children}
            </Button>
        );
    }

    const handleFlowRateChange = (e) => {
        setFlowRate(e.target.value);
        let newFlowRateDisplay = calculateFlowRate(e.target.value);
        setFlowRateDisplay(newFlowRateDisplay.toString());
    };

    return (
        <div>
            <h2>Create a Flow</h2>
            {currentAccount === "" ? (
                <>
                    <button id="connectWallet" className="button" onClick={connectWallet}>
                        Connect Wallet
                    </button>

                </>
            ) : <></>}
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
            <Button onClick={async () => {
                getFlow();
            }}>
                GET STREAM
            </Button>
            <Button onClick={async () => {
                deleteFlow();
            }}>
                DELETE STREAM
            </Button>
            <div className="description">

                <div className="calculation">
                    <p>Your flow will be equal to:</p>
                    <p>
                        <b>${flowRateDisplay !== " " ? flowRateDisplay : 0}</b> DAIx/month
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateFlow;
