import "./type-extensions";

import { extendConfig, extendEnvironment, subtask } from "hardhat/config";
import { HARDHAT_NETWORK_NAME, lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import {
  TASK_NODE_CREATE_SERVER,
  TASK_NODE_GET_PROVIDER,
  TASK_TEST_SETUP_TEST_ENVIRONMENT,
} from "hardhat/builtin-tasks/task-names";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";
import { setDomainOwner, setDomainResolver, setupEnsMock } from "./utils";
import { ENS_REGISTRY_ADDRESS } from "./constants";
import { EnsMockConfig } from "./types";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const defaultEnsMockConfig: EnsMockConfig = {
      enabled: true,
      ensOwnerAccount: 0,
    };
    config.networks.hardhat.ensMock = {
      ...defaultEnsMockConfig,
      ...userConfig.networks?.hardhat?.ensMock,
    };
  }
);

extendEnvironment((hre) => {
  const setDomainOwnerFunction = setDomainOwner(hre);
  const setDomainResolverFunction = setDomainResolver(hre);
  hre.ensMock = {
    ...hre.ensMock,
    setDomainOwner: setDomainOwnerFunction,
    setDomainResolver: setDomainResolverFunction,
  };

  if (hre.network.name != HARDHAT_NETWORK_NAME) return;
  const ensMock = hre.config.networks[HARDHAT_NETWORK_NAME].ensMock;
  if (!ensMock?.enabled) return;

  if (!!hre.ethers)
    hre.ethers.provider._networkPromise.then(
      (network) => (network.ensAddress = ENS_REGISTRY_ADDRESS)
    );

  if (!!hre.web3)
    ((hre.web3 as unknown) as any).eth.ens.registryAddress = ENS_REGISTRY_ADDRESS;
});

subtask(TASK_NODE_CREATE_SERVER).setAction(async (args, hre, runSuper) => {
  const server = await runSuper(args);

  if (hre.network.name != HARDHAT_NETWORK_NAME) return server;

  hre.ensMock = { ...hre.ensMock, server };
  return server;
});

subtask(TASK_NODE_GET_PROVIDER).setAction(async (args, hre, runSuper) => {
  const provider = await runSuper(args);

  if (hre.network.name != HARDHAT_NETWORK_NAME) return provider;
  const ensMock = hre.config.networks[HARDHAT_NETWORK_NAME].ensMock;
  if (!ensMock?.enabled) return provider;

  await setupEnsMock(hre, ensMock.ensOwnerAccount);

  return provider;
});

subtask(TASK_TEST_SETUP_TEST_ENVIRONMENT).setAction(
  async (args, hre, runSuper) => {
    await runSuper(args);

    if (hre.network.name != HARDHAT_NETWORK_NAME) return;
    const ensMock = hre.config.networks[HARDHAT_NETWORK_NAME].ensMock;
    if (!ensMock?.enabled) return;

    await setupEnsMock(hre, ensMock.ensOwnerAccount);
  }
);
