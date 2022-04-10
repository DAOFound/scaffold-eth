import { FC, useContext, useEffect } from "react";
import { Box, Button, Text, Grid, Flex, useColorMode, UnorderedList, ListItem, Image, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { InitSwAuth } from "@skill-wallet/auth";

import DAOFoundImage from "../../daofound.jpg";

import "./home.css";
import { Session } from "walletlink/dist/relay/Session";

const Intro = () => {
  const colorMode = "dark";

  const account = null;

  useEffect(() => {
    InitSwAuth();
  }, []);

  return (
    <>
      <Box id="background" position="fixed" height="100%" width="100%" />
      <Box id="logo" position="fixed" height="100%" width="50%" right="400px" />

      {/* page one */}
      <Box pt={10}>
        <sw-auth
          partner-key="9a916a3443179cf183be272e596a64392a6f55ea"
          use-dev="true"
          use-button-options="true"
        ></sw-auth>
      </Box>
      <Grid
        p={4}
        h="100%"
        minH="100vh"
        placeContent="center"
        alignItems="center"
        flexDirection="column"
        bgPosition="center"
        bgAttachment="fixed"
        pos="relative"
        templateColumns={{ base: "auto", md: "1fr 1fr" }}
      >
        <Box ml={12}>
          <HStack>
            <Image src={DAOFoundImage} alt="logo" boxSize="400px" />
            <Text fontSize="7xl" textAlign="right">
              DAOFound
            </Text>
          </HStack>
          <Text ml={20} mt={10} mb={5} fontSize="2xl" textAlign="left">
            Decentralised Autonomous Charity Foundation - for collecting and sharing money between charity projects,
            upvoted by the DAO members.
          </Text>
          <Flex justifyContent="flex-end" alignItems="center">
            <Box mr={4}>{/* <ConnectButton text="Join" size="md" /> */}</Box>
            {account && (
              <Link to="/dashboard">
                <Button>Enter</Button>
              </Link>
            )}
          </Flex>
        </Box>
      </Grid>
      {/* page two */}
      <Grid
        p={4}
        h="100%"
        minH="100vh"
        placeContent="center"
        alignItems="center"
        flexDirection="column"
        bgPosition="center"
        bgAttachment="fixed"
        pos="relative"
        templateColumns={{ base: "auto", md: "1fr 1fr" }}
      >
        <Box ml={12} textAlign="left">
          <Text fontSize="4xl">Support</Text>
          <Text>charity projects that really matter to you</Text>
          <Text mb={5}>
            without worrying about getting scammed,
            <br /> as every transaction made on DAOFound
            <br /> is fully transparent.
          </Text>

          <Text fontSize="4xl">Our mission</Text>
          <Text>
            is to look at the charity foundations from a new - DECENTRALIZED, AUTONOMOUS, and DEMOCRATIC perspective.
          </Text>
          <Text>Change the world Today!</Text>
        </Box>
        <Box width="100%" marginTop="auto" pb={12}>
          <Text fontSize="xxx-large" align="center">
            Join us now!
          </Text>
          <Flex justifyContent="center">
            <Box mr={4}>
              {" "}
              <sw-auth
                partner-key="9a916a3443179cf183be272e596a64392a6f55ea"
                use-dev="true"
                use-button-options="true"
              ></sw-auth>
            </Box>
            {account && (
              <Link to="/dashboard">
                <Button>Enter </Button>
              </Link>
            )}
            <Button
              onClick={() => {
                sessionStorage.setItem("skillWallet", "test");
              }}
            >
              ENTER NS{" "}
            </Button>{" "}
            {/* use this for no skill wallet */}
          </Flex>
        </Box>
      </Grid>
    </>
  );
};

export default Intro;
