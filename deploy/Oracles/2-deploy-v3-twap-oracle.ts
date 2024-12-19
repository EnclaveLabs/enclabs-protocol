import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import { ADDRESSES, SEQUENCER } from "../../helpers/deploymentConfigOracle";

const func: DeployFunction = async function ({
  getChainId,
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let accessControlManager;
  // if (!network.live) {
  //   await deploy("AccessControlManager", {
  //     from: deployer,
  //     args: [],
  //     log: true,
  //     autoMine: true,
  //   });

  //   accessControlManager = await hre.ethers.getContract("AccessControlManager");
  // }

  // let vai;
  // if (!network.live) {
  //   await deploy("VAI", {
  //     from: deployer,
  //     log: true,
  //     autoMine: true,
  //     args: [await getChainId()],
  //   });

  //   vai = await hre.ethers.getContract("VAI");
  // }
  accessControlManager = await hre.ethers.getContract("AccessControlManager");
  console.log(ADDRESSES[network.name].acm, accessControlManager?.address, ADDRESSES[network.name].timelock, deployer);
  const accessControlManagerAddress = network.live ? ADDRESSES[network.name].acm : accessControlManager?.address;
  const proxyOwnerAddress = network.live ? ADDRESSES[network.name].timelock : deployer;
  const vbnbAddress = network.live ? ADDRESSES[network.name].vBNBAddress : deployer;
  const timelock = network.live ? ADDRESSES[network.name].timelock : deployer;
  const wethAddress = network.live ? ADDRESSES[network.name].WETHAddress : deployer;
  const uniswapV3Factory = network.live ? ADDRESSES[network.name].UniswapV3Factory : deployer;
  const resilientOracle = await ethers.getContract("ResilientOracle");

  const defaultProxyAdmin = await hre.artifacts.readArtifact(
    "hardhat-deploy/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
  );

  await deploy("UniswapV3Oracle", {
    contract: network.live ? "UniswapV3Oracle" : "MockUniswapV3Oracle",
    from: deployer,
    log: true,
    deterministicDeployment: false,
    args: network.live ? [uniswapV3Factory, resilientOracle.address] : [uniswapV3Factory, resilientOracle.address],
    proxy: {
      owner: proxyOwnerAddress,
      proxyContract: "OptimizedTransparentProxy",
      execute: {
        methodName: "initialize",
        args: network.live ? [accessControlManagerAddress] : [],
      },
    },
  });
  const v3TwapOracle = await hre.ethers.getContract("UniswapV3Oracle");
  const v3TwapOracleOwner = await v3TwapOracle.owner();
  await accessControlManager?.giveCallPermission(v3TwapOracle.address, "setTokenConfig(TokenConfig)", deployer);
  
  if (v3TwapOracleOwner === deployer) {
    await v3TwapOracle.transferOwnership(timelock);
    console.log(`Ownership of v3TwapOracle transfered from deployer to Timelock (${timelock})`);
  }


 

  // if (resilientOracleOwner === deployer) {
  //   await resilientOracle.transferOwnership(timelock);
  //   console.log(`Ownership of ResilientOracle transfered from deployer to Timelock (${timelock})`);
  // }

  // if (chainlinkOracleOwner === deployer) {
  //   await chainlinkOracle.transferOwnership(timelock);
  //   console.log(`Ownership of ChainlinkOracle transfered from deployer to Timelock (${timelock})`);
  // }

  // if (boundValidatorOwner === deployer) {
  //   await boundValidator.transferOwnership(timelock);
  //   console.log(`Ownership of BoundValidator transfered from deployer to Timelock (${timelock})`);
  // }
};

export default func;
func.tags = ["deploy-v3-twap-oracle"];
