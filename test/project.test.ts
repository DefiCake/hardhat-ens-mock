// tslint:disable-next-line no-implicit-dependencies
import { assert, expect } from "chai";
import * as ethers from "ethers";
import {
  TASK_NODE,
  TASK_TEST_SETUP_TEST_ENVIRONMENT,
} from "hardhat/builtin-tasks/task-names";
import path from "path";
import { abi as ENS_ABI } from "@ensdomains/ens/build/contracts/ENS.json";
import {
  abi as ENS_RESOLVER_ABI,
  bytecode as ENS_RESOLVER_BYTECODE,
} from "./artifacts/Resolver.json";

import { ENS_REGISTRY_ADDRESS } from "../src/constants";

import { useEnvironment } from "./helpers";
import { HashZero } from "@ethersproject/constants";
import { EthersProviderWrapper } from "./EthersProviderWrapper";
import { namehash } from "@ethersproject/hash";
import { getAddress } from "@ethersproject/address";

describe("ENS owner override", function () {
  describe("hardhat node", function () {
    describe("with ensMock.enabled = true", function () {
      useEnvironment("hardhat-project");

      beforeEach(function () {
        this.hre.run(TASK_NODE);
      });

      afterEach(async function () {
        this.hre.ensMock.server.close();
        await this.hre.ensMock.server.waitUntilClosed();
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
        this.hre.run(TASK_NODE);
      });

      afterEach(async function () {
        this.hre.ensMock.server.close();
        await this.hre.ensMock.server.waitUntilClosed();
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
        this.hre.run(TASK_NODE);
      });

      afterEach(async function () {
        this.hre.ensMock.server.close();
        await this.hre.ensMock.server.waitUntilClosed();
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

  describe("hardhat test", function () {
    describe("with ensMock.enabled = true", function () {
      useEnvironment("hardhat-project");

      beforeEach(function () {
        this.hre.run(TASK_TEST_SETUP_TEST_ENVIRONMENT);
      });

      it("should override owner of root node", async function () {
        const provider = new EthersProviderWrapper(this.hre.network.provider);

        const code = await provider.getCode(ENS_REGISTRY_ADDRESS);
        assert(code.length > 2, `ENS_REGISTRY_ADDRESS not deployed`);

        const ens = new ethers.Contract(
          ENS_REGISTRY_ADDRESS,
          ENS_ABI,
          provider
        );

        const [firstAccount]: string[] = await this.hre.network.provider.send(
          "eth_accounts"
        );
        const owner: string = await ens.owner(HashZero);
        assert.equal(
          ethers.utils.getAddress(firstAccount),
          ethers.utils.getAddress(owner)
        );
      });
    });

    describe("with ensMock.enabled = true & ensMock.ensOwnerAccount", function () {
      useEnvironment("full-config");

      beforeEach(function () {
        this.hre.run(TASK_TEST_SETUP_TEST_ENVIRONMENT);
      });

      it("should override owner of root node", async function () {
        const provider = new EthersProviderWrapper(this.hre.network.provider);

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
      });
    });

    describe("with ensMock.enabled = false", function () {
      useEnvironment("disabled-config");

      beforeEach(function () {
        this.hre.run(TASK_TEST_SETUP_TEST_ENVIRONMENT);
      });

      it("either should not be deployed or owner is not an address included in hardhat", async function () {
        const provider = new EthersProviderWrapper(this.hre.network.provider);
        const code = await provider.getCode(ENS_REGISTRY_ADDRESS);

        if (code.length === 2) return;

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
      });
    });
  });

  describe("Environment extension", () => {
    useEnvironment("hardhat-project");

    beforeEach(function () {
      this.hre.run(TASK_TEST_SETUP_TEST_ENVIRONMENT);
    });

    describe("ensMock.setDomainOwner", () => {
      it("should allow to override any ENS domain", async function () {
        const domain = "random.eth";
        const provider = new EthersProviderWrapper(this.hre.network.provider);
        const firstAccount = await provider.getSigner(0).getAddress();
        await this.hre.ensMock.setDomainOwner(domain, firstAccount);

        const ens = new ethers.Contract(
          ENS_REGISTRY_ADDRESS,
          ENS_ABI,
          provider
        );

        const node = namehash(domain);

        const owner: string = await ens.owner(node);

        assert.strictEqual(getAddress(firstAccount), getAddress(owner));
      });
    });
  });

  describe("ethers name resolution", () => {
    useEnvironment("hardhat-ethers");

    beforeEach(function () {
      this.hre.run(TASK_TEST_SETUP_TEST_ENVIRONMENT);
    });

    it("can resolve names", async function () {
      const domain = "random.eth";
      const provider = this.hre.ethers.provider;
      const firstAccount = provider.getSigner(0);
      const firstAccountAddress = await firstAccount.getAddress();
      await this.hre.ensMock.setDomainOwner(domain, firstAccountAddress);

      const ens = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_ABI, provider);

      const node = namehash(domain);

      const resolver = await new ethers.ContractFactory(
        ENS_RESOLVER_ABI,
        ENS_RESOLVER_BYTECODE
      )
        .connect(firstAccount)
        .deploy();

      await ens.connect(firstAccount).setResolver(node, resolver.address);
      await resolver.functions["setAddr(bytes32,address)"](
        node,
        firstAccountAddress
      );

      const resolvedAddress = await provider.resolveName(domain);

      if (!resolvedAddress) assert(false, "Resolved address returned null");

      assert.strictEqual(
        getAddress(firstAccountAddress),
        getAddress(resolvedAddress!)
      );
    });
  });

  describe("web3 name resolution", () => {
    useEnvironment("hardhat-web3");

    beforeEach(function () {
      this.hre.run(TASK_TEST_SETUP_TEST_ENVIRONMENT);
    });

    it("can resolve names", async function () {
      const domain = "random.eth";
      const provider = new EthersProviderWrapper(this.hre.network.provider);
      const firstAccount = provider.getSigner(0);
      const firstAccountAddress = await firstAccount.getAddress();
      await this.hre.ensMock.setDomainOwner(domain, firstAccountAddress);

      const ens = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_ABI, provider);

      const node = namehash(domain);

      const resolver = await new ethers.ContractFactory(
        ENS_RESOLVER_ABI,
        ENS_RESOLVER_BYTECODE
      )
        .connect(firstAccount)
        .deploy();

      await ens.connect(firstAccount).setResolver(node, resolver.address);
      await resolver.functions["setAddr(bytes32,address)"](
        node,
        firstAccountAddress
      );

      const resolvedAddress = await this.hre.web3.eth.ens.getAddress(domain);

      assert.strictEqual(
        getAddress(firstAccountAddress),
        getAddress(resolvedAddress)
      );
    });
  });
});
