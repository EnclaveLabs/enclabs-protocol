import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import { ADDRESSES, SEQUENCER } from "../../helpers/deploymentConfigOracle";

const func: DeployFunction = async function ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const proxyOwnerAddress = network.live ? ADDRESSES[network.name].timelock : deployer;
  const defaultProxyAdmin = await hre.artifacts.readArtifact(
    "hardhat-deploy/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
  );
  const resilientOracle = await ethers.getContract("ResilientOracle");
  const sequencer = SEQUENCER[network.name];
  let contractName = "OneJumpOracleV2";
  

  await deploy("OneJumpOracleV2", {
    contract: network.live ? contractName : "MockPendlePtOracle",
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
    args:   [resilientOracle.address],
    proxy: {
      owner: proxyOwnerAddress,
      proxyContract: "OptimizedTransparentUpgradeableProxy",
      execute: {
        methodName: "initialize",
        args: network.live ? [ADDRESSES[network.name].acm] : [],
      },
      viaAdminContract: {
        name: "DefaultProxyAdmin",
        artifact: defaultProxyAdmin,
      },
    },
  });
  const OneJumpOracleV2 = await hre.ethers.getContract("OneJumpOracleV2");
  let accessControlManager;
  accessControlManager = await hre.ethers.getContract("AccessControlManager");
  await accessControlManager?.giveCallPermission(OneJumpOracleV2.address, "setTokenConfig(TokenConfig)", deployer);
  // const pendlePtOracle = await hre.ethers.getContract("PendlePtOracle");
  // const pendlePtOracleOwner = await pendlePtOracle.owner();

  // if (pendlePtOracleOwner === deployer && network.live) {
  //   await pendlePtOracle.transferOwnership(proxyOwnerAddress);
  //   console.log(`Ownership of pendlePtOracle transfered from deployer to Timelock (${proxyOwnerAddress})`);
  // }
};

func.tags = ["deploy-onejumpv2"];
func.skip = async env => !env.network.live;
export default func;
