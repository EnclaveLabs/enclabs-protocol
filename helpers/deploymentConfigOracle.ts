import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { contracts as governanceArbitrumOne } from "../deployments/arbitrumone.json";
import { contracts as governanceSonic } from "../deployments/sonic.json";
export interface Feed {
  [key: string]: string;
}

export interface Config {
  [key: string]: Feed;
}

export interface Asset {
  token: string;
  address: string;
  oracle: string;
  price?: string;
  stalePeriod?: number;
  market?: string;
  correlatedTo?: string;
  baseUnit?: BigNumber;
  uniswapPool?: string;
  isEthBased?: boolean;
  isReversedPool?: boolean;
  anchorPeriod?: number;
  tokenA?: string;
  tokenB?: string;
  fee?: number;
  twapWindow?: number;
  baseToken?: string;
  quoteToken?: string;
  pool?: string;
}

export interface Assets {
  [key: string]: Asset[];
}

export interface NetworkAddress {
  [key: string]: string;
}

export interface PreconfiguredAddresses {
  [key: string]: NetworkAddress;
}

export interface AccessControlEntry {
  caller: string;
  target: string;
  method: string;
}

export interface Oracle {
  oracles: [string, string, string];
  enableFlagsForOracles: [boolean, boolean, boolean];
  underlyingOracle: Contract;
  getTokenConfig?: (asset: Asset, networkName: string) => void;
  getDirectPriceConfig?: (asset: Asset) => void;
  getStalePeriodConfig?: (asset: Asset) => string[];
}

export interface Oracles {
  [key: string]: Oracle;
}

export const SEQUENCER: Record<string, string> = {
  arbitrumone: "0xFdB631F5EE196F0ed6FAa767959853A9F217697D",
  opmainnet: "0x371EAD81c9102C9BF4874A9075FFFf170F2Ee389",
};

export const addr0000 = "0x0000000000000000000000000000000000000000";
export const DEFAULT_STALE_PERIOD = 24 * 60 * 60; // 24 hrs
const STALE_PERIOD_100M = 60 * 100; // 100 minutes (for pricefeeds with heartbeat of 1 hr)
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
export const ANY_CONTRACT = ethers.constants.AddressZero;

export const ADDRESSES: PreconfiguredAddresses = {
  sonic: {
    vBNBAddress: ethers.constants.AddressZero,
    WBNBAddress: ethers.constants.AddressZero,
    VAIAddress: ethers.constants.AddressZero,
    acm: "0x97DeDEA6ddfB3F2dAf5EC347AA61458f4A1803A8",
    timelock: governanceSonic.NormalTimelock.address, 
  },
  arbitrumone: {
    vBNBAddress: ethers.constants.AddressZero,
    WBNBAddress: ethers.constants.AddressZero,
    VAIAddress: ethers.constants.AddressZero,
    acm: "0x4D7395dBF10b34Da58216d104B1423E8AC9dC42F", //ToFIX import form package
    timelock: governanceArbitrumOne.NormalTimelock.address, // Arbitrum One Multisig
    wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529",
    weETH: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
    WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    PTweETH_26JUN2025: "0xb33808ea0e883138680ba29311a220a7377cdb92",
    PTweETH_26JUN2025_Market: "0xbf5e60ddf654085f80dae9dd33ec0e345773e1f8",
    PTOracle: "0x9a9fa8338dd5e5b2188006f1cd2ef26d921650c2",
    WETHAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    PendleWethUniV3Pool: "0xdbaeB7f0DFe3a0AAFD798CCECB5b22E708f7852c",
    UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    
  },
};

export const chainlinkFeed: Config = {
  
  arbitrumone: {
    WBTC: "0x6ce185860a4963106506C203335A2910413708e9",
    USDC: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
    USDT: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
    ARB: "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6",
    WETH: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
    wstETH: "0xB1552C5e96B312d0Bf8b554186F846C40614a540",
    weETH: "0x20bAe7e1De9c596f5F7615aeaa1342Ba99294e12" //exchangerate should be onejumporacle 
   
  },
  sonic: {

  },
  
};

export const redstoneFeed: Config = {
  
  arbitrumone: {
   
  },
  sonic: {

  },
  
};

export const pythID: Config = {
  arbitrumone: {
    
  },
  sonic: {

  },
};
export const pendleMarket: Config = {
  
  arbitrumone: {
    PTweETH_26JUN2025: "0xbf5e60ddf654085f80dae9dd33ec0e345773e1f8",
   
  },
  sonic: {

  },
  
};



export const assets: Assets = {
  arbitrumone: [ //asset addresses
    {
      token: "WBTC",
      address: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
      oracle: "chainlink",
    },
    {
      token: "USDC",
      address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      oracle: "chainlink",
    },
    {
      token: "USDT",
      address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
      oracle: "chainlink",
    },
    {
      token: "ARB",
      address: "0x912ce59144191c1204e64559fe8253a0e49e6548",
      oracle: "chainlink",
    },
    {
      token: "WETH",
      address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      oracle: "chainlink",
    },
    {
      token: "wstETH",
      address: "0x5979D7b546E38E414F7E9822514be443A4800529",
      oracle: "onejumpchainlink",
      correlatedTo: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    },
    {
      token: "weETH",
      address: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
      oracle: "onejumpchainlink",
      correlatedTo: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    },
    {
      token: "PT-weETH-26JUN2025",
      address: "0xb33808ea0e883138680ba29311a220a7377cdb92",
      oracle: "pendle",
      market: "0xbf5e60ddf654085f80dae9dd33ec0e345773e1f8",
      correlatedTo: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe", //weETH address, not pricefeed

    },
    // {
    //   token: "pendle", //wont work as pool is v3
    //   address: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8",
    //   oracle: "univ2twap",
    //   baseUnit: ethers.utils.parseUnits("1", "ether"),
    //   uniswapPool: "0xdbaeB7f0DFe3a0AAFD798CCECB5b22E708f7852c",
    //   isEthBased: true,
    //   isReversedPool: true,
    //   anchorPeriod: 60,

    // },
    {
      token: "gmx", //wont work as pool is v3
      address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
      oracle: "univ3twap",
      tokenA: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      tokenB: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
      fee: 10000,
      twapWindow: 300,
      baseToken: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
      quoteToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      pool: ethers.constants.AddressZero, //setted during addTokenConfig

    },
  ],
  sonic: [
    {
      token: "WBTC",
      address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
      oracle: "chainlink",
    },


  ],
};

export const getOraclesData = async (): Promise<Oracles> => {
  const chainlinkOracle = await ethers.getContractOrNull("SequencerChainlinkOracle"); //SequencerChainlinkOracle or ChainlinkOracle depending of L1 or L2
  //const redstoneOracle = await ethers.getContractOrNull("RedStoneOracle");
  const pendlePTOracle = await ethers.getContractOrNull("PendlePtOracle");
  const onejumpchainlinkOracle = await ethers.getContractOrNull("OneJumpOracleV2");
  const twapOracle = await ethers.getContractOrNull("TwapOracle");
  const uniswapV3Oracle = await ethers.getContractOrNull("UniswapV3Oracle");
  //const binanceOracle = await ethers.getContractOrNull("BinanceOracle");
  const pythOracle = await ethers.getContractOrNull("PythOracle");


  const oraclesData: Oracles = {
    ...(chainlinkOracle
      ? {
          chainlink: {
            oracles: [chainlinkOracle.address, addr0000, addr0000],
            enableFlagsForOracles: [true, false, false],
            underlyingOracle: chainlinkOracle,
            getTokenConfig: (asset: Asset, name: string) => ({
              asset: asset.address,
              feed: chainlinkFeed[name][asset.token],
              maxStalePeriod: asset.stalePeriod ? asset.stalePeriod : DEFAULT_STALE_PERIOD,
            }),
          },
          chainlinkFixed: {
            oracles: [chainlinkOracle.address, addr0000, addr0000],
            enableFlagsForOracles: [true, false, false],
            underlyingOracle: chainlinkOracle,
            getDirectPriceConfig: (asset: Asset) => ({
              asset: asset.address,
              price: asset.price,
            }),
          },
        }
      : {}),
      ...(onejumpchainlinkOracle
        ? {
            onejumpchainlink: {
              oracles: [onejumpchainlinkOracle.address, addr0000, addr0000],
              enableFlagsForOracles: [true, false, false],
              underlyingOracle: onejumpchainlinkOracle,
              getTokenConfig: (asset: Asset, name: string) => ({
                asset: asset.address,
                feed: chainlinkFeed[name][asset.token],
                underlyingAsset: asset.correlatedTo,
                maxStalePeriod: asset.stalePeriod ? asset.stalePeriod : DEFAULT_STALE_PERIOD,
              }),
            },
          }
        : {}),
    // ...(redstoneOracle
    //   ? {
    //       redstone: {
    //         oracles: [redstoneOracle.address, addr0000, addr0000],
    //         enableFlagsForOracles: [true, false, false],
    //         underlyingOracle: redstoneOracle,
    //         getTokenConfig: (asset: Asset, name: string) => ({
    //           asset: asset.address,
    //           feed: redstoneFeed[name][asset.token],
    //           maxStalePeriod: asset.stalePeriod ? asset.stalePeriod : DEFAULT_STALE_PERIOD,
    //         }),
    //       },
    //     }
    //   : {}),
      ...(pendlePTOracle
        ? {
            pendle: {
              oracles: [pendlePTOracle.address, addr0000, addr0000],
              enableFlagsForOracles: [true, false, false],
              underlyingOracle: pendlePTOracle,
              getTokenConfig: (asset: Asset, name: string) => ({
                asset: asset.address,
                market: asset.market,
                underlyingToken: asset.correlatedTo,
              }),
            },
          }
        : {}),
        ...(twapOracle
          ? {
            univ2twap: {
                oracles: [twapOracle.address, addr0000, addr0000],
                enableFlagsForOracles: [true, false, false],
                underlyingOracle: twapOracle,
                getTokenConfig: (asset: Asset, name: string) => ({
                  asset: asset.address,
                  baseUnit: asset.baseUnit,
                  uniswapPool: asset.uniswapPool,
                  isEthBased: asset.isEthBased,
                  isReversedPool: asset.isReversedPool,
                  anchorPeriod: asset.anchorPeriod,
                }),
              },
            }
          : {}),
          ...(uniswapV3Oracle
            ? {
              univ3twap: {
                  oracles: [uniswapV3Oracle.address, addr0000, addr0000],
                  enableFlagsForOracles: [true, false, false],
                  underlyingOracle: uniswapV3Oracle,
                  getTokenConfig: (asset: Asset, name: string) => ({
                    tokenA: asset.tokenA,
                    tokenB: asset.tokenB,
                    fee: asset.fee,
                    twapWindow: asset.twapWindow,
                    baseToken: asset.baseToken,
                    quoteToken: asset.quoteToken,
                    pool: asset.pool,
                  }),
                },
              }
            : {}),
    // ...(binanceOracle
    //   ? {
    //       binance: {
    //         oracles: [binanceOracle.address, addr0000, addr0000],
    //         enableFlagsForOracles: [true, false, false],
    //         underlyingOracle: binanceOracle,
    //         getStalePeriodConfig: (asset: Asset) => [
    //           asset.token,
    //           asset.stalePeriod ? asset.stalePeriod.toString() : DEFAULT_STALE_PERIOD.toString(),
    //         ],
    //       },
    //     }
    //   : {}),
    ...(pythOracle
      ? {
          pyth: {
            oracles: [pythOracle.address, addr0000, addr0000],
            enableFlagsForOracles: [true, false, false],
            underlyingOracle: pythOracle,
            getTokenConfig: (asset: Asset, name: string) => ({
              pythId: pythID[name][asset.token],
              asset: asset.address,
              maxStalePeriod: asset.stalePeriod ? asset.stalePeriod : DEFAULT_STALE_PERIOD,
            }),
          },
        }
      : {}),
  };

  return oraclesData;
};

export const getOraclesToDeploy = async (network: string): Promise<Record<string, boolean>> => {
  const oracles: Record<string, boolean> = {};

  assets[network].forEach(asset => {
    oracles[asset.oracle] = true;
  });

  return oracles;
};