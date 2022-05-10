// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from "chai";
import * as ethers from "ethers";
import {
  TASK_NODE,
  TASK_NODE_CREATE_SERVER,
  TASK_TEST_SETUP_TEST_ENVIRONMENT,
} from "hardhat/builtin-tasks/task-names";
import path from "path";
import { abi as ENS_ABI } from "@ensdomains/ens/build/contracts/ENS.json";

import { ExampleHardhatRuntimeEnvironmentField } from "../src/ExampleHardhatRuntimeEnvironmentField";
import { ENS_REGISTRY_ADDRESS } from "../src/constants";

import { useEnvironment } from "./helpers";
import { HashZero } from "@ethersproject/constants";

describe("ENS owner override", function () {
  describe("hardhat node", function () {
    describe("with ensMock.enabled = true", function () {
      useEnvironment("hardhat-project");

      beforeEach(function () {
        this.hre.run(TASK_NODE, { silent: true });
      });

      afterEach(async function () {
        this.hre.server.close();
        await this.hre.server.waitUntilClosed();
      });

      it("should override owner of root node", function (done) {
        setTimeout(async () => {
          try {
            const provider = new ethers.providers.StaticJsonRpcProvider(
              "http://localhost:8545"
            );
            const code = await provider.getCode(ENS_REGISTRY_ADDRESS);
            assert(code.length > 2, `ENS_REGISTRY_ADDRESS not deployed`);

            const ens = new ethers.Contract(
              ENS_REGISTRY_ADDRESS,
              ENS_ABI,
              provider
            );

            const [
              firstAccount,
            ]: string[] = await this.hre.network.provider.send("eth_accounts");
            const owner: string = await ens.owner(HashZero);
            assert.equal(
              ethers.utils.getAddress(firstAccount),
              ethers.utils.getAddress(owner)
            );
            done();
          } catch (e) {
            done(e);
          }
        }, 1000);
      });
    });

    describe("with ensMock.enabled = true & ensMock.ensOwnerAccount", function () {
      useEnvironment("full-config");

      beforeEach(function () {
        this.hre.run(TASK_NODE, { silent: true });
      });

      afterEach(async function () {
        this.hre.server.close();
        await this.hre.server.waitUntilClosed();
      });

      it("should override owner of root node", function (done) {
        setTimeout(async () => {
          try {
            const provider = new ethers.providers.StaticJsonRpcProvider(
              "http://localhost:8545"
            );
            const code = await provider.getCode(ENS_REGISTRY_ADDRESS);
            assert(code.length > 2, `ENS_REGISTRY_ADDRESS not deployed`);

            const ens = new ethers.Contract(
              ENS_REGISTRY_ADDRESS,
              ENS_ABI,
              provider
            );

            const [
              ,
              secondAccount,
            ]: string[] = await this.hre.network.provider.send("eth_accounts");
            const owner: string = await ens.owner(HashZero);
            assert.equal(
              ethers.utils.getAddress(secondAccount),
              ethers.utils.getAddress(owner)
            );

            done();
          } catch (e) {
            done(e);
          }
        }, 1000);
      });
    });

    describe("with ensMock.enabled = false", function () {
      useEnvironment("disabled-config");

      beforeEach(function () {
        this.hre.run(TASK_NODE, { silent: true });
      });

      afterEach(async function () {
        this.hre.server.close();
        await this.hre.server.waitUntilClosed();
      });

      it("either should not be deployed or owner is not an address included in hardhat", function (done) {
        setTimeout(async () => {
          try {
            const provider = new ethers.providers.StaticJsonRpcProvider(
              "http://localhost:8545"
            );
            const code = await provider.getCode(ENS_REGISTRY_ADDRESS);

            if (code.length === 2) return done();

            const ens = new ethers.Contract(
              ENS_REGISTRY_ADDRESS,
              ENS_ABI,
              provider
            );

            const accounts: string[] = await this.hre.network.provider.send(
              "eth_accounts"
            );

            const owner: string = await ens.owner(HashZero);

            for (const account of accounts) {
              assert.notEqual(
                ethers.utils.getAddress(account),
                ethers.utils.getAddress(owner)
              );
            }

            done();
          } catch (e) {
            done(e);
          }
        }, 1000);
      });
    });
  });

  describe("HardhatConfig extension", function () {
    useEnvironment("hardhat-project");

    it("Should add the newPath to the config", function () {
      assert.equal(
        this.hre.config.paths.newPath,
        path.join(process.cwd(), "asd")
      );
    });
  });
});

describe("Unit tests examples", function () {
  describe("ExampleHardhatRuntimeEnvironmentField", function () {
    describe("sayHello", function () {
      it("Should say hello", function () {
        const field = new ExampleHardhatRuntimeEnvironmentField();
        assert.equal(field.sayHello(), "hello");
      });
    });
  });
});
