import hre, { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { AddressOne, multisigs } from "../../helpers/utils";
import { getConfig } from "../../helpers/deploymentConfig";
import { toAddress } from "../../helpers/deploymentUtils";

const func: DeployFunction = async ({
  network: { live, name },
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const vBNBAddress = (await ethers.getContractOrNull("vBNB"))?.address || AddressOne;
  const comptrollerAddress = (await ethers.getContractOrNull("Unitroller"))?.address || AddressOne;
  const WBNBAddress = (await ethers.getContractOrNull("WBNB"))?.address || AddressOne;
  const timelockAddress = (await ethers.getContractOrNull("NormalTimelock"))?.address || multisigs[name];
  //const timelockAddress = deployer; //TOFIX deployer
  const acmAddress = (await ethers.getContractOrNull("AccessControlManager"))?.address || AddressOne;
  const loopsLimit = 20;
  const { preconfiguredAddresses } = await getConfig(hre.network.name);
  const accessControlManagerAddress = await toAddress(
    preconfiguredAddresses.AccessControlManager || "AccessControlManager",
    hre,
  );
  const proxyOwnerAddress = await toAddress(preconfiguredAddresses.NormalTimelock || "account:deployer", hre);
console.log(proxyOwnerAddress);
  const defaultProxyAdmin = await hre.artifacts.readArtifact(
    "hardhat-deploy/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
  );

  await deploy("ProtocolShareReserve", {
    from: deployer,
    log: true,
    autoMine: true,
    args: [comptrollerAddress, WBNBAddress, vBNBAddress],
    skipIfAlreadyDeployed: true,
    proxy: {
      owner:  timelockAddress,
      proxyContract: "OptimizedTransparentUpgradeableProxy",
      execute: {
        methodName: "initialize",
        args: [acmAddress, loopsLimit],
      },
      viaAdminContract: {
        name: "DefaultProxyAdmin",
        artifact: defaultProxyAdmin,
      },
    },
  });

   const psr = await hre.ethers.getContract("ProtocolShareReserve");
   const poolRegistry = await ethers.getContract("PoolRegistry");
  const tx1 = await psr.setPoolRegistry(poolRegistry.address);
  await tx1.wait();
  console.log("PSR pool registry set");

  try{
    const AccessControlManager = await ethers.getContract("AccessControlManager");
    const updateConfigSig = "addOrUpdateDistributionConfigs(DistributionConfig[])";
    const allowedToUpdateConfig = await AccessControlManager.isAllowedToCall(deployer, updateConfigSig);
    // const allowedToUpdateConfig = await AccessControlManager.hasPermission(
    //   deployer,
    //   ethers.constants.AddressZero,
    //   "addOrUpdateDistributionConfigs(DistributionConfig[])");
    console.log("Is allowed to update config: ", allowedToUpdateConfig);

    if(!allowedToUpdateConfig){

      const txPermission  = await AccessControlManager.giveCallPermission(
        ethers.constants.AddressZero,
        updateConfigSig,
        deployer,
      );
      await txPermission.wait();

      const allowedToUpdateConfig = await AccessControlManager.isAllowedToCall(deployer, updateConfigSig);
      console.log("Is allowed to update config: ", allowedToUpdateConfig);
    }

    const tx2 = await psr.addOrUpdateDistributionConfigs(
      [
        {
          schema: 0,
          percentage: 10000,
          destination: deployer,
        },
        {
          schema: 1,
          percentage: 10000,
          destination: deployer,
        },
      ],     
      { gasLimit: 500000 },
    );

  await tx2.wait();

  const config0 = await psr.distributionTargets(0);
  console.log("config 0: ", config0);
  const config1 = await psr.distributionTargets(1);
  console.log("config 1: ", config1);
}
catch(error){
  console.error(error);
}
console.log("PSR distribution configs added");

//   if (live) {
//     const tx = await psr.transferOwnership(timelockAddress);
//     await tx.wait();
//     console.log("Transferred ownership of PSR to Timelock");
//   }
};

func.tags = ["ProtocolShareReserve"];

export default func;