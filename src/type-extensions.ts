// If your plugin extends types from another plugin, you should import the plugin here.

// To extend one of Hardhat's types, you need to import the module where it has been defined, and redeclare it.
import "hardhat/types/runtime";
import "hardhat/types/config";
import { EnsMockConfig } from "../types";
import { JsonRpcServer } from "hardhat/types";

declare module "hardhat/types/config" {
  interface HardhatNetworkConfig {
    ensMock?: EnsMockConfig;
  }

  interface HardhatNetworkUserConfig {
    ensMock?: EnsMockConfig;
  }
}

declare module "hardhat/types/runtime" {
  // This is an example of an extension to the Hardhat Runtime Environment.
  // This new field will be available in tasks' actions, scripts, and tests.
  interface HardhatRuntimeEnvironment {
    ensMock: {
      server: JsonRpcServer; // Purely for test purposes
      setDomainOwner: (domain: string, owner: string) => Promise<void>;
      setDomainResolver: (domain: string, resolver: string) => Promise<void>;
    };
  }
}
