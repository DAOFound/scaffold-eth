module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const namedAccounts = await getNamedAccounts();
  const { deployer } = namedAccounts;
  const deployResult = await deploy("DAOFound", {
    from: deployer,
    args: [
      "0xF0d7d1D47109bA426B9D8A3Cde1941327af1eea3",
      "0xe3cb950cb164a31c66e32c320a800d477019dcff",
    ],
  });
  if (deployResult.newlyDeployed) {
    log(
      `contract DAOFound deployed at ${deployResult.address} using ${deployResult.receipt.gasUsed} gas`
    );
  }
};
module.exports.tags = ["DAOFound"];
