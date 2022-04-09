module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const namedAccounts = await getNamedAccounts();
  const { deployer } = namedAccounts;
  const chainId = await getChainId();
  let args;

  switch (chainId) {
    case "42":
      // kovan
      args = [
        "0xF0d7d1D47109bA426B9D8A3Cde1941327af1eea3",
        "0xe3cb950cb164a31c66e32c320a800d477019dcff",
      ];
      break;
    case "4":
      // rinkeby
      args = [
        "0xeD5B5b32110c3Ded02a07c8b8e97513FAfb883B6",
        "0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90",
      ];
      break;
    case "80001":
      // mumbai
      args = [
        "0xEB796bdb90fFA0f28255275e16936D25d3418603",
        "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f",
      ];
      break;
    default:
      // eslint-disable-next-line no-throw-literal
      throw `Unsupported network: ${chainId}`;
  }

  const deployResult = await deploy("DAOFound", {
    from: deployer,
    args,
  });
  if (deployResult.newlyDeployed) {
    log(
      `contract DAOFound deployed at ${deployResult.address} using ${deployResult.receipt.gasUsed} gas`
    );
  }
};
module.exports.tags = ["DAOFound"];
