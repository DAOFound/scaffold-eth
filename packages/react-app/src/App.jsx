import { Button, Col, Menu, Row } from "antd";
import "antd/dist/antd.css";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import {
  Account,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
  NetworkDisplay,
  FaucetHint,
  NetworkSwitch,
} from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { CreateProposal, Hints, Subgraph, CreateFlow, ProposalList } from "./views";
import { useStaticJsonRPC } from "./hooks";

import Intro from "./pages/Home/Intro";
import { HStack, Flex, Image, Text, Box, VStack } from "@chakra-ui/react";
import DAOFoundImage from "./logo_transparent.png";

const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Alchemy.com & Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.kovan; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = true;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = [initialNetwork.name, "mainnet", "rinkeby", "mumbai"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const [isIntro, setIsIntro] = useState(true);
  const location = useLocation();

  const targetNetwork = NETWORKS[selectedNetwork];

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts, "YourContract", "purpose");

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  useEffect(() => {
    const skillWallet = sessionStorage.getItem("skillWallet");
    if (skillWallet) {
      setIsIntro(false);
    }
  });

  return (
    <div className="App">
      {isIntro ? (
        <Intro />
      ) : (
        <>
          {" "}
          <HStack>
            <NetworkDisplay
              NETWORKCHECK={NETWORKCHECK}
              localChainId={localChainId}
              selectedChainId={selectedChainId}
              targetNetwork={targetNetwork}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
            />
          </HStack>
          <Flex alignItems="center" flex="0 1 auto" boxShadow="md" pos="fixed" w="100vw" zIndex={2}>
            <Menu style={{ textAlign: "center", width: "100%" }} selectedKeys={[location.pathname]} mode="horizontal">
              <Menu.Item key="/" style={{ position: "relative", right: "10%" }}>
                <Link to="/">
                  <HStack>
                    <Image src={DAOFoundImage} alt="logo" boxSize="30px" />
                    <Text textAlign="right">DAOFound</Text>
                  </HStack>
                </Link>
              </Menu.Item>
              {/* <Menu.Item key="/">
              <Link to="/">App Home</Link>
            </Menu.Item> */}
              <Menu.Item key="/listProposals">
                <Link to="/listProposals">Proposals list</Link>
              </Menu.Item>
              {/* <Menu.Item key="/hints">
              <Link to="/hints">Hints</Link>
            </Menu.Item> */}
              <Menu.Item key="/createFlow">
                <Link to="/createFlow">Create Flow</Link>
              </Menu.Item>
              <Menu.Item key="/createProposal">
                <Link to="/createProposal">Create Proposal</Link>
              </Menu.Item>
              <Menu.Item style={{ position: "relative", left: "14%" }}>
                <sw-auth
                  partner-key="9a916a3443179cf183be272e596a64392a6f55ea"
                  use-dev="true"
                  use-button-options="true"
                ></sw-auth>
              </Menu.Item>
            </Menu>
          </Flex>
          <Switch>
            <Route exact path="/">
              {/* pass in any web3 props to this Home component. For example, yourLocalBalance */}
              <Box height={"100vh"}>
                <Box mt={20}>
                  <Text fontSize="4xl" textAlign="center">
                    DAOFound User Dashboard
                  </Text>
                </Box>
                <Text mb={5} fontSize="xl" textAlign="center">
                  You are currently connected to:
                </Text>
                <NetworkSwitch
                  networkOptions={networkOptions}
                  selectedNetwork={selectedNetwork}
                  setSelectedNetwork={setSelectedNetwork}
                />
                <HStack ml={250} mt={2}>
                  <Text mt={10} mb={5} pb={5} fontSize="xl" textAlign="center">
                    Account Number:
                  </Text>
                  <Account
                    useBurner={USE_BURNER_WALLET}
                    address={address}
                    localProvider={localProvider}
                    userSigner={userSigner}
                    mainnetProvider={mainnetProvider}
                    price={price}
                    web3Modal={web3Modal}
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    blockExplorer={blockExplorer}
                  />
                </HStack>
                <FaucetHint localProvider={localProvider} targetNetwork={targetNetwork} address={address} />
                <VStack mt={2}>
                  <Text mt={10} mb={5} pb={5} fontSize="xl" textAlign="center">
                    So far we have collected: 8496.37$
                  </Text>
                  <Text mt={10} mb={5} pb={5} fontSize="xl" textAlign="center">
                    and our budget is growing every second! :)
                  </Text>
                </VStack>
              </Box>
            </Route>
            <Route exact path="/listProposals">
              <ProposalList
                chainId={selectedChainId}
                mainnetProvider={mainnetProvider}
                writeContracts={writeContracts}
                tx={tx}
              />
            </Route>
            <Route path="/createFlow">
              <Box height={"100vh"} mt={100}>
                <CreateFlow
                  selectedChainId={selectedChainId}
                  readContracts={readContracts}
                  writeContracts={writeContracts}
                  userProviderAndSigner={userProviderAndSigner}
                  address={address}
                />
              </Box>
            </Route>
            <Route path="/createProposal">
              <Box height={"100vh"} mt={200}>
                <CreateProposal tx={tx} writeContracts={writeContracts} />
              </Box>
            </Route>
          </Switch>
        </>
      )}
    </div>
  );
}

export default App;
