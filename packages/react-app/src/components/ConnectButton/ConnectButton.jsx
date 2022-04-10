import { Button, ButtonGroup, Icon, IconButton } from "@chakra-ui/react";
import { shortenAddress } from "@usedapp/core";
import { FC, useContext } from "react";
import { HiOutlineLogout } from "react-icons/hi";
import { useLocation } from "react-router-dom";

const ConnectButton = ({ size, text }) => {
  const location = useLocation();

  // @ts-ignore
  const from = location.state?.from?.pathname || "/dashboard";
  return <div></div>;
};

export default ConnectButton;
