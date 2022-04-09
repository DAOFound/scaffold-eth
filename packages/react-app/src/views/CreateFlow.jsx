import React, { useState, useEffect } from "react";
import { Framework } from "@superfluid-finance/sdk-core";
import {
    Button,
    Form,
    FormGroup,
    FormControl,
    Spinner,
    Card
} from "react-bootstrap";
// import "./createFlow.css";
import { ethers } from "ethers";

import { defaultAbiCoder } from "ethers/lib/utils";

// let account;




const url = 'https://api.covalenthq.com/v1/42/events/address/0x44e38a093481268bfF47cc4f795e6fC0C41cf38c/?starting-block=30920009&ending-block=latest&key=ckey_9ab7b2cd25f24aea8f55108f4b8'


//where the Superfluid logic takes place
async function createNewFlow(recipient, flowRate, currentAccount) {



    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const sf = await Framework.create({
        chainId: Number(chainId),
        provider: provider
    });

    const DAIx = "0xe3cb950cb164a31c66e32c320a800d477019dcff";



    try {

        console.log("account", currentAccount);

        const userData = defaultAbiCoder.encode(["address"], [currentAccount]);
        const createFlowOperation = sf.cfaV1.createFlow({
            receiver: recipient,
            flowRate: flowRate,
            superToken: DAIx,
            userData: userData// here we will send the address that sends the money
        });

        console.log("Creating your stream...");



        const result = await createFlowOperation.exec(signer);
        console.log(result);

        console.log(
            `Congrats - you've just created a money stream!
    View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
    Network: Kovan
    Super Token: DAIx
    Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
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

async function getEventsCovalent() {

    console.log("test")
    console.log("test");
    try {
        const response = await fetch(url);
        const data = await response.json();


        let proposalList = [];
        let fundingList = [];
        for (var entry of data.data.items) {
            switch (entry.raw_log_topics[0]) {

                case '0x344e2edbd54b7e137047f4e5af7fae74a07ad72083d9641d9cd5244653bded6b':
                    const proposalEvent = defaultAbiCoder.decode(["string", "uint256", "uint256"], entry.raw_log_data);

                    const proposal = {
                        proposalAddress: defaultAbiCoder.decode(["address"], entry.raw_log_topics[1]),
                        proposalDescription: proposalEvent[0],
                        proposalPercentage: parseInt(proposalEvent[1]._hex, 16),
                        proposalId: parseInt(proposalEvent[2]._hex, 16)
                    };

                    proposalList.push(proposal);
                    break;
                case '0xa7cbaaf15738ea1bcbdddfb06d8da60b51bd361982de413abad956b5df0b02b9':
                    const fundingEvent = defaultAbiCoder.decode(["uint256", "uint256"], entry.raw_log_data);

                    const funding = {
                        fundingAddress: defaultAbiCoder.decode(["address"], entry.raw_log_topics[1]),
                        fundingValue: parseInt(fundingEvent[0]._hex, 16),
                        fundingProposalId: parseInt(fundingEvent[1]._hex, 16)

                    }
                    fundingList.push(funding);
                    break;

            }

        }

        console.log(proposalList, fundingList);
    }

    catch (error) {
        console.error(error);
    }

}

function CreateFlow() {
    const [recipient, setRecipient] = useState("");
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [flowRate, setFlowRate] = useState("");
    const [flowRateDisplay, setFlowRateDisplay] = useState("");
    const [currentAccount, setCurrentAccount] = useState("");





    useEffect(() => {
        getEventsCovalent();
    }, []);

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
                {isButtonLoading ? <Spinner animation="border" /> : children}
            </Button>
        );
    }

    const handleRecipientChange = (e) => {
        setRecipient(() => ([e.target.name] = e.target.value));
    };

    const handleFlowRateChange = (e) => {
        setFlowRate(() => ([e.target.name] = e.target.value));
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
            ) : (
                <Card className="connectedWallet">
                    {`${currentAccount.substring(0, 4)}...${currentAccount.substring(
                        38
                    )}`}
                </Card>

            )}
            <Form>
                <FormGroup className="mb-3">
                    <FormControl
                        name="recipient"
                        value={recipient}
                        onChange={handleRecipientChange}
                        placeholder="Enter recipient address"
                    ></FormControl>
                </FormGroup>
                <FormGroup className="mb-3">
                    <FormControl
                        name="flowRate"
                        value={flowRate}
                        onChange={handleFlowRateChange}
                        placeholder="Enter a flowRate in wei/second"
                    ></FormControl>
                </FormGroup>
                <CreateButton
                    onClick={() => {
                        setIsButtonLoading(true);
                        createNewFlow(recipient, flowRate, currentAccount);
                        setTimeout(() => {
                            setIsButtonLoading(false);
                        }, 1000);
                    }}
                >
                    Click to Create Yofur Stream
                </CreateButton>

            </Form>

            <button onClick={getEventsCovalent}>
                GET EVENTS
            </button>

            <div className="description">
                <p>
                    Go to the CreateFlow.js component and look at the <b>createFlow() </b>
                    function to see under the hood
                </p>
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
