// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-web3";
import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
};

export default config;
