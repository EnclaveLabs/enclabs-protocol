import hre, { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { AddressOne, multisigs } from "../../helpers/utils";

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
  //const timelockAddress = (await ethers.getContractOrNull("NormalTimelock"))?.address || multisigs[name];
  const timelockAddress = deployer; //TOFIX deployer
  const acmAddress = (await ethers.getContractOrNull("AccessControlManager"))?.address || AddressOne;
  const loopsLimit = 20;

  const defaultProxyAdmin = await hre.artifacts.readArtifact(
    "hardhat-deploy/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
  );
console.log(deployer);
  await deploy("ProtocolShareReserve", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    args: [comptrollerAddress, WBNBAddress, vBNBAddress],
    skipIfAlreadyDeployed: true,
    proxy: {
      owner:  deployer,
      proxyContract: "OptimizedTransparentUpgradeableProxy",
      execute: {
        methodName: "initialize",
        args: [acmAddress, loopsLimit],
      },
      // viaAdminContract: {
      //   name: "DefaultProxyAdmin",
      //   artifact: defaultProxyAdmin,
      // },
    },
  });


  const psr = await hre.ethers.getContract("ProtocolShareReserve");
  const poolRegistry = await ethers.getContract("PoolRegistry");
  const tx1 = await psr.setPoolRegistry(poolRegistry.address);
  await tx1.wait();

  const tx2 = await psr.addOrUpdateDistributionConfigs([
    {
      schema: 0,
      destination: deployer,
      percentage: 10000,
    },
    {
      schema: 1,
      destination: deployer,
      percentage: 10000,
    },
   
]);
await tx2.wait();


//   if (live) {
//     const tx = await psr.transferOwnership(timelockAddress);
//     await tx.wait();
//     console.log("Transferred ownership of PSR to Timelock");
//   }
};

func.tags = ["ProtocolShareReserve"];

export default func;