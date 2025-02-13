import { contracts as governanceArbitrumOne } from "../deployments/arbitrumone.json";
import { contracts as governanceSonic } from "../deployments/sonic.json";

import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DeploymentsExtension } from "hardhat-deploy/types";

import { convertToUnit } from "./utils";

export type NetworkConfig = {
  arbitrumone: DeploymentConfig;
  sonic: DeploymentConfig;
};

export type PreconfiguredAddresses = { [contract: string]: string };

export type DeploymentConfig = {
  tokensConfig: TokenConfig[];
  poolConfig: PoolConfig[];
  accessControlConfig: AccessControlEntry[];
  preconfiguredAddresses: PreconfiguredAddresses;
};

export type DeploymentInfo = {
  isTimeBased: boolean;
  blocksPerYear: number;
};

type BidderDeploymentValues = {
  waitForFirstBidder: number;
  nextBidderBlockOrTimestampLimit: number;
};

export type TokenConfig = {
  isMock: boolean;
  name?: string;
  symbol: string;
  decimals?: number;
  tokenAddress: string;
  faucetInitialLiquidity?: boolean;
};

export type PoolConfig = {
  id: string;
  name: string;
  closeFactor: string;
  liquidationIncentive: string;
  minLiquidatableCollateral: string;
  vtokens: VTokenConfig[];
  rewards?: RewardConfig[];
};

// NOTE: markets, supplySpeeds, borrowSpeeds array sizes should match
export type RewardConfig = {
  asset: string;
  markets: string[]; // underlying asset symbol of a the e.g ["BNX","CAKE"]
  supplySpeeds: string[];
  borrowSpeeds: string[];
};

export type SpeedConfig = {
  borrowSpeed: string;
  supplySpeed: string;
};

export type VTokenConfig = {
  name: string;
  symbol: string;
  asset: string; // This should match a name property from a TokenCofig
  rateModel: string;
  baseRatePerYear: string;
  multiplierPerYear: string;
  jumpMultiplierPerYear: string;
  kink_: string;
  collateralFactor: string;
  liquidationThreshold: string;
  reserveFactor: string;
  initialSupply: string;
  supplyCap: string;
  borrowCap: string;
  vTokenReceiver: string;
  reduceReservesBlockDelta: string;
};

export type AccessControlEntry = {
  caller: string;
  target: string;
  method: string;
};

export enum InterestRateModels {
  WhitePaper,
  JumpRate,
}

const ANY_CONTRACT = ethers.constants.AddressZero;

export const BSC_BLOCKS_PER_YEAR = 10_512_000; // assuming a block is mined every 3 seconds
export const ETH_BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds
export const OPBNB_BLOCKS_PER_YEAR = 31_536_000; // assuming a block is mined every 1 seconds
export const SECONDS_PER_YEAR = 31_536_000; // seconds per year

export type BlocksPerYear = {
  [key: string]: number;
};

export const blocksPerYear: BlocksPerYear = {
  arbitrumone: 0, // for time based contracts
  sonic: 0, // for time based contracts
  isTimeBased: 0, // for time based contracts
};


export const ARBITRUM_ONE_MULTISIG = "0x705A1AC9c9e57cc78993Ab8c0C8AAeb75657e02a";
export const SONIC_MULTISIG = "0xfC48EE59b365028DcC533750754330C18d359e27";

const REDUCE_RESERVES_BLOCK_DELTA_ARBITRUM_ONE = "86400";
const REDUCE_RESERVES_BLOCK_DELTA_SONIC = "86400";

export const preconfiguredAddresses = {
  arbitrumone: {
    VTreasury: '0xD0050d4D0611D78C44A62183fba542161CEC11D2', //treasury
    //NormalTimelock: ARBITRUM_ONE_MULTISIG,
    FastTrackTimelock: ARBITRUM_ONE_MULTISIG,
    CriticalTimelock: ARBITRUM_ONE_MULTISIG,
    NormalTimelock: governanceArbitrumOne.NormalTimelock.address,
    // FastTrackTimelock: governanceArbitrumOne.FastTrackTimelock.address,
    // CriticalTimelock: governanceArbitrumOne.CriticalTimelock.address,
    AccessControlManager: governanceArbitrumOne.AccessControlManager.address,
  },
  sonic: {
    VTreasury: '0x172bC36d3f092453cE6F3F9B30F1d6Ac365C4FfD', //treasury
    //NormalTimelock: ARBITRUM_ONE_MULTISIG,
    FastTrackTimelock: governanceSonic.CriticalTimelock.address,
    CriticalTimelock: governanceSonic.CriticalTimelock.address,
    NormalTimelock: governanceSonic.NormalTimelock.address,
    // FastTrackTimelock: governanceArbitrumOne.FastTrackTimelock.address,
    // CriticalTimelock: governanceArbitrumOne.CriticalTimelock.address,
    AccessControlManager: governanceSonic.AccessControlManager.address,
  },
};

const poolRegistryPermissions = (): AccessControlEntry[] => {
  const methods = [
    // "setCollateralFactor(address,uint256,uint256)",
    // "setMarketSupplyCaps(address[],uint256[])",
    // "setMarketBorrowCaps(address[],uint256[])",
    // "setLiquidationIncentive(uint256)",
    // "setCloseFactor(uint256)",
    // "setMinLiquidatableCollateral(uint256)",
    // "supportMarket(address)",
  ];
  return methods.map(method => ({
    caller: "PoolRegistry",
    target: ANY_CONTRACT,
    method,
  }));
};

const deployerPermissions = (): AccessControlEntry[] => {
  const methods = [
    // "swapPoolsAssets(address[],uint256[],address[][])",
    // "addPool(string,address,uint256,uint256,uint256)",
    // "addMarket(AddMarketInput)",
    // "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    // "setReduceReservesBlockDelta(uint256)",
    // "setMarketBorrowCaps(address[],uint256[])",
    // "setMarketSupplyCaps(address[],uint256[])",
    // "setPoolName(address,string)",
    // "updatePoolMetadata(address,VenusPoolMetaData)",
    // "setProtocolSeizeShare(uint256)",
  ];
  return methods.map(method => ({
    caller: "account:deployer",
    target: ANY_CONTRACT,
    method,
  }));
};

const normalTimelockPermissions = (timelock: string): AccessControlEntry[] => {
  const methods = [
    // "setCloseFactor(uint256)",
    // "setReduceReservesBlockDelta(uint256)",
    // "setCollateralFactor(address,uint256,uint256)",
    // "setLiquidationIncentive(uint256)",
    // "setMarketBorrowCaps(address[],uint256[])",
    // "setMarketSupplyCaps(address[],uint256[])",
    // "setActionsPaused(address[],uint256[],bool)",
    // "setMinLiquidatableCollateral(uint256)",
    // "addPool(string,address,uint256,uint256,uint256)",
    // "addMarket(AddMarketInput)",
    // "setPoolName(address,string)",
    // "updatePoolMetadata(address,VenusPoolMetaData)",
    // "setProtocolSeizeShare(uint256)",
    // "setReserveFactor(uint256)",
    // "setInterestRateModel(address)",
    // "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    // "setLastRewardingBlock(address[],uint32[],uint32[])",
    // "updateJumpRateModel(uint256,uint256,uint256,uint256)",
  ];
  return methods.map(method => ({
    caller: timelock,
    target: ANY_CONTRACT,
    method,
  }));
};

const fastTrackTimelockPermissions = (timelock: string): AccessControlEntry[] => {
  const methods = [
    "setCollateralFactor(address,uint256,uint256)",
    "setMarketBorrowCaps(address[],uint256[])",
    "setMarketSupplyCaps(address[],uint256[])",
    "setActionsPaused(address[],uint256[],bool)",
  ];
  return methods.map(method => ({
    caller: timelock,
    target: ANY_CONTRACT,
    method,
  }));
};

const criticalTimelockPermissions = fastTrackTimelockPermissions;

export const globalConfig: NetworkConfig = {
  
  sonic: {
    tokensConfig: [
     
      {
        isMock: false,
        name: "Wrapped Sonic",
        symbol: "wS",
        decimals: 18,
        tokenAddress: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
      },
      {
        isMock: false,
        name: "Beets Staked Sonic",
        symbol: "stS",
        decimals: 18,
        tokenAddress: "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955",
      },
      {
        isMock: false,
        name: "Bridged USDC",
        symbol: "USDCe",
        decimals: 6,
        tokenAddress: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
      },
      {
        isMock: false,
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        tokenAddress: "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b",
      },
      {
        isMock: false,
        name: "Wrapped Origin Sonic",
        symbol: "wOS",
        decimals: 18,
        tokenAddress: "0x9F0dF7799f6FDAd409300080cfF680f5A23df4b1",
      },
      {
        isMock: false,
        name: "Sonic USD",
        symbol: "scUSD",
        decimals: 6,
        tokenAddress: "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE",
      },
      {
        isMock: false,
        name: "Principal Token: sw-wstkscUSD-1751241607",
        symbol: "PT-sw-wstkscUSD-1751241607",
        decimals: 6,
        tokenAddress: "0x7002383d2305b8f3b2b7786f50c13d132a22076d",
      },
     
      
    ],
    poolConfig: [
      {
        id: "Core Sonic",
        name: "Core Sonic",
        closeFactor: convertToUnit("0.5", 18),
        liquidationIncentive: convertToUnit("1.1", 18),
        minLiquidatableCollateral: convertToUnit("100", 18),
        vtokens: [
          {
            name: "Enclabs Beets Staked Sonic (Core)",
            asset: "stS",
            symbol: "vstS_Core",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.18", 18),
            jumpMultiplierPerYear: convertToUnit("2", 18),
            kink_: convertToUnit("0.65", 18),
            collateralFactor: convertToUnit("0.7", 18),
            liquidationThreshold: convertToUnit("0.78", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("10", 18), // 10sts
            supplyCap: convertToUnit("500000", 18),
            borrowCap: convertToUnit("500000", 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_SONIC,
            vTokenReceiver: preconfiguredAddresses.sonic.VTreasury,
          },
          {
            name: "Enclabs WETH (Core)",
            asset: "WETH",
            symbol: "vWETH_Core",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.085", 18),
            jumpMultiplierPerYear: convertToUnit("2.5", 18),
            kink_: convertToUnit("0.6", 18),
            collateralFactor: convertToUnit("0.8", 18),
            liquidationThreshold: convertToUnit("0.85", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("0.001", 18), 
            supplyCap: convertToUnit("100", 18),
            borrowCap: convertToUnit("100000", 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_SONIC,
            vTokenReceiver: preconfiguredAddresses.sonic.VTreasury,
          },
          {
            name: "Enclabs USDC bridged (Core)",
            asset: "USDCe",
            symbol: "vUSDCe_Core",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.12", 18),
            jumpMultiplierPerYear: convertToUnit("2.5", 18),
            kink_: convertToUnit("0.6", 18),
            collateralFactor: convertToUnit("0.80", 18),
            liquidationThreshold: convertToUnit("0.85", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("5", 6), // 5,000 USDC
            supplyCap: convertToUnit("300000", 6),
            borrowCap: convertToUnit("5000000", 6),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_SONIC,
            vTokenReceiver: preconfiguredAddresses.sonic.VTreasury,
          },
          {
            name: "Enclabs wrapped S (Core)",
            asset: "wS",
            symbol: "vwS_Core",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.12", 18),
            jumpMultiplierPerYear: convertToUnit("2.5", 18),
            kink_: convertToUnit("0.8", 18),
            collateralFactor: convertToUnit("0.78", 18),
            liquidationThreshold: convertToUnit("0.80", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("5", 18), // 5s
            supplyCap: convertToUnit("500000", 18),
            borrowCap: convertToUnit("5000000", 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_SONIC,
            vTokenReceiver: preconfiguredAddresses.sonic.VTreasury,
          },
          
        ],
        rewards: [
          // XVS Rewards Over 90 days (7776000 seconds)
          // WETH:    510 XVS for Suppliers
          //          765 XVS for Borrowers
          // WBTC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDT:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // ARB:     510 XVS for Suppliers
          //          765 XVS for Borrowers
          // {
          //   asset: "USDT",
          //   markets: ["WETH", "USDT", "USDC"],
          //   supplySpeeds: ["655864197530", "1311728395061", "1311728395061"], //careful with decimals
          //   borrowSpeeds: ["983796296296", "1967592592592", "1967592592592"],
          // },
        ],
      },
      {
        id: "LiquidStakedS",
        name: "Liquid Staked S",
        closeFactor: convertToUnit("0.5", 18),
        liquidationIncentive: convertToUnit("1.03", 18),
        minLiquidatableCollateral: convertToUnit("100", 18),
        vtokens: [
          
          {
            name: "Enclabs wrapped S (Liquid Staked S)",
            asset: "wS",
            symbol: "vWS_LiquidStakedS",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: convertToUnit("0.02", 18),
            multiplierPerYear: convertToUnit("0.15", 18),
            jumpMultiplierPerYear: convertToUnit("3.5", 18),
            kink_: convertToUnit("0.85", 18),
            collateralFactor: convertToUnit("0.92", 18),
            liquidationThreshold: convertToUnit("0.95", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("5", 18), 
            supplyCap: convertToUnit("1000000", 18),
            borrowCap: convertToUnit("1000000", 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_SONIC,
            vTokenReceiver: preconfiguredAddresses.sonic.VTreasury,
          },
          {
            name: "Enclabs USDC bridged (Liquid Staked S)",
            asset: "USDCe",
            symbol: "vUSDCe_LiquidStakedS",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: convertToUnit("0.04", 18),
            multiplierPerYear: convertToUnit("0.25", 18),
            jumpMultiplierPerYear: convertToUnit("2.5", 18),
            kink_: convertToUnit("0.8", 18),
            collateralFactor: convertToUnit("0.80", 18),
            liquidationThreshold: convertToUnit("0.85", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("5", 6), // 5,000 USDC
            supplyCap: convertToUnit("500000", 6),
            borrowCap: convertToUnit("500000", 6),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_SONIC,
            vTokenReceiver: preconfiguredAddresses.sonic.VTreasury,
          },
          {
            name: "Enclabs wrapped Origin Sonic (Liquid Staked S)",
            asset: "wOS",
            symbol: "vwOS_LiquidStakedS",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: convertToUnit("0", 18),
            multiplierPerYear: convertToUnit("0.15", 18),
            jumpMultiplierPerYear: convertToUnit("3.5", 18),
            kink_: convertToUnit("0.85", 18),
            collateralFactor: convertToUnit("0.92", 18),
            liquidationThreshold: convertToUnit("0.95", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("5", 18), // 5s
            supplyCap: convertToUnit("1000000", 18),
            borrowCap: convertToUnit("0", 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_SONIC,
            vTokenReceiver: preconfiguredAddresses.sonic.VTreasury,
          },
          
        ],
        rewards: [
          // XVS Rewards Over 90 days (7776000 seconds)
          // WETH:    510 XVS for Suppliers
          //          765 XVS for Borrowers
          // WBTC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDT:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // ARB:     510 XVS for Suppliers
          //          765 XVS for Borrowers
          // {
          //   asset: "USDT",
          //   markets: ["WETH", "USDT", "USDC"],
          //   supplySpeeds: ["655864197530", "1311728395061", "1311728395061"], //careful with decimals
          //   borrowSpeeds: ["983796296296", "1967592592592", "1967592592592"],
          // },
        ],
      },
      {
        id: "SpectraPTscUSDPool",
        name: "Spectra PT scUSD Pool",
        closeFactor: convertToUnit("0.5", 18),
        liquidationIncentive: convertToUnit("1.1", 18),
        minLiquidatableCollateral: convertToUnit("100", 18),
        vtokens: [
          
          {
            name: "Enclabs wrapped scUSD (SpectraPTscUSDPool)",
            asset: "scUSD",
            symbol: "vscUSD_SpectraPTscUSDPool",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: convertToUnit("0.01", 18),
            multiplierPerYear: convertToUnit("0.05", 18),
            jumpMultiplierPerYear: convertToUnit("3.5", 18),
            kink_: convertToUnit("0.85", 18),
            collateralFactor: convertToUnit("0.8", 18),
            liquidationThreshold: convertToUnit("0.85", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("5", 6), // 5,000 scUSD
            supplyCap: convertToUnit("1000000", 6),
            borrowCap: convertToUnit("1000000", 6),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_SONIC,
            vTokenReceiver: preconfiguredAddresses.sonic.VTreasury,
          },
          {
            name: "Enclabs PT-wstkscUSD Spectra June (SpectraPTscUSDPool)",
            asset: "PT-sw-wstkscUSD-1751241607",
            symbol: "vPT-sw-wstkscUSD-1751241607_SpectraPTscUSDPool",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: convertToUnit("0.00", 18),
            multiplierPerYear: convertToUnit("0.25", 18),
            jumpMultiplierPerYear: convertToUnit("2.5", 18),
            kink_: convertToUnit("0.8", 18),
            collateralFactor: convertToUnit("0", 18),
            liquidationThreshold: convertToUnit("0.1", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("5", 6), // ~5PT
            supplyCap: convertToUnit("1000000", 6),
            borrowCap: convertToUnit("0", 6),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_SONIC,
            vTokenReceiver: preconfiguredAddresses.sonic.VTreasury,
          },
          
        ],
        rewards: [
          // XVS Rewards Over 90 days (7776000 seconds)
          // WETH:    510 XVS for Suppliers
          //          765 XVS for Borrowers
          // WBTC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDT:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // ARB:     510 XVS for Suppliers
          //          765 XVS for Borrowers
          // {
          //   asset: "USDT",
          //   markets: ["WETH", "USDT", "USDC"],
          //   supplySpeeds: ["655864197530", "1311728395061", "1311728395061"], //careful with decimals
          //   borrowSpeeds: ["983796296296", "1967592592592", "1967592592592"],
          // },
        ],
      },
      
    ],
    accessControlConfig: [
      ...poolRegistryPermissions(),
      ...normalTimelockPermissions(preconfiguredAddresses.sonic.NormalTimelock),
      ...deployerPermissions(),
      ...fastTrackTimelockPermissions(preconfiguredAddresses.sonic.FastTrackTimelock),
    ],
    preconfiguredAddresses: preconfiguredAddresses.sonic,
  },
  
  
  
  
  arbitrumone: {
    tokensConfig: [
     
      {
        isMock: false,
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        tokenAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      },
      {
        isMock: false,
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        tokenAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      },
      {
        isMock: false,
        name: "Tether USD",
        symbol: "USDT",
        decimals: 6,
        tokenAddress: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
      },
      {
        isMock: false,
        name: "Arbitrum",
        symbol: "ARB",
        decimals: 18,
        tokenAddress: "0x912ce59144191c1204e64559fe8253a0e49e6548",
      },
      {
        isMock: false,
        name: "Wrapped liquid staked Ether 2.0.",
        symbol: "wstETH",
        decimals: 18,
        tokenAddress: "0x5979D7b546E38E414F7E9822514be443A4800529",
      },
      {
        isMock: false,
        name: "Wrapped eETH",
        symbol: "weETH",
        decimals: 18,
        tokenAddress: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
      },
      {
        isMock: false,
        name: "PT weETH 26JUN2025",
        symbol: "PT-weETH-26JUN2025",
        decimals: 18,
        tokenAddress: "0xb33808ea0e883138680BA29311a220A7377cdb92",
      },
      
    ],
    poolConfig: [
      {
        id: "Core",
        name: "Core",
        closeFactor: convertToUnit("0.5", 18),
        liquidationIncentive: convertToUnit("1.1", 18),
        minLiquidatableCollateral: convertToUnit("100", 18),
        vtokens: [
          
          {
            name: "Venus WETH (Core)",
            asset: "WETH",
            symbol: "vWETH_Core",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.035", 18),
            jumpMultiplierPerYear: convertToUnit("2.5", 18),
            kink_: convertToUnit("0.8", 18),
            collateralFactor: convertToUnit("0.75", 18),
            liquidationThreshold: convertToUnit("0.80", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("0.001", 18), 
            supplyCap: convertToUnit("26000", 18),
            borrowCap: convertToUnit("23500", 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_ARBITRUM_ONE,
            vTokenReceiver: preconfiguredAddresses.arbitrumone.VTreasury,
          },
          {
            name: "Venus USDC (Core)",
            asset: "USDC",
            symbol: "vUSDC_Core",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.08", 18),
            jumpMultiplierPerYear: convertToUnit("2.5", 18),
            kink_: convertToUnit("0.8", 18),
            collateralFactor: convertToUnit("0.78", 18),
            liquidationThreshold: convertToUnit("0.80", 18),
            reserveFactor: convertToUnit("0.1", 18),
            initialSupply: convertToUnit("5", 6), // 5,000 USDC
            supplyCap: convertToUnit("54000000", 6),
            borrowCap: convertToUnit("49000000", 6),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_ARBITRUM_ONE,
            vTokenReceiver: preconfiguredAddresses.arbitrumone.VTreasury,
          },
          {
            name: "Venus USDT (Core)",
            asset: "USDT",
            symbol: "vUSDT_Core",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.08", 18),
            jumpMultiplierPerYear: convertToUnit("2.5", 18),
            kink_: convertToUnit("0.8", 18),
            collateralFactor: convertToUnit("0.78", 18),
            liquidationThreshold: convertToUnit("0.80", 18),
            reserveFactor: convertToUnit("0.1", 18),
            initialSupply: convertToUnit("5", 6), // 4,999.994418 USDT
            supplyCap: convertToUnit("20000000", 6),
            borrowCap: convertToUnit("18000000", 6),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_ARBITRUM_ONE,
            vTokenReceiver: preconfiguredAddresses.arbitrumone.VTreasury,
          },
          
        ],
        rewards: [
          // XVS Rewards Over 90 days (7776000 seconds)
          // WETH:    510 XVS for Suppliers
          //          765 XVS for Borrowers
          // WBTC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDT:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // ARB:     510 XVS for Suppliers
          //          765 XVS for Borrowers
          {
            asset: "USDT",
            markets: ["WETH", "USDT", "USDC"],
            supplySpeeds: ["655864197530", "1311728395061", "1311728395061"], //careful with decimals
            borrowSpeeds: ["983796296296", "1967592592592", "1967592592592"],
          },
        ],
      },
      {
        id: "Liquid Staked ETH",
        name: "Liquid Staked ETH",
        closeFactor: convertToUnit("0.5", 18),
        liquidationIncentive: convertToUnit("1.02", 18),
        minLiquidatableCollateral: convertToUnit("100", 18),
        vtokens: [
          {
            name: "Venus wstETH (Liquid Staked ETH)",
            asset: "wstETH",
            symbol: "vwstETH_LiquidStakedETH",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.09", 18),
            jumpMultiplierPerYear: convertToUnit("3", 18),
            kink_: convertToUnit("0.45", 18),
            collateralFactor: convertToUnit("0.93", 18),
            liquidationThreshold: convertToUnit("0.95", 18),
            reserveFactor: convertToUnit("0.25", 18),
            initialSupply: convertToUnit(0.001, 18),
            supplyCap: convertToUnit(8_000, 18),
            borrowCap: convertToUnit(800, 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_ARBITRUM_ONE,
            vTokenReceiver: "0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61",
          },
          {
            name: "Venus weETH (Liquid Staked ETH)",
            asset: "weETH",
            symbol: "vweETH_LiquidStakedETH",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.09", 18),
            jumpMultiplierPerYear: convertToUnit(3, 18),
            kink_: convertToUnit("0.45", 18),
            collateralFactor: convertToUnit("0.93", 18),
            liquidationThreshold: convertToUnit("0.95", 18),
            reserveFactor: convertToUnit("0.25", 18),
            initialSupply: convertToUnit(0.001, 18),
            supplyCap: convertToUnit(4_600, 18),
            borrowCap: convertToUnit(2_300, 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_ARBITRUM_ONE,
            vTokenReceiver: "0x46cba1e9b1e5db32da28428f2fb85587bcb785e7",
          },
          {
            name: "Venus WETH (Liquid Staked ETH)",
            asset: "WETH",
            symbol: "vWETH_LiquidStakedETH",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.035", 18),
            jumpMultiplierPerYear: convertToUnit("0.8", 18),
            kink_: convertToUnit("0.8", 18),
            collateralFactor: convertToUnit("0", 18),
            liquidationThreshold: convertToUnit("0", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit(0.001, 18),
            supplyCap: convertToUnit(14_000, 18),
            borrowCap: convertToUnit(12_500, 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_ARBITRUM_ONE,
            vTokenReceiver: preconfiguredAddresses.arbitrumone.VTreasury,
          },
        ],
        rewards: [
          // XVS Rewards Over 90 days (7776000 seconds)
          // wstETH:  2550 XVS for Suppliers
          //          0 XVS for Borrowers
          // weETH:   2550 XVS for Suppliers
          //          0 XVS for Borrowers
          // WETH:    3060 XVS for Suppliers
          //          7140 XVS for Borrowers
          {
            asset: "WETH",
            markets: ["wstETH", "weETH", "WETH"],
            supplySpeeds: ["0", "0", "0"],
            borrowSpeeds: ["0", "0", "0"],
          },
        ],
      },
      {
        id: "Pendle",
        name: "Pendle",
        closeFactor: convertToUnit("0.5", 18),
        liquidationIncentive: convertToUnit("1.1", 18),
        minLiquidatableCollateral: convertToUnit("100", 18),
        vtokens: [
          
          {
            name: "Venus WETH (Pendle)",
            asset: "WETH",
            symbol: "vWETH_Pendle",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.025", 18),
            jumpMultiplierPerYear: convertToUnit("1.5", 18),
            kink_: convertToUnit("0.2", 18),
            collateralFactor: convertToUnit("0.75", 18),
            liquidationThreshold: convertToUnit("0.80", 18),
            reserveFactor: convertToUnit("0.2", 18),
            initialSupply: convertToUnit("0.001", 18), 
            supplyCap: convertToUnit("26000", 18),
            borrowCap: convertToUnit("23500", 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_ARBITRUM_ONE,
            vTokenReceiver: preconfiguredAddresses.arbitrumone.VTreasury,
          },
          {
            name: "Enclabs PT-weETH-26JUN2025 (Pendle)",
            asset: "PT-weETH-26JUN2025",
            symbol: "vPT-weETH-26JUN2025_Pendle",
            rateModel: InterestRateModels.JumpRate.toString(),
            baseRatePerYear: "0",
            multiplierPerYear: convertToUnit("0.08", 18),
            jumpMultiplierPerYear: convertToUnit("2.5", 18),
            kink_: convertToUnit("0.8", 18),
            collateralFactor: convertToUnit("0.78", 18),
            liquidationThreshold: convertToUnit("0.80", 18),
            reserveFactor: convertToUnit("0.1", 18),
            initialSupply: convertToUnit("0.001", 18), 
            supplyCap: convertToUnit("54000000", 18),
            borrowCap: convertToUnit("49000000", 18),
            reduceReservesBlockDelta: REDUCE_RESERVES_BLOCK_DELTA_ARBITRUM_ONE,
            vTokenReceiver: preconfiguredAddresses.arbitrumone.VTreasury,
          },
         
          
        ],
        rewards: [
          // XVS Rewards Over 90 days (7776000 seconds)
          // WETH:    510 XVS for Suppliers
          //          765 XVS for Borrowers
          // WBTC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDT:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // USDC:    1020 XVS for Suppliers
          //          1530 XVS for Borrowers
          // ARB:     510 XVS for Suppliers
          //          765 XVS for Borrowers
          {
            asset: "USDT",
            markets: ["WETH", "PT-weETH-26JUN2025"],
            supplySpeeds: ["0", "0"],
            borrowSpeeds: ["0", "0"],
          },
        ],
      },
    ],
    accessControlConfig: [
      ...poolRegistryPermissions(),
      ...normalTimelockPermissions(preconfiguredAddresses.arbitrumone.NormalTimelock),
      ...deployerPermissions(),
    ],
    preconfiguredAddresses: preconfiguredAddresses.arbitrumone,
  },
  
};

export async function getConfig(networkName: string): Promise<DeploymentConfig> {
  switch (networkName) {
   
    
    case "arbitrumone":
      return globalConfig.arbitrumone;
    case "sonic":
      return globalConfig.sonic;
    
    default:
      throw new Error(`config for network ${networkName} is not available.`);
  }
}

export function getTokenConfig(tokenSymbol: string, tokens: TokenConfig[]): TokenConfig {
  const tokenCofig = tokens.find(
    ({ symbol }) => symbol.toLocaleLowerCase().trim() === tokenSymbol.toLocaleLowerCase().trim(),
  );

  if (tokenCofig) {
    return tokenCofig;
  } else {
    throw Error(`Token ${tokenSymbol} is not found in the config`);
  }
}

export async function getTokenAddress(tokenConfig: TokenConfig, deployments: DeploymentsExtension) {
  if (tokenConfig.isMock) {
    const token = await deployments.get(`Mock${tokenConfig.symbol}`);
    return token.address;
  } else {
    return tokenConfig.tokenAddress;
  }
}

export function getBidderDeploymentValues(networkName: string): BidderDeploymentValues {
  const isTimeBased = process.env.IS_TIME_BASED_DEPLOYMENT === "true";

  if (isTimeBased) {
    return {
      waitForFirstBidder: 300,
      nextBidderBlockOrTimestampLimit: 300,
    };
  }

  switch (networkName) {
    case "hardhat":
      return {
        waitForFirstBidder: 100,
        nextBidderBlockOrTimestampLimit: 100,
      };
    case "bsctestnet":
      return {
        waitForFirstBidder: 100,
        nextBidderBlockOrTimestampLimit: 100,
      };
    case "bscmainnet":
      return {
        waitForFirstBidder: 100,
        nextBidderBlockOrTimestampLimit: 100,
      };
    case "sepolia":
      return {
        waitForFirstBidder: 25,
        nextBidderBlockOrTimestampLimit: 25,
      };
    case "ethereum":
      return {
        waitForFirstBidder: 25,
        nextBidderBlockOrTimestampLimit: 25,
      };
    case "opbnbtestnet":
      return {
        waitForFirstBidder: 300,
        nextBidderBlockOrTimestampLimit: 300,
      };
    case "opbnbmainnet":
      return {
        waitForFirstBidder: 300,
        nextBidderBlockOrTimestampLimit: 300,
      };
    case "development":
      return {
        waitForFirstBidder: 100,
        nextBidderBlockOrTimestampLimit: 100,
      };
    default:
      throw new Error(`bidder limits for network ${networkName} is not available.`);
  }
}

export function getMaxBorrowRateMantissa(networkName: string): BigNumber {
  const isTimeBased = process.env.IS_TIME_BASED_DEPLOYMENT === "true";

  if (isTimeBased) {
    return BigNumber.from(0.00016667e16); // (0.0005e16 / 3) for per second
  }

  switch (networkName) {
    case "hardhat":
      return BigNumber.from(0.0005e16);
    case "bsctestnet":
      return BigNumber.from(0.0005e16);
    case "bscmainnet":
      return BigNumber.from(0.0005e16);
    case "sepolia":
      return BigNumber.from(0.0005e16);
    case "ethereum":
      return BigNumber.from(0.0005e16);
    case "opbnbtestnet":
      return BigNumber.from(0.0005e16);
    case "opbnbmainnet":
      return BigNumber.from(0.0005e16);
    case "development":
      return BigNumber.from(0.0005e16);
    default:
      throw new Error(`max borrow rate for network ${networkName} is not available.`);
  }
}
