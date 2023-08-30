import type { ethers } from "ethers";
import "hardhat/types/runtime";

interface HardhatEthersHelpers {
  provider: ethers.providers.JsonRpcProvider;
}

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: typeof ethers & HardhatEthersHelpers;
  }
}
