import "./type-extensions";

import { extendConfig, extendEnvironment, subtask } from "hardhat/config";
import { HARDHAT_NETWORK_NAME, lazyObject } from "hardhat/plugins";
import { EnsMockConfig, HardhatConfig, HardhatUserConfig } from "hardhat/types";
import {
  TASK_NODE,
  TASK_NODE_CREATE_SERVER,
  TASK_NODE_GET_PROVIDER,
  TASK_NODE_SERVER_CREATED,
  TASK_TEST_SETUP_TEST_ENVIRONMENT,
} from "hardhat/builtin-tasks/task-names";
import path from "path";

import { ExampleHardhatRuntimeEnvironmentField } from "./ExampleHardhatRuntimeEnvironmentField";
// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";
import { addressIsContract, setupEnsMock } from "./utils";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // We apply our default config here. Any other kind of config resolution
    // or normalization should be placed here.
    //
    // `config` is the resolved config, which will be used during runtime and
    // you should modify.
    // `userConfig` is the config as provided by the user. You should not modify
    // it.
    //
    // If you extended the `HardhatConfig` type, you need to make sure that
    // executing this function ensures that the `config` object is in a valid
    // state for its type, including its extensions. For example, you may
    // need to apply a default value, like in this example.

    const defaultEnsMockConfig: EnsMockConfig = {
      enabled: true,
      ensOwnerAccount: 0,
    };
    config.networks.hardhat.ensMock = {
      ...defaultEnsMockConfig,
      ...userConfig.networks?.hardhat?.ensMock,
    };

    const userPath = userConfig.paths?.newPath;

    let newPath: string;
    if (userPath === undefined) {
      newPath = path.join(config.paths.root, "newPath");
    } else {
      if (path.isAbsolute(userPath)) {
        newPath = userPath;
      } else {
        // We resolve relative paths starting from the project's root.
        // Please keep this convention to avoid confusion.
        newPath = path.normalize(path.join(config.paths.root, userPath));
      }
    }

    config.paths.newPath = newPath;
  }
);

extendEnvironment((hre) => {
  // We add a field to the Hardhat Runtime Environment here.
  // We use lazyObject to avoid initializing things until they are actually
  // needed.

  hre.example = lazyObject(() => new ExampleHardhatRuntimeEnvironmentField());
});

subtask(TASK_NODE_CREATE_SERVER).setAction(async (args, hre, runSuper) => {
  return (hre.server = await runSuper(args));
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
