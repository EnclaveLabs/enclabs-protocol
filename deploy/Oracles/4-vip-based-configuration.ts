import { AccessControlManager } from "@venusprotocol/governance-contracts/dist/typechain";
import { BigNumberish } from "ethers";
import { defaultAbiCoder, parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  ADDRESSES,
  ANY_CONTRACT,
  AccessControlEntry,
  Oracles,
  assets,
  getOraclesData,
} from "../../helpers/deploymentConfigOracle";
import { deploy } from "@openzeppelin/hardhat-upgrades/dist/utils";

interface GovernanceCommand {
  contract: string;
  signature: string;
  argTypes: string[];
  parameters: any[];
  value: BigNumberish;
}

const configurePriceFeeds = async (hre: HardhatRuntimeEnvironment): Promise<GovernanceCommand[]> => {
  const networkName = hre.network.name;

  const resilientOracle = await hre.ethers.getContract("ResilientOracle");
  //const binanceOracle = await hre.ethers.getContractOrNull("BinanceOracle");
  const pendlePTOracle = await hre.ethers.getContractOrNull("PendlePtOracle");
  const twapOracle = await hre.ethers.getContractOrNull("TwapOracle");
  const uniswapV3Oracle = await hre.ethers.getContractOrNull("UniswapV3Oracle");
  const chainlinkOracle = await hre.ethers.getContractOrNull("ChainlinkOracleSequencer"); //SequencerChainlinkOracle or ChainlinkOracle depending of L1 or L2
  const oneJumpOracle = await hre.ethers.getContractOrNull("OneJumpOracleV2");
  const oraclesData: Oracles = await getOraclesData();
  const commands: GovernanceCommand[] = [];

  for (const asset of assets[networkName]) {
    const { oracle } = asset;
    console.log(`Adding commands for configuring ${asset.token}`);
    console.log(`Adding a command to configure ${oracle} oracle for ${asset.token}`);

    const { getTokenConfig, getDirectPriceConfig } = oraclesData[oracle];

    if (
      oraclesData[oracle].underlyingOracle.address === chainlinkOracle?.address &&
      getDirectPriceConfig !== undefined
    ) {
      const assetConfig: any = getDirectPriceConfig(asset);
      commands.push({
        contract: oraclesData[oracle].underlyingOracle.address,
        signature: "setDirectPrice(address,uint256)",
        argTypes: ["address", "uint256"],
        value: 0,
        parameters: [assetConfig.asset, assetConfig.price],
      });
    }

    if (oraclesData[oracle].underlyingOracle.address === chainlinkOracle?.address  && getTokenConfig !== undefined &&
      getDirectPriceConfig === undefined) {
      const tokenConfig: any = getTokenConfig(asset, networkName);
      commands.push({
        contract: oraclesData[oracle].underlyingOracle.address,
        signature: "setTokenConfig((address,address,uint256))",
        argTypes: ["tuple(address,address,uint256)"],
        value: 0,
        parameters: [[tokenConfig.asset, tokenConfig.feed, tokenConfig.maxStalePeriod]],
      });
    }
    if (oraclesData[oracle].underlyingOracle.address === oneJumpOracle?.address && getTokenConfig !== undefined) {
      const tokenConfig: any = getTokenConfig(asset, networkName);
      commands.push({
        contract: oraclesData[oracle].underlyingOracle.address,
        signature: "setTokenConfig((address,address,address,uint256))",
        argTypes: ["tuple(address,address,address,uint256)"],
        value: 0,
        parameters: [[tokenConfig.asset, tokenConfig.feed, tokenConfig.underlyingAsset ,tokenConfig.maxStalePeriod]],
      });
    }
    // if (oraclesData[oracle].underlyingOracle.address !== pendlePTOracle?.address && getTokenConfig !== undefined ) {
    //   const tokenConfig: any = getTokenConfig(asset, networkName);
    //   commands.push({
    //     contract: oraclesData[oracle].underlyingOracle.address,
    //     signature: "setTokenConfig((address,address,address))",
    //     argTypes: ["tuple(address,address,address)"],
    //     value: 0,
    //     parameters: [[tokenConfig.asset, tokenConfig.market, tokenConfig.underlyingToken]],
    //   });
    // }
    if (oraclesData[oracle].underlyingOracle.address === pendlePTOracle?.address && getTokenConfig !== undefined) {
      const tokenConfig: any = getTokenConfig(asset, networkName);
      commands.push({
        contract: oraclesData[oracle].underlyingOracle.address,
        signature: "setTokenConfig((address,address,address))",
        argTypes: ["tuple(address,address,address)"],
        value: 0,
        parameters: [[tokenConfig.asset, tokenConfig.market, tokenConfig.underlyingToken]],
      });
    }

    if (oraclesData[oracle].underlyingOracle.address === twapOracle?.address && getTokenConfig !== undefined) {
      const tokenConfig: any = getTokenConfig(asset, networkName);
      commands.push({
        contract: oraclesData[oracle].underlyingOracle.address,
        signature: "setTokenConfig((address,uint256,address,bool,bool,uint256))",
        argTypes: ["tuple(address,uint256,address,bool,bool,uint256)"],
        value: 0,
        parameters: [[tokenConfig.asset, tokenConfig.baseUnit, tokenConfig.uniswapPool, tokenConfig.isEthBased, tokenConfig.isReversedPool, tokenConfig.anchorPeriod]],
      });
    }

    if (oraclesData[oracle].underlyingOracle.address === uniswapV3Oracle?.address && getTokenConfig !== undefined) {
      const tokenConfig: any = getTokenConfig(asset, networkName);
      commands.push({
        contract: oraclesData[oracle].underlyingOracle.address,
        signature: "setTokenConfig((address,address,uint24,uint32,address,address,address))",
        argTypes: ["tuple(address,address,uint24,uint32,address,address,address)"],
        value: 0,
        parameters: [[tokenConfig.tokenA, tokenConfig.tokenB, tokenConfig.fee, tokenConfig.twapWindow, tokenConfig.baseToken, tokenConfig.quoteToken, tokenConfig.pool]],
      });
    }

    const { getStalePeriodConfig } = oraclesData[oracle];
    // if (oraclesData[oracle].underlyingOracle.address === binanceOracle?.address && getStalePeriodConfig !== undefined) {
    //   const tokenConfig: any = getStalePeriodConfig(asset);

    //   commands.push({
    //     contract: oraclesData[oracle].underlyingOracle.address,
    //     signature: "setMaxStalePeriod(string,uint256)",
    //     value: 0,
    //     parameters: [tokenConfig],
    //   });
    // }

    console.log(``);
    console.log(`Adding a command to configure resilient oracle for ${asset.token}`);
    commands.push({
      contract: resilientOracle.address,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      argTypes: ["tuple(address,address[3],bool[3])"],
      value: 0,
      parameters: [[asset.address, oraclesData[oracle].oracles, oraclesData[oracle].enableFlagsForOracles]],
    });
  }
  return commands;
};

const acceptOwnership = async (
  contractName: string,
  targetOwner: string,
  hre: HardhatRuntimeEnvironment,
): Promise<GovernanceCommand[]> => {
  if (!hre.network.live) {
    return [];
  }
  const abi = ["function owner() view returns (address)"];
  let deployment;
  try {
    deployment = await hre.deployments.get(contractName);
  } catch (error: any) {
    if (error.message.includes("No deployment found for")) {
      return [];
    }
    throw error;
  }
  const contract = await ethers.getContractAt(abi, deployment.address);
  if ((await contract.owner()) === targetOwner) {
    return [];
  }
  console.log(`Adding a command to accept the admin rights over ${contractName}`);
  return [
    {
      contract: deployment.address,
      signature: "acceptOwnership()",
      argTypes: [],
      parameters: [],
      value: 0,
    },
  ];
};

const makeRole = (mainnetBehavior: boolean, targetContract: string, method: string): string => {
  if (mainnetBehavior && targetContract === ethers.constants.AddressZero) {
    return ethers.utils.keccak256(
      ethers.utils.solidityPack(["bytes32", "string"], [ethers.constants.HashZero, method]),
    );
  }
  return ethers.utils.keccak256(ethers.utils.solidityPack(["address", "string"], [targetContract, method]));
};

const hasPermission = async (
  accessControl: AccessControlManager,
  targetContract: string,
  method: string,
  caller: string,
  hre: HardhatRuntimeEnvironment,
): Promise<boolean> => {
  const role = makeRole(hre.network.name === "bscmainnet", targetContract, method);
  return accessControl.hasRole(role, caller);
};

const timelockOraclePermissions = (timelock: string): AccessControlEntry[] => {
  const methods = [
    "pause()",
    "unpause()",
    "setOracle(address,address,uint8)",
    "enableOracle(address,uint8,bool)",
    "setTokenConfig(TokenConfig)",
    "setDirectPrice(address,uint256)",
    "setValidateConfig(ValidateConfig)",
    "setMaxStalePeriod(string,uint256)",
    "setSymbolOverride(string,string)",
    "setUnderlyingPythOracle(address)",
  ];
  return methods.map(method => ({
    caller: timelock,
    target: ANY_CONTRACT,
    method,
  }));
};

const configureAccessControls = async (hre: HardhatRuntimeEnvironment): Promise<GovernanceCommand[]> => {
  const networkName = hre.network.name;
  const accessControlManagerAddress = ADDRESSES[networkName].acm;

  //const accessControlConfig: AccessControlEntry[] = timelockOraclePermissions(ADDRESSES[networkName].timelock);
  const accessControlConfig: AccessControlEntry[] = timelockOraclePermissions("0x705A1AC9c9e57cc78993Ab8c0C8AAeb75657e02a"); //tofix
  const accessControlManager = await ethers.getContractAt<AccessControlManager>(
    "AccessControlManager",
    accessControlManagerAddress,
  );
  const commands = await Promise.all(
    accessControlConfig.map(async (entry: AccessControlEntry) => {
      const { caller, target, method } = entry;
      if (await hasPermission(accessControlManager, caller, method, target, hre)) {
        return [];
      }
      return [
        {
          contract: accessControlManagerAddress,
          signature: "giveCallPermission(address,string,address)",
          argTypes: ["address", "string", "address"],
          parameters: [target, method, caller],
          value: 0,
        },
      ];
    }),
  );
  return commands.flat();
};
const logCommand = (prefix: string, command: GovernanceCommand) => {
  const valueStr = command.value == 0 ? "" : "{ value: " + parseEther(command.value.toString()) + " }";
  console.log(`${prefix} ${command.contract}.${command.signature}${valueStr} (`);
  command.parameters.forEach((param: any) => console.log(`  ${param},`));
  console.log(")");
};
const executeCommands = async (commands: GovernanceCommand[], hre: HardhatRuntimeEnvironment) => {
  for (const command of commands) {
    logCommand("Executing", command);
    const methodId = ethers.utils.id(command.signature).substring(0, 10);
    const encodedArgs = defaultAbiCoder.encode(command.argTypes, command.parameters);
    const txdata = methodId + encodedArgs.substring(2);
    const { deployer } = await hre.getNamedAccounts();
    const signer = await ethers.getSigner(deployer);
    const tx = await signer.sendTransaction({
      to: command.contract,
      data: txdata,
      value: command.value,
    });
    await tx.wait();
  }
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  //const owner = ADDRESSES[hre.network.name].timelock;
  const owner = "0x705A1AC9c9e57cc78993Ab8c0C8AAeb75657e02a"; //tofix
  console.log(`owner: ${owner}`);
  const commands = [
    //...(await configureAccessControls(hre)),
    // ...(await acceptOwnership("ResilientOracle", owner, hre)),
    // ...(await acceptOwnership("ChainlinkOracle", owner, hre)),
    // ...(await acceptOwnership("RedStoneOracle", owner, hre)),
    // ...(await acceptOwnership("BoundValidator", owner, hre)),
    // ...(await acceptOwnership("BinanceOracle", owner, hre)),
    // ...(await acceptOwnership("PendlePtOracle", owner, hre)),
    // ...(await acceptOwnership("TwapOracle", owner, hre)),
    // ...(await acceptOwnership("UniswapV3Oracle", owner, hre)),
    ...(await configurePriceFeeds(hre)),
  ];

  // if (hre.network.live) {
  //   console.log("Please propose a VIP with the following commands:");
  //   console.log(
  //     JSON.stringify(commands.map(c => ({ target: c.contract, signature: c.signature, params: c.parameters }))),
  //   );
  // } else {
  //   throw Error("This script is only used for live networks.");
  // }
  await executeCommands(commands, hre);
};

func.tags = ["VIP-Oracle"];
func.skip = async (hre: HardhatRuntimeEnvironment) => hre.network.name === "hardhat";

export default func;
