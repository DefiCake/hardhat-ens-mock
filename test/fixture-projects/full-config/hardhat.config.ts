// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      ensMock: {
        enabled: true,
        ensOwnerAccount: 1,
      },
    },
  },
};

export default config;
