import { bN as axios, bO as defineReadOnly, bP as getStatic, bQ as Signer, bR as Provider, bS as getAddress, bT as Logger, bU as getContractAddress, bV as Interface, bW as shallowCopy, bX as VoidSigner, bY as Indexed, bZ as deepCopy, b_ as isHexString, b$ as checkResultErrors, c0 as resolveProperties, aL as BigNumber, c1 as accessListify, c2 as arrayify, j as jsx, _ as _objectWithoutProperties, aJ as cloneElementWithCssProp, Y as Body, T as _defineProperty, ab as CheckoutErrorType, c3 as IMMUTABLE_API_BASE_URL, r as reactExports, I as IMTBLWidgetEvents, B as BridgeEventType, o as jsxs, c4 as ShimmerBox, a4 as MenuItem, b3 as Stack, l as useTranslation, N as Button, G as Box, c5 as PASSPORT_URL, aC as Link, c6 as getChainIdBySlug, af as getChainImage, c7 as networkName, ae as FramedImage, br as Icon, $ as useAnalytics, a6 as UserJourney, b5 as Divider, X as ViewContext, aV as Fragment, V as ViewActions, au as useWalletConnect, aw as isWalletConnectProvider, bq as Logo, c8 as RawImage, c9 as AXELAR_SCAN_URL, a9 as isNativeToken, ai as getTokenImageByAddress, ca as getNativeSymbolByChainSlug, aj as calculateCryptoToFiat, a1 as EventTargetContext, a2 as isPassportProvider, i as getL1ChainId, U as TokenFilterTypes, h as getL2ChainId, cb as WalletProviderRdns, cc as Web3Provider, cd as useInjectedProviders, ak as HeaderNavigation, an as FooterLogo, ce as WalletDrawer, ao as SimpleLayout, cf as getChainSlugById, cg as JsonRpcProvider, ch as DEFAULT_TRANSACTIONS_RETRY_POLICY, L as LoadingView, k as ChainId, ci as getChainNameById, w as useTheme, as as Heading, aq as getWalletProviderNameByProvider, cj as isAddressSanctioned, p as SharedViews, ck as isMetaMaskProvider, ap as WalletProviderName, at as Drawer, v as ButtCon, al as ButtonNavigationStyles, a7 as orchestrationEvents, a5 as tokenValueFormat, a0 as formatZeroAmount, bt as NATIVE, bv as amountInputValidation, bk as getRemoteImage, bp as CloudImage, cl as ETH_TOKEN_SYMBOL, a3 as Environment, cm as GasEstimateType, bz as DEFAULT_TOKEN_DECIMALS, bu as DEFAULT_QUOTE_REFRESH_INTERVAL, cn as addChainChangedListener, co as removeChainChangedListener, bB as IMX_TOKEN_SYMBOL, cp as dist, cq as CHECKOUT_CDN_BASE_URL, ax as heroBackGroundStyles, ay as heroImageStyles, cr as Badge, aA as SimpleTextBody, bC as FooterButton, cs as getEthTokenImage, ct as WITHDRAWAL_CLAIM_GAS_LIMIT, bs as getDefaultTokenImage, aD as viewReducer, aE as initialViewState, cu as BridgeConfiguration, cv as ImmutableConfiguration, cw as TokenBridge, bE as StatusView, b1 as StatusType, E as ErrorView, cx as ServiceUnavailableErrorView, cy as ServiceType, cz as ETH_SEPOLIA_TO_ZKEVM_TESTNET, cA as ETH_SEPOLIA_TO_ZKEVM_DEVNET, cB as ETH_MAINNET_TO_ZKEVM_MAINNET } from './index-Ae2juTF3.js';
import { B as BridgeWidgetViews, C as CryptoFiatContext, f as formatUnits, a as CryptoFiatActions, p as parseUnits, T as TopUpView, b as CryptoFiatProvider } from './TopUpView-BinG-jkK.js';
import { T as TokenImage, r as retry, u as useInterval } from './retry-CDK--oGi.js';
import { A as Accordion, S as SelectForm, T as TransactionRejected, g as getAllowedBalances, F as Fees, N as NetworkSwitchDrawer, W as WalletApproveHero } from './balance-BAruSdXS.js';
import { T as TextInputForm } from './TextInputForm-B89J7hRS.js';

// This module is intended to unwrap Axios default export as named.
// Keep top-level export same with static properties
// so that it can keep same with es module or cjs
const {
  Axios,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken,
  VERSION,
  all,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;

const version = "contracts/5.7.0";

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger = new Logger(version);
function resolveName(resolver, nameOrPromise) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = yield nameOrPromise;
        if (typeof (name) !== "string") {
            logger.throwArgumentError("invalid address or ENS name", "name", name);
        }
        // If it is already an address, just use it (after adding checksum)
        try {
            return getAddress(name);
        }
        catch (error) { }
        if (!resolver) {
            logger.throwError("a provider or signer is needed to resolve ENS names", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "resolveName"
            });
        }
        const address = yield resolver.resolveName(name);
        if (address == null) {
            logger.throwArgumentError("resolver or addr is not configured for ENS name", "name", name);
        }
        return address;
    });
}
// Recursively replaces ENS names with promises to resolve the name and resolves all properties
function resolveAddresses(resolver, value, paramType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Array.isArray(paramType)) {
            return yield Promise.all(paramType.map((paramType, index) => {
                return resolveAddresses(resolver, ((Array.isArray(value)) ? value[index] : value[paramType.name]), paramType);
            }));
        }
        if (paramType.type === "address") {
            return yield resolveName(resolver, value);
        }
        if (paramType.type === "tuple") {
            return yield resolveAddresses(resolver, value, paramType.components);
        }
        if (paramType.baseType === "array") {
            if (!Array.isArray(value)) {
                return Promise.reject(logger.makeError("invalid value for array", Logger.errors.INVALID_ARGUMENT, {
                    argument: "value",
                    value
                }));
            }
            return yield Promise.all(value.map((v) => resolveAddresses(resolver, v, paramType.arrayChildren)));
        }
        return value;
    });
}
function populateTransaction(contract, fragment, args) {
    return __awaiter(this, void 0, void 0, function* () {
        // If an extra argument is given, it is overrides
        let overrides = {};
        if (args.length === fragment.inputs.length + 1 && typeof (args[args.length - 1]) === "object") {
            overrides = shallowCopy(args.pop());
        }
        // Make sure the parameter count matches
        logger.checkArgumentCount(args.length, fragment.inputs.length, "passed to contract");
        // Populate "from" override (allow promises)
        if (contract.signer) {
            if (overrides.from) {
                // Contracts with a Signer are from the Signer's frame-of-reference;
                // but we allow overriding "from" if it matches the signer
                overrides.from = resolveProperties({
                    override: resolveName(contract.signer, overrides.from),
                    signer: contract.signer.getAddress()
                }).then((check) => __awaiter(this, void 0, void 0, function* () {
                    if (getAddress(check.signer) !== check.override) {
                        logger.throwError("Contract with a Signer cannot override from", Logger.errors.UNSUPPORTED_OPERATION, {
                            operation: "overrides.from"
                        });
                    }
                    return check.override;
                }));
            }
            else {
                overrides.from = contract.signer.getAddress();
            }
        }
        else if (overrides.from) {
            overrides.from = resolveName(contract.provider, overrides.from);
            //} else {
            // Contracts without a signer can override "from", and if
            // unspecified the zero address is used
            //overrides.from = AddressZero;
        }
        // Wait for all dependencies to be resolved (prefer the signer over the provider)
        const resolved = yield resolveProperties({
            args: resolveAddresses(contract.signer || contract.provider, args, fragment.inputs),
            address: contract.resolvedAddress,
            overrides: (resolveProperties(overrides) || {})
        });
        // The ABI coded transaction
        const data = contract.interface.encodeFunctionData(fragment, resolved.args);
        const tx = {
            data: data,
            to: resolved.address
        };
        // Resolved Overrides
        const ro = resolved.overrides;
        // Populate simple overrides
        if (ro.nonce != null) {
            tx.nonce = BigNumber.from(ro.nonce).toNumber();
        }
        if (ro.gasLimit != null) {
            tx.gasLimit = BigNumber.from(ro.gasLimit);
        }
        if (ro.gasPrice != null) {
            tx.gasPrice = BigNumber.from(ro.gasPrice);
        }
        if (ro.maxFeePerGas != null) {
            tx.maxFeePerGas = BigNumber.from(ro.maxFeePerGas);
        }
        if (ro.maxPriorityFeePerGas != null) {
            tx.maxPriorityFeePerGas = BigNumber.from(ro.maxPriorityFeePerGas);
        }
        if (ro.from != null) {
            tx.from = ro.from;
        }
        if (ro.type != null) {
            tx.type = ro.type;
        }
        if (ro.accessList != null) {
            tx.accessList = accessListify(ro.accessList);
        }
        // If there was no "gasLimit" override, but the ABI specifies a default, use it
        if (tx.gasLimit == null && fragment.gas != null) {
            // Compute the intrinsic gas cost for this transaction
            // @TODO: This is based on the yellow paper as of Petersburg; this is something
            // we may wish to parameterize in v6 as part of the Network object. Since this
            // is always a non-nil to address, we can ignore G_create, but may wish to add
            // similar logic to the ContractFactory.
            let intrinsic = 21000;
            const bytes = arrayify(data);
            for (let i = 0; i < bytes.length; i++) {
                intrinsic += 4;
                if (bytes[i]) {
                    intrinsic += 64;
                }
            }
            tx.gasLimit = BigNumber.from(fragment.gas).add(intrinsic);
        }
        // Populate "value" override
        if (ro.value) {
            const roValue = BigNumber.from(ro.value);
            if (!roValue.isZero() && !fragment.payable) {
                logger.throwError("non-payable method cannot override value", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "overrides.value",
                    value: overrides.value
                });
            }
            tx.value = roValue;
        }
        if (ro.customData) {
            tx.customData = shallowCopy(ro.customData);
        }
        if (ro.ccipReadEnabled) {
            tx.ccipReadEnabled = !!ro.ccipReadEnabled;
        }
        // Remove the overrides
        delete overrides.nonce;
        delete overrides.gasLimit;
        delete overrides.gasPrice;
        delete overrides.from;
        delete overrides.value;
        delete overrides.type;
        delete overrides.accessList;
        delete overrides.maxFeePerGas;
        delete overrides.maxPriorityFeePerGas;
        delete overrides.customData;
        delete overrides.ccipReadEnabled;
        // Make sure there are no stray overrides, which may indicate a
        // typo or using an unsupported key.
        const leftovers = Object.keys(overrides).filter((key) => (overrides[key] != null));
        if (leftovers.length) {
            logger.throwError(`cannot override ${leftovers.map((l) => JSON.stringify(l)).join(",")}`, Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "overrides",
                overrides: leftovers
            });
        }
        return tx;
    });
}
function buildPopulate(contract, fragment) {
    return function (...args) {
        return populateTransaction(contract, fragment, args);
    };
}
function buildEstimate(contract, fragment) {
    const signerOrProvider = (contract.signer || contract.provider);
    return function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!signerOrProvider) {
                logger.throwError("estimate require a provider or signer", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "estimateGas"
                });
            }
            const tx = yield populateTransaction(contract, fragment, args);
            return yield signerOrProvider.estimateGas(tx);
        });
    };
}
function addContractWait(contract, tx) {
    const wait = tx.wait.bind(tx);
    tx.wait = (confirmations) => {
        return wait(confirmations).then((receipt) => {
            receipt.events = receipt.logs.map((log) => {
                let event = deepCopy(log);
                let parsed = null;
                try {
                    parsed = contract.interface.parseLog(log);
                }
                catch (e) { }
                // Successfully parsed the event log; include it
                if (parsed) {
                    event.args = parsed.args;
                    event.decode = (data, topics) => {
                        return contract.interface.decodeEventLog(parsed.eventFragment, data, topics);
                    };
                    event.event = parsed.name;
                    event.eventSignature = parsed.signature;
                }
                // Useful operations
                event.removeListener = () => { return contract.provider; };
                event.getBlock = () => {
                    return contract.provider.getBlock(receipt.blockHash);
                };
                event.getTransaction = () => {
                    return contract.provider.getTransaction(receipt.transactionHash);
                };
                event.getTransactionReceipt = () => {
                    return Promise.resolve(receipt);
                };
                return event;
            });
            return receipt;
        });
    };
}
function buildCall(contract, fragment, collapseSimple) {
    const signerOrProvider = (contract.signer || contract.provider);
    return function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            // Extract the "blockTag" override if present
            let blockTag = undefined;
            if (args.length === fragment.inputs.length + 1 && typeof (args[args.length - 1]) === "object") {
                const overrides = shallowCopy(args.pop());
                if (overrides.blockTag != null) {
                    blockTag = yield overrides.blockTag;
                }
                delete overrides.blockTag;
                args.push(overrides);
            }
            // If the contract was just deployed, wait until it is mined
            if (contract.deployTransaction != null) {
                yield contract._deployed(blockTag);
            }
            // Call a node and get the result
            const tx = yield populateTransaction(contract, fragment, args);
            const result = yield signerOrProvider.call(tx, blockTag);
            try {
                let value = contract.interface.decodeFunctionResult(fragment, result);
                if (collapseSimple && fragment.outputs.length === 1) {
                    value = value[0];
                }
                return value;
            }
            catch (error) {
                if (error.code === Logger.errors.CALL_EXCEPTION) {
                    error.address = contract.address;
                    error.args = args;
                    error.transaction = tx;
                }
                throw error;
            }
        });
    };
}
function buildSend(contract, fragment) {
    return function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!contract.signer) {
                logger.throwError("sending a transaction requires a signer", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "sendTransaction"
                });
            }
            // If the contract was just deployed, wait until it is mined
            if (contract.deployTransaction != null) {
                yield contract._deployed();
            }
            const txRequest = yield populateTransaction(contract, fragment, args);
            const tx = yield contract.signer.sendTransaction(txRequest);
            // Tweak the tx.wait so the receipt has extra properties
            addContractWait(contract, tx);
            return tx;
        });
    };
}
function buildDefault(contract, fragment, collapseSimple) {
    if (fragment.constant) {
        return buildCall(contract, fragment, collapseSimple);
    }
    return buildSend(contract, fragment);
}
function getEventTag(filter) {
    if (filter.address && (filter.topics == null || filter.topics.length === 0)) {
        return "*";
    }
    return (filter.address || "*") + "@" + (filter.topics ? filter.topics.map((topic) => {
        if (Array.isArray(topic)) {
            return topic.join("|");
        }
        return topic;
    }).join(":") : "");
}
class RunningEvent {
    constructor(tag, filter) {
        defineReadOnly(this, "tag", tag);
        defineReadOnly(this, "filter", filter);
        this._listeners = [];
    }
    addListener(listener, once) {
        this._listeners.push({ listener: listener, once: once });
    }
    removeListener(listener) {
        let done = false;
        this._listeners = this._listeners.filter((item) => {
            if (done || item.listener !== listener) {
                return true;
            }
            done = true;
            return false;
        });
    }
    removeAllListeners() {
        this._listeners = [];
    }
    listeners() {
        return this._listeners.map((i) => i.listener);
    }
    listenerCount() {
        return this._listeners.length;
    }
    run(args) {
        const listenerCount = this.listenerCount();
        this._listeners = this._listeners.filter((item) => {
            const argsCopy = args.slice();
            // Call the callback in the next event loop
            setTimeout(() => {
                item.listener.apply(this, argsCopy);
            }, 0);
            // Reschedule it if it not "once"
            return !(item.once);
        });
        return listenerCount;
    }
    prepareEvent(event) {
    }
    // Returns the array that will be applied to an emit
    getEmit(event) {
        return [event];
    }
}
class ErrorRunningEvent extends RunningEvent {
    constructor() {
        super("error", null);
    }
}
// @TODO Fragment should inherit Wildcard? and just override getEmit?
//       or have a common abstract super class, with enough constructor
//       options to configure both.
// A Fragment Event will populate all the properties that Wildcard
// will, and additionally dereference the arguments when emitting
class FragmentRunningEvent extends RunningEvent {
    constructor(address, contractInterface, fragment, topics) {
        const filter = {
            address: address
        };
        let topic = contractInterface.getEventTopic(fragment);
        if (topics) {
            if (topic !== topics[0]) {
                logger.throwArgumentError("topic mismatch", "topics", topics);
            }
            filter.topics = topics.slice();
        }
        else {
            filter.topics = [topic];
        }
        super(getEventTag(filter), filter);
        defineReadOnly(this, "address", address);
        defineReadOnly(this, "interface", contractInterface);
        defineReadOnly(this, "fragment", fragment);
    }
    prepareEvent(event) {
        super.prepareEvent(event);
        event.event = this.fragment.name;
        event.eventSignature = this.fragment.format();
        event.decode = (data, topics) => {
            return this.interface.decodeEventLog(this.fragment, data, topics);
        };
        try {
            event.args = this.interface.decodeEventLog(this.fragment, event.data, event.topics);
        }
        catch (error) {
            event.args = null;
            event.decodeError = error;
        }
    }
    getEmit(event) {
        const errors = checkResultErrors(event.args);
        if (errors.length) {
            throw errors[0].error;
        }
        const args = (event.args || []).slice();
        args.push(event);
        return args;
    }
}
// A Wildcard Event will attempt to populate:
//  - event            The name of the event name
//  - eventSignature   The full signature of the event
//  - decode           A function to decode data and topics
//  - args             The decoded data and topics
class WildcardRunningEvent extends RunningEvent {
    constructor(address, contractInterface) {
        super("*", { address: address });
        defineReadOnly(this, "address", address);
        defineReadOnly(this, "interface", contractInterface);
    }
    prepareEvent(event) {
        super.prepareEvent(event);
        try {
            const parsed = this.interface.parseLog(event);
            event.event = parsed.name;
            event.eventSignature = parsed.signature;
            event.decode = (data, topics) => {
                return this.interface.decodeEventLog(parsed.eventFragment, data, topics);
            };
            event.args = parsed.args;
        }
        catch (error) {
            // No matching event
        }
    }
}
class BaseContract {
    constructor(addressOrName, contractInterface, signerOrProvider) {
        // @TODO: Maybe still check the addressOrName looks like a valid address or name?
        //address = getAddress(address);
        defineReadOnly(this, "interface", getStatic(new.target, "getInterface")(contractInterface));
        if (signerOrProvider == null) {
            defineReadOnly(this, "provider", null);
            defineReadOnly(this, "signer", null);
        }
        else if (Signer.isSigner(signerOrProvider)) {
            defineReadOnly(this, "provider", signerOrProvider.provider || null);
            defineReadOnly(this, "signer", signerOrProvider);
        }
        else if (Provider.isProvider(signerOrProvider)) {
            defineReadOnly(this, "provider", signerOrProvider);
            defineReadOnly(this, "signer", null);
        }
        else {
            logger.throwArgumentError("invalid signer or provider", "signerOrProvider", signerOrProvider);
        }
        defineReadOnly(this, "callStatic", {});
        defineReadOnly(this, "estimateGas", {});
        defineReadOnly(this, "functions", {});
        defineReadOnly(this, "populateTransaction", {});
        defineReadOnly(this, "filters", {});
        {
            const uniqueFilters = {};
            Object.keys(this.interface.events).forEach((eventSignature) => {
                const event = this.interface.events[eventSignature];
                defineReadOnly(this.filters, eventSignature, (...args) => {
                    return {
                        address: this.address,
                        topics: this.interface.encodeFilterTopics(event, args)
                    };
                });
                if (!uniqueFilters[event.name]) {
                    uniqueFilters[event.name] = [];
                }
                uniqueFilters[event.name].push(eventSignature);
            });
            Object.keys(uniqueFilters).forEach((name) => {
                const filters = uniqueFilters[name];
                if (filters.length === 1) {
                    defineReadOnly(this.filters, name, this.filters[filters[0]]);
                }
                else {
                    logger.warn(`Duplicate definition of ${name} (${filters.join(", ")})`);
                }
            });
        }
        defineReadOnly(this, "_runningEvents", {});
        defineReadOnly(this, "_wrappedEmits", {});
        if (addressOrName == null) {
            logger.throwArgumentError("invalid contract address or ENS name", "addressOrName", addressOrName);
        }
        defineReadOnly(this, "address", addressOrName);
        if (this.provider) {
            defineReadOnly(this, "resolvedAddress", resolveName(this.provider, addressOrName));
        }
        else {
            try {
                defineReadOnly(this, "resolvedAddress", Promise.resolve(getAddress(addressOrName)));
            }
            catch (error) {
                // Without a provider, we cannot use ENS names
                logger.throwError("provider is required to use ENS name as contract address", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "new Contract"
                });
            }
        }
        // Swallow bad ENS names to prevent Unhandled Exceptions
        this.resolvedAddress.catch((e) => { });
        const uniqueNames = {};
        const uniqueSignatures = {};
        Object.keys(this.interface.functions).forEach((signature) => {
            const fragment = this.interface.functions[signature];
            // Check that the signature is unique; if not the ABI generation has
            // not been cleaned or may be incorrectly generated
            if (uniqueSignatures[signature]) {
                logger.warn(`Duplicate ABI entry for ${JSON.stringify(signature)}`);
                return;
            }
            uniqueSignatures[signature] = true;
            // Track unique names; we only expose bare named functions if they
            // are ambiguous
            {
                const name = fragment.name;
                if (!uniqueNames[`%${name}`]) {
                    uniqueNames[`%${name}`] = [];
                }
                uniqueNames[`%${name}`].push(signature);
            }
            if (this[signature] == null) {
                defineReadOnly(this, signature, buildDefault(this, fragment, true));
            }
            // We do not collapse simple calls on this bucket, which allows
            // frameworks to safely use this without introspection as well as
            // allows decoding error recovery.
            if (this.functions[signature] == null) {
                defineReadOnly(this.functions, signature, buildDefault(this, fragment, false));
            }
            if (this.callStatic[signature] == null) {
                defineReadOnly(this.callStatic, signature, buildCall(this, fragment, true));
            }
            if (this.populateTransaction[signature] == null) {
                defineReadOnly(this.populateTransaction, signature, buildPopulate(this, fragment));
            }
            if (this.estimateGas[signature] == null) {
                defineReadOnly(this.estimateGas, signature, buildEstimate(this, fragment));
            }
        });
        Object.keys(uniqueNames).forEach((name) => {
            // Ambiguous names to not get attached as bare names
            const signatures = uniqueNames[name];
            if (signatures.length > 1) {
                return;
            }
            // Strip off the leading "%" used for prototype protection
            name = name.substring(1);
            const signature = signatures[0];
            // If overwriting a member property that is null, swallow the error
            try {
                if (this[name] == null) {
                    defineReadOnly(this, name, this[signature]);
                }
            }
            catch (e) { }
            if (this.functions[name] == null) {
                defineReadOnly(this.functions, name, this.functions[signature]);
            }
            if (this.callStatic[name] == null) {
                defineReadOnly(this.callStatic, name, this.callStatic[signature]);
            }
            if (this.populateTransaction[name] == null) {
                defineReadOnly(this.populateTransaction, name, this.populateTransaction[signature]);
            }
            if (this.estimateGas[name] == null) {
                defineReadOnly(this.estimateGas, name, this.estimateGas[signature]);
            }
        });
    }
    static getContractAddress(transaction) {
        return getContractAddress(transaction);
    }
    static getInterface(contractInterface) {
        if (Interface.isInterface(contractInterface)) {
            return contractInterface;
        }
        return new Interface(contractInterface);
    }
    // @TODO: Allow timeout?
    deployed() {
        return this._deployed();
    }
    _deployed(blockTag) {
        if (!this._deployedPromise) {
            // If we were just deployed, we know the transaction we should occur in
            if (this.deployTransaction) {
                this._deployedPromise = this.deployTransaction.wait().then(() => {
                    return this;
                });
            }
            else {
                // @TODO: Once we allow a timeout to be passed in, we will wait
                // up to that many blocks for getCode
                // Otherwise, poll for our code to be deployed
                this._deployedPromise = this.provider.getCode(this.address, blockTag).then((code) => {
                    if (code === "0x") {
                        logger.throwError("contract not deployed", Logger.errors.UNSUPPORTED_OPERATION, {
                            contractAddress: this.address,
                            operation: "getDeployed"
                        });
                    }
                    return this;
                });
            }
        }
        return this._deployedPromise;
    }
    // @TODO:
    // estimateFallback(overrides?: TransactionRequest): Promise<BigNumber>
    // @TODO:
    // estimateDeploy(bytecode: string, ...args): Promise<BigNumber>
    fallback(overrides) {
        if (!this.signer) {
            logger.throwError("sending a transactions require a signer", Logger.errors.UNSUPPORTED_OPERATION, { operation: "sendTransaction(fallback)" });
        }
        const tx = shallowCopy(overrides || {});
        ["from", "to"].forEach(function (key) {
            if (tx[key] == null) {
                return;
            }
            logger.throwError("cannot override " + key, Logger.errors.UNSUPPORTED_OPERATION, { operation: key });
        });
        tx.to = this.resolvedAddress;
        return this.deployed().then(() => {
            return this.signer.sendTransaction(tx);
        });
    }
    // Reconnect to a different signer or provider
    connect(signerOrProvider) {
        if (typeof (signerOrProvider) === "string") {
            signerOrProvider = new VoidSigner(signerOrProvider, this.provider);
        }
        const contract = new (this.constructor)(this.address, this.interface, signerOrProvider);
        if (this.deployTransaction) {
            defineReadOnly(contract, "deployTransaction", this.deployTransaction);
        }
        return contract;
    }
    // Re-attach to a different on-chain instance of this contract
    attach(addressOrName) {
        return new (this.constructor)(addressOrName, this.interface, this.signer || this.provider);
    }
    static isIndexed(value) {
        return Indexed.isIndexed(value);
    }
    _normalizeRunningEvent(runningEvent) {
        // Already have an instance of this event running; we can re-use it
        if (this._runningEvents[runningEvent.tag]) {
            return this._runningEvents[runningEvent.tag];
        }
        return runningEvent;
    }
    _getRunningEvent(eventName) {
        if (typeof (eventName) === "string") {
            // Listen for "error" events (if your contract has an error event, include
            // the full signature to bypass this special event keyword)
            if (eventName === "error") {
                return this._normalizeRunningEvent(new ErrorRunningEvent());
            }
            // Listen for any event that is registered
            if (eventName === "event") {
                return this._normalizeRunningEvent(new RunningEvent("event", null));
            }
            // Listen for any event
            if (eventName === "*") {
                return this._normalizeRunningEvent(new WildcardRunningEvent(this.address, this.interface));
            }
            // Get the event Fragment (throws if ambiguous/unknown event)
            const fragment = this.interface.getEvent(eventName);
            return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment));
        }
        // We have topics to filter by...
        if (eventName.topics && eventName.topics.length > 0) {
            // Is it a known topichash? (throws if no matching topichash)
            try {
                const topic = eventName.topics[0];
                if (typeof (topic) !== "string") {
                    throw new Error("invalid topic"); // @TODO: May happen for anonymous events
                }
                const fragment = this.interface.getEvent(topic);
                return this._normalizeRunningEvent(new FragmentRunningEvent(this.address, this.interface, fragment, eventName.topics));
            }
            catch (error) { }
            // Filter by the unknown topichash
            const filter = {
                address: this.address,
                topics: eventName.topics
            };
            return this._normalizeRunningEvent(new RunningEvent(getEventTag(filter), filter));
        }
        return this._normalizeRunningEvent(new WildcardRunningEvent(this.address, this.interface));
    }
    _checkRunningEvents(runningEvent) {
        if (runningEvent.listenerCount() === 0) {
            delete this._runningEvents[runningEvent.tag];
            // If we have a poller for this, remove it
            const emit = this._wrappedEmits[runningEvent.tag];
            if (emit && runningEvent.filter) {
                this.provider.off(runningEvent.filter, emit);
                delete this._wrappedEmits[runningEvent.tag];
            }
        }
    }
    // Subclasses can override this to gracefully recover
    // from parse errors if they wish
    _wrapEvent(runningEvent, log, listener) {
        const event = deepCopy(log);
        event.removeListener = () => {
            if (!listener) {
                return;
            }
            runningEvent.removeListener(listener);
            this._checkRunningEvents(runningEvent);
        };
        event.getBlock = () => { return this.provider.getBlock(log.blockHash); };
        event.getTransaction = () => { return this.provider.getTransaction(log.transactionHash); };
        event.getTransactionReceipt = () => { return this.provider.getTransactionReceipt(log.transactionHash); };
        // This may throw if the topics and data mismatch the signature
        runningEvent.prepareEvent(event);
        return event;
    }
    _addEventListener(runningEvent, listener, once) {
        if (!this.provider) {
            logger.throwError("events require a provider or a signer with a provider", Logger.errors.UNSUPPORTED_OPERATION, { operation: "once" });
        }
        runningEvent.addListener(listener, once);
        // Track this running event and its listeners (may already be there; but no hard in updating)
        this._runningEvents[runningEvent.tag] = runningEvent;
        // If we are not polling the provider, start polling
        if (!this._wrappedEmits[runningEvent.tag]) {
            const wrappedEmit = (log) => {
                let event = this._wrapEvent(runningEvent, log, listener);
                // Try to emit the result for the parameterized event...
                if (event.decodeError == null) {
                    try {
                        const args = runningEvent.getEmit(event);
                        this.emit(runningEvent.filter, ...args);
                    }
                    catch (error) {
                        event.decodeError = error.error;
                    }
                }
                // Always emit "event" for fragment-base events
                if (runningEvent.filter != null) {
                    this.emit("event", event);
                }
                // Emit "error" if there was an error
                if (event.decodeError != null) {
                    this.emit("error", event.decodeError, event);
                }
            };
            this._wrappedEmits[runningEvent.tag] = wrappedEmit;
            // Special events, like "error" do not have a filter
            if (runningEvent.filter != null) {
                this.provider.on(runningEvent.filter, wrappedEmit);
            }
        }
    }
    queryFilter(event, fromBlockOrBlockhash, toBlock) {
        const runningEvent = this._getRunningEvent(event);
        const filter = shallowCopy(runningEvent.filter);
        if (typeof (fromBlockOrBlockhash) === "string" && isHexString(fromBlockOrBlockhash, 32)) {
            if (toBlock != null) {
                logger.throwArgumentError("cannot specify toBlock with blockhash", "toBlock", toBlock);
            }
            filter.blockHash = fromBlockOrBlockhash;
        }
        else {
            filter.fromBlock = ((fromBlockOrBlockhash != null) ? fromBlockOrBlockhash : 0);
            filter.toBlock = ((toBlock != null) ? toBlock : "latest");
        }
        return this.provider.getLogs(filter).then((logs) => {
            return logs.map((log) => this._wrapEvent(runningEvent, log, null));
        });
    }
    on(event, listener) {
        this._addEventListener(this._getRunningEvent(event), listener, false);
        return this;
    }
    once(event, listener) {
        this._addEventListener(this._getRunningEvent(event), listener, true);
        return this;
    }
    emit(eventName, ...args) {
        if (!this.provider) {
            return false;
        }
        const runningEvent = this._getRunningEvent(eventName);
        const result = (runningEvent.run(args) > 0);
        // May have drained all the "once" events; check for living events
        this._checkRunningEvents(runningEvent);
        return result;
    }
    listenerCount(eventName) {
        if (!this.provider) {
            return 0;
        }
        if (eventName == null) {
            return Object.keys(this._runningEvents).reduce((accum, key) => {
                return accum + this._runningEvents[key].listenerCount();
            }, 0);
        }
        return this._getRunningEvent(eventName).listenerCount();
    }
    listeners(eventName) {
        if (!this.provider) {
            return [];
        }
        if (eventName == null) {
            const result = [];
            for (let tag in this._runningEvents) {
                this._runningEvents[tag].listeners().forEach((listener) => {
                    result.push(listener);
                });
            }
            return result;
        }
        return this._getRunningEvent(eventName).listeners();
    }
    removeAllListeners(eventName) {
        if (!this.provider) {
            return this;
        }
        if (eventName == null) {
            for (const tag in this._runningEvents) {
                const runningEvent = this._runningEvents[tag];
                runningEvent.removeAllListeners();
                this._checkRunningEvents(runningEvent);
            }
            return this;
        }
        // Delete any listeners
        const runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeAllListeners();
        this._checkRunningEvents(runningEvent);
        return this;
    }
    off(eventName, listener) {
        if (!this.provider) {
            return this;
        }
        const runningEvent = this._getRunningEvent(eventName);
        runningEvent.removeListener(listener);
        this._checkRunningEvents(runningEvent);
        return this;
    }
    removeListener(eventName, listener) {
        return this.off(eventName, listener);
    }
}
class Contract extends BaseContract {
}

function staticMiddleEllipsis(_ref) {
  var text = _ref.text,
    _ref$leftSideLength = _ref.leftSideLength,
    leftSideLength = _ref$leftSideLength === void 0 ? 4 : _ref$leftSideLength,
    _ref$rightSideLength = _ref.rightSideLength,
    rightSideLength = _ref$rightSideLength === void 0 ? 4 : _ref$rightSideLength;
  var isTooShort = leftSideLength + rightSideLength >= text.length;
  if (isTooShort) return text;
  var leftSide = text.substring(0, leftSideLength);
  var rightSide = text.substring(text.length - rightSideLength, text.length);
  return "".concat(leftSide, "...").concat(rightSide);
}

var _excluded = ["leftSideLength", "rightSideLength", "text", "rc", "sx"],
  _excluded2 = ["use"],
  _excluded3 = ["size"],
  _excluded4 = ["weight"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function EllipsizedText(_ref) {
  var _ref$leftSideLength = _ref.leftSideLength,
    leftSideLength = _ref$leftSideLength === void 0 ? 8 : _ref$leftSideLength,
    _ref$rightSideLength = _ref.rightSideLength,
    rightSideLength = _ref$rightSideLength === void 0 ? 4 : _ref$rightSideLength,
    text = _ref.text,
    _ref$rc = _ref.rc,
    rc = _ref$rc === void 0 ? jsx("span", {}) : _ref$rc,
    sx = _ref.sx,
    props = _objectWithoutProperties(_ref, _excluded);
  var _ref2 = "use" in props ? props : _objectSpread(_objectSpread({}, props), {}, {
      use: undefined
    }),
    use = _ref2.use,
    propsMinusUse = _objectWithoutProperties(_ref2, _excluded2);
  var _ref3 = "size" in propsMinusUse ? propsMinusUse : _objectSpread({
      size: undefined
    }, propsMinusUse),
    size = _ref3.size,
    propsMinusUseAndSize = _objectWithoutProperties(_ref3, _excluded3);
  var _ref4 = "weight" in propsMinusUseAndSize ? propsMinusUseAndSize : _objectSpread({
      weight: undefined
    }, propsMinusUseAndSize),
    weight = _ref4.weight,
    propsMinusUseSizeAndWeight = _objectWithoutProperties(_ref4, _excluded4);
  var content = staticMiddleEllipsis({
    leftSideLength: leftSideLength,
    rightSideLength: rightSideLength,
    text: text
  });
  return cloneElementWithCssProp(use || jsx(Body, {
    size: size,
    weight: weight
  }), _objectSpread(_objectSpread({}, propsMinusUseSizeAndWeight), {}, {
    rc: rc,
    sx: sx,
    children: content
  }));
}
EllipsizedText.displayName = "EllipsizedText";

async function connectToProvider(checkout, provider, changeAccount) {
    let connected = false;
    let web3Provider = provider;
    try {
        const { isConnected } = await checkout.checkIsWalletConnected({ provider });
        connected = isConnected;
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        throw error;
    }
    if (!connected || changeAccount) {
        try {
            const { provider: connectedProvider } = await checkout.connect({
                provider,
                requestWalletPermissions: changeAccount,
            });
            web3Provider = connectedProvider;
            connected = true;
        }
        catch (error) {
            if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
                // eslint-disable-next-line no-console
                console.log('User rejected request');
            }
            // eslint-disable-next-line no-console
            console.error(error);
            throw error;
        }
    }
    return web3Provider;
}

const CACHE_DATA_TTL = 60; // seconds
/**
 * Checkout API class provides a client abstraction for the Checkout API.
 */
class CheckoutApi {
    url;
    ttl;
    env;
    cacheMap;
    setCache(key, data) {
        this.cacheMap[key] = { data, ttl: new Date().getTime() + this.ttl * 1000 };
    }
    getCache(key) {
        const d = this.cacheMap[key];
        if (!d || d.ttl <= new Date().getTime())
            return null;
        return d.data;
    }
    /**
     * Checkout API constructor
     * @param env target chain
     * @param ttl cache TTL
     */
    constructor(params) {
        this.env = params.env;
        this.url = `${IMMUTABLE_API_BASE_URL[this.env]}/checkout`;
        this.cacheMap = {};
        this.ttl = params.ttl !== undefined ? params.ttl : CACHE_DATA_TTL;
    }
    /**
     * isHttpError verifies if the error is a HTTP error
     * @param err error to evaluate
     */
    static isHttpError = (err) => 'code' in err;
    /**
     * getTransactions fetches a list of blockchain transactions.
     * @param txType transaction type
     * @param fromAddress transactions executed from address
     */
    async getTransactions(params) {
        const { txType, fromAddress } = params;
        try {
            const url = `${this.url}/v1/transactions?from_address=${fromAddress}&tx_type=${txType}`;
            // Cache response data to prevent unnecessary requests
            const cached = this.getCache(url);
            if (cached)
                return Promise.resolve(cached);
            const response = await axios.get(url);
            if (response.status >= 400) {
                return Promise.reject({
                    code: response.status,
                    message: response.statusText,
                });
            }
            const { data } = response;
            this.setCache(url, data);
            return Promise.resolve(data);
        }
        catch (err) {
            let code = HttpStatusCode.InternalServerError;
            let message = 'InternalServerError';
            if (axios.isAxiosError(err)) {
                code = err.response?.status || code;
                message = err.message;
            }
            return Promise.reject({ code, message });
        }
    }
}

/* eslint-disable @typescript-eslint/naming-convention */
var TransactionType;
(function (TransactionType) {
    TransactionType["BRIDGE"] = "bridge";
})(TransactionType || (TransactionType = {}));
const TransactionStatus = {
    IN_PROGRESS: 'in_progress',
    WITHDRAWAL_PENDING: 'withdrawal_pending',
};

const initialBridgeState = {
    web3Provider: null,
    walletProviderName: null,
    from: null,
    to: null,
    tokenBridge: null,
    tokenBalances: [],
    allowedTokens: [],
    token: null,
    amount: '0',
};
var BridgeActions;
(function (BridgeActions) {
    BridgeActions["SET_WALLETS_AND_NETWORKS"] = "SET_WALLETS_AND_NETWORKS";
    BridgeActions["SET_WALLET_PROVIDER_NAME"] = "SET_WALLET_PROVIDER_NAME";
    BridgeActions["SET_PROVIDER"] = "SET_PROVIDER";
    BridgeActions["SET_TOKEN_BRIDGE"] = "SET_TOKEN_BRIDGE";
    BridgeActions["SET_TOKEN_BALANCES"] = "SET_TOKEN_BALANCES";
    BridgeActions["SET_ALLOWED_TOKENS"] = "SET_ALLOWED_TOKENS";
    BridgeActions["SET_TOKEN_AND_AMOUNT"] = "SET_TOKEN_AND_AMOUNT";
})(BridgeActions || (BridgeActions = {}));
// eslint-disable-next-line @typescript-eslint/naming-convention
const BridgeContext = reactExports.createContext({
    bridgeState: { ...initialBridgeState, checkout: {} },
    bridgeDispatch: () => { },
});
BridgeContext.displayName = 'BridgeContext'; // help with debugging Context in browser
const bridgeReducer = (state, action) => {
    switch (action.payload.type) {
        case BridgeActions.SET_WALLETS_AND_NETWORKS:
            return {
                ...state,
                from: action.payload.from,
                to: action.payload.to,
            };
        case BridgeActions.SET_WALLET_PROVIDER_NAME:
            return {
                ...state,
                walletProviderName: action.payload.walletProviderName,
            };
        case BridgeActions.SET_PROVIDER:
            return {
                ...state,
                web3Provider: action.payload.web3Provider,
            };
        case BridgeActions.SET_TOKEN_BRIDGE:
            return {
                ...state,
                tokenBridge: action.payload.tokenBridge,
            };
        case BridgeActions.SET_TOKEN_BALANCES:
            return {
                ...state,
                tokenBalances: action.payload.tokenBalances,
            };
        case BridgeActions.SET_ALLOWED_TOKENS:
            return {
                ...state,
                allowedTokens: action.payload.allowedTokens,
            };
        case BridgeActions.SET_TOKEN_AND_AMOUNT:
            return {
                ...state,
                token: action.payload.token,
                amount: action.payload.amount,
            };
        default:
            return state;
    }
};

const sendBridgeTransactionSentEvent = (eventTarget, transactionHash) => {
    const successEvent = new CustomEvent(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, {
        detail: {
            type: BridgeEventType.TRANSACTION_SENT,
            data: {
                transactionHash,
            },
        },
    });
    // eslint-disable-next-line no-console
    console.log('bridge success ', eventTarget, successEvent);
    if (eventTarget !== undefined)
        eventTarget.dispatchEvent(successEvent);
};
const sendBridgeFailedEvent = (eventTarget, reason) => {
    const failedEvent = new CustomEvent(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, {
        detail: {
            type: BridgeEventType.FAILURE,
            data: {
                reason,
                timestamp: new Date().getTime(),
            },
        },
    });
    // eslint-disable-next-line no-console
    console.log('bridge failed ', eventTarget, failedEvent);
    if (eventTarget !== undefined)
        eventTarget.dispatchEvent(failedEvent);
};
function sendBridgeWidgetCloseEvent(eventTarget) {
    const closeWidgetEvent = new CustomEvent(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, {
        detail: {
            type: BridgeEventType.CLOSE_WIDGET,
            data: {},
        },
    });
    // eslint-disable-next-line no-console
    console.log('bridge close ', eventTarget, closeWidgetEvent);
    if (eventTarget !== undefined)
        eventTarget.dispatchEvent(closeWidgetEvent);
}
const sendBridgeClaimWithdrawalSuccessEvent = (eventTarget, transactionHash) => {
    const successEvent = new CustomEvent(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, {
        detail: {
            type: BridgeEventType.CLAIM_WITHDRAWAL_SUCCESS,
            data: {
                transactionHash,
            },
        },
    });
    // eslint-disable-next-line no-console
    console.log('bridge claim withdrawal success event:', eventTarget, successEvent);
    if (eventTarget !== undefined)
        eventTarget.dispatchEvent(successEvent);
};
const sendBridgeClaimWithdrawalFailedEvent = (eventTarget, transactionHash, reason) => {
    const failedEvent = new CustomEvent(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, {
        detail: {
            type: BridgeEventType.CLAIM_WITHDRAWAL_FAILURE,
            data: {
                transactionHash,
                reason,
                timestamp: new Date().getTime(),
            },
        },
    });
    // eslint-disable-next-line no-console
    console.log('bridge claim withdrawal failed event:', eventTarget, failedEvent);
    if (eventTarget !== undefined)
        eventTarget.dispatchEvent(failedEvent);
};

function Shimmer() {
    return (jsxs(Stack, { sx: { gap: 'base.spacing.x2' }, children: [jsx(ShimmerBox, { sx: {
                    h: 'base.spacing.x4',
                    w: 'base.spacing.x32',
                    mt: 'base.spacing.x2',
                } }), jsx(MenuItem, { shimmer: true, emphasized: true, size: "small" }), jsx(MenuItem, { shimmer: true, emphasized: true, size: "small" }), jsx(MenuItem, { shimmer: true, emphasized: true, size: "small" })] }));
}

const transactionsContainerStyle = {
    px: 'base.spacing.x4',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
};
const transactionsListContainerStyle = {
    flexGrow: '1',
    flexShrink: '0',
    flexBasis: '0',
};
const supportBoxContainerStyle = {
    flexGrow: '0',
    flexShrink: '1',
    mt: 'base.spacing.x2',
};

const containerStyle = {
    bg: 'base.color.translucent.emphasis.100',
    borderRadius: 'base.borderRadius.x4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '100%',
    px: 'base.spacing.x5',
};

function EmptyStateNotConnected({ openWalletDrawer }) {
    const { t } = useTranslation();
    return (jsxs(Box, { sx: containerStyle, children: [jsx(Body, { sx: { mb: 'base.spacing.x8' }, children: t('views.TRANSACTIONS.status.emptyState.notConnected.body') }), jsx(Button, { variant: "secondary", size: "medium", testId: "transactions-connect-wallet-button", onClick: openWalletDrawer, children: t('views.TRANSACTIONS.status.emptyState.notConnected.buttonText') })] }));
}

const supportMessageBoxStyle = {
    backgroundColor: 'base.color.neutral.800',
    px: 'base.spacing.x4',
    p: 'base.spacing.x5',
    borderRadius: 'base.borderRadius.x6',
};
const bodyStyle = {
    color: 'base.color.text.body.secondary',
};

function SupportMessage({ checkout, isPassport, }) {
    const { t } = useTranslation();
    const [passportLink, setPassportLink] = reactExports.useState('');
    reactExports.useEffect(() => {
        if (!checkout)
            return;
        setPassportLink(PASSPORT_URL[checkout.config.environment]);
    }, [checkout]);
    return (jsx(Box, { sx: supportMessageBoxStyle, children: jsxs(Box, { sx: {
                display: 'flex',
                flexDirection: 'column',
            }, children: [jsxs(Box, { children: [jsx(Body, { size: "small", children: t('views.TRANSACTIONS.support.body1') }), jsxs(Body, { size: "small", sx: bodyStyle, children: [t('views.TRANSACTIONS.support.body2'), jsx(Link, { size: "small", rc: jsx("a", { target: "_blank", href: t('views.TRANSACTIONS.support.supportLink'), rel: "noreferrer" }), children: t('views.TRANSACTIONS.support.body3') })] })] }), isPassport && (jsxs(Body, { size: "small", sx: bodyStyle, children: [t('views.TRANSACTIONS.support.passport.body1'), ' ', jsx(Link, { size: "small", rc: jsx("a", { target: "_blank", href: passportLink, rel: "noreferrer" }), children: t('views.TRANSACTIONS.support.passport.body2') })] }))] }) }));
}

const containerStyles$4 = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 'base.borderRadius.x4',
    bg: 'base.color.translucent.emphasis.100',
};
const actionsContainerStyles = {
    p: 'base.spacing.x3',
    d: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
};
const actionsLayoutStyles = {
    display: 'flex',
    flexGrow: '1',
    alignItems: 'center',
    gap: 'base.spacing.x2',
};

function TransactionDetails({ transaction, environment }) {
    const fromChain = getChainIdBySlug(transaction.details.from_chain);
    const toChain = getChainIdBySlug(transaction.details.to_chain);
    return (jsxs(Box, { sx: {
            display: 'flex',
            px: 'base.spacing.x4',
            gap: 'base.spacing.x2',
        }, children: [jsx(FramedImage, { sx: {
                    w: 'base.icon.size.400',
                    h: 'base.icon.size.400',
                }, use: (jsx("img", { src: getChainImage(environment, fromChain), alt: networkName[fromChain] })) }), jsxs(Box, { sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: '1',
                }, children: [jsx(Body, { size: "xxSmall", sx: { color: 'base.color.translucent.standard.900' }, children: networkName[fromChain] }), jsx(EllipsizedText, { size: "xxSmall", sx: { color: 'base.color.translucent.standard.600' }, text: transaction.details.from_address })] }), jsx(Box, { sx: { flexGrow: '1' } }), jsx(Icon, { icon: "ArrowForward", sx: {
                    w: 'base.icon.size.250',
                    fill: 'base.color.brand.4',
                } }), jsx(Box, { sx: { flexGrow: '1' } }), jsx(FramedImage, { sx: {
                    w: 'base.icon.size.400',
                    h: 'base.icon.size.400',
                }, use: (jsx("img", { src: getChainImage(environment, toChain), alt: networkName[toChain] })) }), jsxs(Box, { sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: '1',
                }, children: [jsx(Body, { size: "xxSmall", sx: { color: 'base.color.translucent.standard.900' }, children: networkName[toChain] }), jsx(EllipsizedText, { size: "xxSmall", sx: { color: 'base.color.translucent.standard.600' }, text: transaction.details.to_address })] })] }));
}

function TransactionItem({ label, details, transaction, fiatAmount, amount, icon, defaultTokenImage, environment, }) {
    const { track } = useAnalytics();
    const txnDetailsLink = reactExports.useMemo(() => `${details.link}${details.hash}`, [details]);
    const handleDetailsLinkClick = (event, linkDetail) => {
        event.stopPropagation(); // prevent expanding accordian
        track({
            userJourney: UserJourney.BRIDGE,
            screen: 'TransactionItem',
            control: 'Details',
            controlType: 'Link',
            extras: {
                linkDetail,
            },
        });
    };
    return (jsx(Box, { testId: `transaction-item-${transaction.blockchain_metadata.transaction_hash}`, sx: containerStyles$4, children: jsxs(Accordion, { chevronSide: "right", sx: {
                button: {
                    p: 'base.spacing.x1',
                },
                article: {
                    pr: 'base.spacing.x10',
                },
            }, onExpandChange: (expanded) => expanded
                && track({
                    userJourney: UserJourney.BRIDGE,
                    screen: 'TransactionItem',
                    control: 'Accordion',
                    controlType: 'Button',
                }), children: [jsx(Accordion.TargetLeftSlot, { sx: { pr: 'base.spacing.x2' }, children: jsxs(MenuItem, { size: "xSmall", children: [jsx(MenuItem.FramedImage, { circularFrame: true, use: (jsx(TokenImage, { src: icon, name: label, defaultImage: defaultTokenImage })) }), jsx(MenuItem.Label, { children: label }), jsx(MenuItem.Caption, { children: jsx(Link, { size: "xSmall", rc: (jsx("a", { target: "_blank", href: txnDetailsLink, rel: "noreferrer", onClick: (e) => handleDetailsLinkClick(e, details) })), children: details.text }) }), jsx(MenuItem.PriceDisplay, { fiatAmount: fiatAmount, price: amount })] }) }), jsxs(Accordion.ExpandedContent, { sx: {
                        pr: '0',
                        pl: '0',
                        mb: 'base.spacing.x3',
                        gap: '0',
                    }, children: [jsx(Divider, { size: "xSmall", sx: {
                                px: 'base.spacing.x2',
                            } }), jsx(TransactionDetails, { transaction: transaction, environment: environment })] })] }) }));
}

const transactionsListStyle = (showPassportLink) => {
    let height = 440;
    if (showPassportLink) {
        height -= 20;
    }
    return {
        backgroundColor: 'base.color.neutral.800',
        px: 'base.spacing.x4',
        pt: 'base.spacing.x5',
        pb: 'base.spacing.x4',
        borderRadius: 'base.borderRadius.x6',
        h: `${height}px`,
        w: '100%',
        overflowY: 'scroll',
    };
};
const containerStyles$3 = {
    borderRadius: 'base.borderRadius.x4',
    display: 'flex',
    flexDirection: 'column',
    gap: 'base.spacing.x5',
};

function TransactionItemWithdrawPending({ label, transaction, fiatAmount, amount, icon, defaultTokenImage, environment, }) {
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { track } = useAnalytics();
    const translation = useTranslation();
    const dateNowUnixMs = reactExports.useMemo(() => new Date().getTime(), []);
    const withdrawalReadyDate = reactExports.useMemo(() => (transaction.details.current_status.withdrawal_ready_at
        ? new Date(transaction.details.current_status.withdrawal_ready_at)
        : undefined), [transaction]);
    const requiresWithdrawalClaim = transaction.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING;
    const relativeTimeFormat = new Intl.RelativeTimeFormat(translation[1].language || 'en', { numeric: 'auto' });
    const delayTimeString = reactExports.useMemo(() => {
        if (!requiresWithdrawalClaim || withdrawalReadyDate === undefined)
            return '';
        const timeDiffMins = (withdrawalReadyDate.getTime() - dateNowUnixMs) / (60 * 1000);
        if (timeDiffMins <= 1)
            return 'in 1 minute';
        if (timeDiffMins < 60) {
            return relativeTimeFormat.format(Math.ceil(timeDiffMins), 'minute');
        }
        const timeDiffHours = timeDiffMins / 60; // hours
        if (timeDiffMins < 60 * 24) {
            return relativeTimeFormat.format(Math.ceil(timeDiffHours), 'hour');
        }
        const timeDiffDays = timeDiffHours / 24; // days
        return relativeTimeFormat.format(Math.ceil(timeDiffDays), 'day');
    }, [dateNowUnixMs, translation[1].language]);
    const withdrawalReadyToClaim = withdrawalReadyDate ? withdrawalReadyDate.getTime() < dateNowUnixMs : false;
    const actionMessage = reactExports.useMemo(() => (withdrawalReadyToClaim === true
        ? translation.t('views.TRANSACTIONS.status.withdrawalPending.withdrawalReadyText')
        : `${translation.t('views.TRANSACTIONS.status.withdrawalPending.withdrawalDelayText')} ${delayTimeString}`), [delayTimeString, translation[1].language]);
    const handleWithdrawalClaimClick = () => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: BridgeWidgetViews.CLAIM_WITHDRAWAL,
                    transaction,
                },
            },
        });
    };
    return (jsxs(Box, { testId: `transaction-item-${transaction.blockchain_metadata.transaction_hash}`, sx: containerStyles$4, children: [requiresWithdrawalClaim && (jsxs(Fragment, { children: [jsxs(Box, { sx: actionsContainerStyles, children: [jsxs(Box, { sx: actionsLayoutStyles, children: [jsx(Icon, { icon: "Alert", variant: "bold", sx: {
                                            fill: withdrawalReadyToClaim
                                                ? 'base.color.status.fatal.bright'
                                                : 'base.color.status.attention.bright',
                                            w: 'base.icon.size.200',
                                        } }), jsx(Body, { testId: `transaction-item-${transaction.blockchain_metadata.transaction_hash}-action-message`, size: "xSmall", sx: { color: 'base.color.text.body.secondary' }, children: actionMessage })] }), requiresWithdrawalClaim && withdrawalReadyToClaim && (jsx(Button, { testId: `transaction-item-${transaction.blockchain_metadata.transaction_hash}-action-button`, variant: "primary", size: "small", onClick: handleWithdrawalClaimClick, children: translation.t('views.TRANSACTIONS.status.withdrawalPending.actionButtonText') }))] }), jsx(Divider, { size: "small", sx: { color: 'base.color.translucent.emphasis.300', opacity: 0.1 } })] })), jsxs(Accordion, { chevronSide: "right", sx: {
                    button: {
                        p: 'base.spacing.x1',
                    },
                    article: {
                        pr: 'base.spacing.x10',
                    },
                    borderTopRightRadius: '0',
                    borderTopLeftRadius: '0',
                }, onExpandChange: (expanded) => expanded
                    && track({
                        userJourney: UserJourney.BRIDGE,
                        screen: 'TransactionItem',
                        control: 'Accordion',
                        controlType: 'Button',
                    }), children: [jsx(Accordion.TargetLeftSlot, { sx: { pr: 'base.spacing.x2' }, children: jsxs(MenuItem, { size: "xSmall", children: [jsx(MenuItem.FramedImage, { circularFrame: true, use: (jsx(TokenImage, { src: icon, name: label, defaultImage: defaultTokenImage })) }), jsx(MenuItem.Label, { children: label }), jsx(MenuItem.Caption, { children: translation.t('views.TRANSACTIONS.status.withdrawalPending.caption') }), jsx(MenuItem.PriceDisplay, { fiatAmount: fiatAmount, price: amount })] }) }), jsxs(Accordion.ExpandedContent, { sx: {
                            pr: '0',
                            pl: '0',
                            mb: 'base.spacing.x3',
                            gap: '0',
                        }, children: [jsx(Divider, { size: "xSmall", sx: {
                                    px: 'base.spacing.x2',
                                } }), jsx(TransactionDetails, { transaction: transaction, environment: environment })] })] })] }));
}

const headingStyles = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 'base.spacing.x2',
    pb: 'base.spacing.x4',
};
const wcWalletLogoWrapperStyles = {
    position: 'relative',
    pr: 'base.spacing.x2',
};
const wcWalletLogoStyles$2 = {
    width: 'base.icon.size.400',
};
const wcStickerLogoStyles$2 = {
    position: 'absolute',
    top: '-6px',
    left: '18px',
    width: '20px',
    padding: '2px',
    backgroundColor: 'base.color.translucent.inverse.900',
    borderRadius: 'base.borderRadius.x2',
};
const rawImageStyle$1 = {
    backgroundColor: 'transparent',
    width: 'base.icon.size.400',
    height: 'base.icon.size.400',
    marginRight: 'base.spacing.x1',
    padding: 'base.spacing.x1',
};

function ChangeWallet({ onChangeWalletClick }) {
    const { t } = useTranslation();
    const { bridgeState: { from }, } = reactExports.useContext(BridgeContext);
    const [walletLogoUrl, setWalletLogoUrl] = reactExports.useState(undefined);
    const [isWalletConnect, setIsWalletConnect] = reactExports.useState(false);
    const { isWalletConnectEnabled, getWalletLogoUrl } = useWalletConnect();
    const { track } = useAnalytics();
    const walletAddress = from?.walletAddress || '';
    const walletProviderInfo = from?.walletProviderInfo;
    const handleChangeWalletClick = () => {
        track({
            userJourney: UserJourney.BRIDGE,
            screen: BridgeWidgetViews.TRANSACTIONS,
            controlType: 'Button',
            control: 'Pressed',
        });
        onChangeWalletClick();
    };
    reactExports.useEffect(() => {
        if (isWalletConnectEnabled) {
            const isProviderWalletConnect = isWalletConnectProvider(from?.web3Provider);
            setIsWalletConnect(isProviderWalletConnect);
            if (isProviderWalletConnect) {
                (async () => {
                    setWalletLogoUrl(await getWalletLogoUrl());
                })();
            }
        }
    }, [isWalletConnectEnabled, from]);
    return (jsxs(Box, { sx: headingStyles, children: [jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 'base.spacing.x1' }, children: [(isWalletConnect && walletLogoUrl) ? (jsxs(Box, { sx: wcWalletLogoWrapperStyles, children: [jsx(FramedImage, { sx: wcWalletLogoStyles$2, use: (jsx("img", { src: walletLogoUrl, alt: "walletconnect" })) }), jsx(Logo, { logo: "WalletConnectSymbol", sx: wcStickerLogoStyles$2 })] })) : (walletProviderInfo && (jsx(RawImage, { src: walletProviderInfo.icon, alt: walletProviderInfo.name, sx: rawImageStyle$1 }))), jsx(EllipsizedText, { leftSideLength: 6, rightSideLength: 4, text: walletAddress })] }), jsx(Button, { size: "small", variant: "tertiary", onClick: handleChangeWalletClick, children: t('views.TRANSACTIONS.changeWallet.buttonText') })] }));
}

function TransactionList({ checkout, transactions, knownTokenMap, isPassport, defaultTokenImage, changeWallet, }) {
    const { cryptoFiatState } = reactExports.useContext(CryptoFiatContext);
    const { t } = useTranslation();
    const [link, setLink] = reactExports.useState('');
    const { environment } = checkout.config;
    reactExports.useEffect(() => {
        if (!checkout)
            return;
        setLink(AXELAR_SCAN_URL[checkout.config.environment]);
    }, [checkout]);
    const sortWithdrawalPendingFirst = reactExports.useCallback((txnA, txnB) => {
        if (txnA.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING
            && txnB.details.current_status.status !== TransactionStatus.WITHDRAWAL_PENDING)
            return -1;
        if (txnA.details.current_status.status === txnB.details.current_status.status)
            return 0;
        return 1;
    }, []);
    const getTransactionItemIcon = reactExports.useCallback((transaction) => {
        if (isNativeToken(transaction.details.from_token_address)) {
            // Map transaction chain slug to native symbol icon asset
            return getTokenImageByAddress(checkout.config.environment, getNativeSymbolByChainSlug(transaction.details.from_chain));
        }
        return getTokenImageByAddress(checkout.config.environment, transaction.details.from_token_address);
    }, [checkout]);
    return (jsxs(Box, { sx: transactionsListStyle(isPassport), children: [jsx(ChangeWallet, { onChangeWalletClick: changeWallet }), jsx(Box, { testId: "move-transaction-list", sx: containerStyles$3, children: transactions
                    .sort(sortWithdrawalPendingFirst)
                    .map((transaction) => {
                    const hash = transaction.blockchain_metadata.transaction_hash;
                    const tokens = knownTokenMap[transaction.details.from_chain];
                    const token = tokens[transaction.details.from_token_address.toLowerCase()];
                    const amount = formatUnits(transaction.details.amount, token.decimals);
                    const fiat = calculateCryptoToFiat(amount, token.symbol, cryptoFiatState.conversions);
                    if (transaction.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING) {
                        return (jsx(TransactionItemWithdrawPending, { label: token.symbol, transaction: transaction, fiatAmount: `${t('views.TRANSACTIONS.fiatPricePrefix')}${fiat}`, amount: amount, icon: getTransactionItemIcon(transaction), defaultTokenImage: defaultTokenImage, environment: environment }, hash));
                    }
                    return (jsx(TransactionItem, { label: token.symbol, details: { text: t('views.TRANSACTIONS.status.inProgress.stepInfo'), link, hash }, transaction: transaction, fiatAmount: `${t('views.TRANSACTIONS.fiatPricePrefix')}${fiat}`, amount: amount, icon: getTransactionItemIcon(transaction), defaultTokenImage: defaultTokenImage, environment: environment }, hash));
                }) })] }));
}

const containerStyles$2 = {
    backgroundColor: 'base.color.neutral.800',
    px: 'base.spacing.x4',
    pt: 'base.spacing.x5',
    pb: 'base.spacing.x4',
    borderRadius: 'base.borderRadius.x6',
    h: '100%',
    w: '100%',
    display: 'flex',
    flexDirection: 'column',
};
const noTransactionsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'base.spacing.x5',
    flex: 1,
};
const noTransactionsBodyStyle = {
    mb: 'base.spacing.x8',
    color: 'base.color.text.body.secondary',
};
const passportBodyStyle = {
    color: 'base.color.text.body.secondary',
};

function NoTransactions({ checkout, isPassport, changeWallet, }) {
    const { page } = useAnalytics();
    const { t } = useTranslation();
    const [passportLink, setPassportLink] = reactExports.useState('');
    reactExports.useEffect(() => {
        if (!checkout)
            return;
        setPassportLink(PASSPORT_URL[checkout.config.environment]);
    }, [checkout]);
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.BRIDGE,
            screen: 'NoTransactions',
        });
    }, []);
    return (jsxs(Box, { sx: containerStyles$2, children: [jsx(ChangeWallet, { onChangeWalletClick: changeWallet }), jsxs(Box, { sx: noTransactionsContainerStyle, children: [jsx(Body, { size: "small", sx: noTransactionsBodyStyle, children: t('views.TRANSACTIONS.status.noTransactions.body') }), isPassport && (jsxs(Body, { size: "small", sx: passportBodyStyle, children: [t('views.TRANSACTIONS.status.noTransactions.passport.body'), ' ', jsx(Link, { size: "small", rc: jsx("a", { target: "_blank", href: passportLink, rel: "noreferrer" }), children: t('views.TRANSACTIONS.status.noTransactions.passport.link') })] }))] })] }));
}

function Transactions({ defaultTokenImage, onBackButtonClick, }) {
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const { cryptoFiatDispatch } = reactExports.useContext(CryptoFiatContext);
    const { bridgeDispatch, bridgeState: { checkout, from }, } = reactExports.useContext(BridgeContext);
    const { page } = useAnalytics();
    const { t } = useTranslation();
    const { track } = useAnalytics();
    const [loading, setLoading] = reactExports.useState(true);
    const [knownTokenMap, setKnownTokenMap] = reactExports.useState(undefined);
    const [txs, setTxs] = reactExports.useState([]);
    const [showWalletDrawer, setShowWalletDrawer] = reactExports.useState(false);
    const isPassport = isPassportProvider(from?.web3Provider);
    // Fetch the tokens for the root chain using the allowed tokens.
    // In case this list does not have all the tokens, there is logic
    // built into the <TransactionsList /> component to fetch the
    // the missing data.
    const rootChainTokensHashmap = reactExports.useCallback(async () => {
        if (!checkout)
            return {};
        const rootChainId = getL1ChainId(checkout.config);
        try {
            const tokens = (await checkout.getTokenAllowList({
                type: TokenFilterTypes.BRIDGE,
                chainId: rootChainId,
            })).tokens ?? [];
            return tokens.reduce((out, current) => {
                // eslint-disable-next-line no-param-reassign
                out[current.address.toLowerCase()] = current;
                return out;
            }, {});
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return [];
        }
    }, [checkout]);
    // Fetch the tokens for the root chain using the user balances tokens.
    // In case this list does not have all the tokens, there is logic
    // built into the <TransactionsList /> component to fetch the
    // the missing data.
    const childChainTokensHashmap = reactExports.useCallback(async () => {
        if (!from?.web3Provider)
            return {};
        if (!from?.walletAddress)
            return {};
        const childChainId = getL2ChainId(checkout.config);
        try {
            const data = await checkout.getAllBalances({
                provider: from?.web3Provider,
                walletAddress: from?.walletAddress,
                chainId: childChainId,
            });
            return data.balances.reduce((out, current) => {
                // eslint-disable-next-line no-param-reassign
                out[current.token.address.toLowerCase()] = current.token;
                return out;
            }, {});
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return [];
        }
    }, [checkout, from]);
    const getTokensDetails = async (tokensWithChainSlug) => {
        const rootChainName = getChainSlugById(getL1ChainId(checkout.config));
        const childChainName = getChainSlugById(getL2ChainId(checkout.config));
        const [rootData, childData] = await Promise.all([
            rootChainTokensHashmap(),
            childChainTokensHashmap(),
        ]);
        // Fetch the data for the missing tokens: tokensWithChainSlug
        const missingTokens = {};
        Object.entries(tokensWithChainSlug).forEach(([key, value]) => {
            if ((tokensWithChainSlug[key] === rootChainName && !rootData[key])
                || (tokensWithChainSlug[key] === childChainName && !childData[key]))
                missingTokens[key] = value;
        });
        // Root provider is always L1
        const rootProvider = new JsonRpcProvider(checkout.config.networkMap.get(getL1ChainId(checkout.config))?.rpcUrls[0]);
        // Child provider is always L2
        const childProvider = new JsonRpcProvider(checkout.config.networkMap.get(getL2ChainId(checkout.config))?.rpcUrls[0]);
        const rootTokenInfoPromises = [];
        const childTokenInfoPromises = [];
        Object.entries(missingTokens).forEach(([tokenAddress, chainName]) => {
            if (chainName === rootChainName) {
                // Root provider
                rootTokenInfoPromises.push(checkout.getTokenInfo({
                    provider: rootProvider,
                    tokenAddress,
                }));
            }
            else {
                // child provider
                childTokenInfoPromises.push(checkout.getTokenInfo({
                    provider: childProvider,
                    tokenAddress,
                }));
            }
        });
        const rootTokenInfo = await Promise.allSettled(rootTokenInfoPromises);
        const childTokenInfo = await Promise.allSettled(childTokenInfoPromises);
        rootTokenInfo.filter((result) => result.status === 'fulfilled').forEach((result) => {
            const resp = result;
            rootData[resp.value.address.toLowerCase()] = resp.value;
        });
        childTokenInfo.filter((result) => result.status === 'fulfilled').forEach((result) => {
            const resp = result;
            childData[resp.value.address.toLowerCase()] = resp.value;
        });
        const allTokenSymbols = [];
        Object.values(rootData).forEach((token) => allTokenSymbols.push(token.symbol.toLowerCase()));
        Object.values(childData).forEach((token) => allTokenSymbols.push(token.symbol.toLowerCase()));
        cryptoFiatDispatch({
            payload: {
                type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
                tokenSymbols: allTokenSymbols,
            },
        });
        return { [rootChainName]: rootData, [childChainName]: childData };
    };
    const getTransactionsDetails = reactExports.useCallback(async (env, address) => {
        const client = new CheckoutApi({ env });
        return client.getTransactions({
            txType: TransactionType.BRIDGE,
            fromAddress: address,
        });
    }, []);
    const handleWalletChange = reactExports.useCallback(async (event) => {
        track({
            userJourney: UserJourney.BRIDGE,
            screen: 'EmptyStateNotConnected',
            control: 'WalletProvider',
            controlType: 'Select',
            extras: {
                walletProviderName: event.providerDetail.info.name,
            },
        });
        try {
            let changeAccount = false;
            if (event.providerDetail.info.rdns === WalletProviderRdns.METAMASK) {
                changeAccount = true;
            }
            const web3Provider = new Web3Provider(event.provider);
            const connectedProvider = await connectToProvider(checkout, web3Provider, changeAccount);
            const network = await connectedProvider.getNetwork();
            const address = await connectedProvider.getSigner().getAddress();
            setTxs([]);
            bridgeDispatch({
                payload: {
                    type: BridgeActions.SET_WALLETS_AND_NETWORKS,
                    from: {
                        web3Provider: connectedProvider,
                        walletProviderInfo: {
                            ...event.providerDetail.info,
                        },
                        walletAddress: address.toLowerCase(),
                        network: network.chainId,
                    },
                    to: null,
                },
            });
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
        finally {
            setShowWalletDrawer(false);
        }
    }, [checkout]);
    const handleBackButtonClick = () => {
        if (from) {
            bridgeDispatch({
                payload: {
                    type: BridgeActions.SET_WALLETS_AND_NETWORKS,
                    from: {
                        web3Provider: from?.web3Provider,
                        walletAddress: from?.walletAddress,
                        walletProviderInfo: from?.walletProviderInfo,
                        network: from?.network,
                    },
                    to: null,
                },
            });
            bridgeDispatch({
                payload: {
                    type: BridgeActions.SET_TOKEN_AND_AMOUNT,
                    token: null,
                    amount: '',
                },
            });
        }
        onBackButtonClick();
    };
    const fetchData = reactExports.useCallback(async () => {
        if (!from?.walletAddress)
            return undefined;
        const localTxs = await getTransactionsDetails(checkout.config.environment, from?.walletAddress);
        const tokensWithChainSlug = {};
        localTxs.result.forEach((txn) => {
            tokensWithChainSlug[txn.details.from_token_address] = txn.details.from_chain;
        });
        return {
            tokens: await getTokensDetails(tokensWithChainSlug),
            transactions: localTxs.result,
        };
    }, [from, getTransactionsDetails]);
    const { providers } = useInjectedProviders({ checkout });
    const walletOptions = reactExports.useMemo(() => providers, [providers]);
    // Fetch all the data at once
    reactExports.useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await retry(fetchData, DEFAULT_TRANSACTIONS_RETRY_POLICY);
            if (!data) {
                setLoading(false);
                return;
            }
            const knownTxs = data.transactions.filter((txn) => {
                const tokens = data.tokens[txn.details.from_chain];
                if (!tokens)
                    return false;
                const token = tokens[txn.details.from_token_address.toLowerCase()];
                if (!token)
                    return false;
                return true;
            });
            setKnownTokenMap(data.tokens);
            setTxs(knownTxs);
            setLoading(false);
        })();
    }, [from, checkout]);
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.BRIDGE,
            screen: 'Transactions',
        });
    }, []);
    return (jsx(SimpleLayout, { testId: "bridge-view", header: (jsx(HeaderNavigation, { showBack: true, onBackButtonClick: handleBackButtonClick, title: t('views.TRANSACTIONS.layoutHeading'), onCloseButtonClick: () => sendBridgeWidgetCloseEvent(eventTarget) })), footer: jsx(FooterLogo, {}), children: jsxs(Box, { sx: transactionsContainerStyle, children: [jsxs(Box, { sx: transactionsListContainerStyle, children: [!from?.web3Provider && (jsx(EmptyStateNotConnected, { openWalletDrawer: () => setShowWalletDrawer(true) })), from?.web3Provider && loading && jsx(Shimmer, {}), from?.web3Provider
                            && !loading
                            && txs.length > 0
                            && knownTokenMap && (jsx(TransactionList, { checkout: checkout, transactions: txs, knownTokenMap: knownTokenMap, isPassport: isPassport, defaultTokenImage: defaultTokenImage, changeWallet: () => setShowWalletDrawer(true) })), from?.web3Provider && !loading && txs.length === 0 && (jsx(NoTransactions, { checkout: checkout, isPassport: isPassport, changeWallet: () => setShowWalletDrawer(true) }))] }), from?.web3Provider && txs.length > 0 && (jsx(Box, { sx: supportBoxContainerStyle, children: jsx(SupportMessage, { checkout: checkout, isPassport: isPassport }) })), jsx(WalletDrawer, { testId: "select-wallet-drawer", drawerText: {
                        heading: t('views.TRANSACTIONS.walletSelection.heading'),
                    }, showWalletSelectorTarget: false, walletOptions: walletOptions, showDrawer: showWalletDrawer, setShowDrawer: (show) => {
                        setShowWalletDrawer(show);
                    }, onWalletChange: handleWalletChange })] }) }));
}

function ClaimWithdrawalInProgress({ transactionResponse }) {
    const { t } = useTranslation();
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.BRIDGE,
            screen: 'ClaimWithdrawalInProgress',
        });
    }, []);
    reactExports.useEffect(() => {
        if (!transactionResponse)
            return;
        (async () => {
            try {
                const receipt = await transactionResponse.wait();
                if (receipt.status === 1) {
                    viewDispatch({
                        payload: {
                            type: ViewActions.UPDATE_VIEW,
                            view: {
                                type: BridgeWidgetViews.CLAIM_WITHDRAWAL_SUCCESS,
                                transactionHash: receipt.transactionHash,
                            },
                        },
                    });
                    return;
                }
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE,
                            transactionHash: receipt.transactionHash,
                            reason: 'Transaction failed',
                        },
                    },
                });
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE,
                            transactionHash: '',
                            reason: 'Transaction failed',
                        },
                    },
                });
            }
        })();
    }, [transactionResponse]);
    return jsx(LoadingView, { loadingText: t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.loading.text') });
}

function abbreviateAddress(address) {
    if (!address)
        return '';
    return address.substring(0, 6).concat('...').concat(address.substring(address.length - 4));
}

const brigdeWalletWrapperStyles = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingX: 'base.spacing.x4',
};
const bridgeHeadingStyles = {
    paddingTop: 'base.spacing.x10',
    paddingBottom: 'base.spacing.x4',
};
const submitButtonWrapperStyles = {
    display: 'flex',
    flexDirection: 'column',
    paddingY: 'base.spacing.x6',
};

function NetworkItem({ testId, chainId, chainName, onNetworkClick, environment, }) {
    return (jsxs(MenuItem, { testId: `${testId}-network-list-${chainId}`, size: "medium", emphasized: true, onClick: async () => {
            await onNetworkClick(chainId);
        }, sx: { marginBottom: 'base.spacing.x1' }, children: [jsx(MenuItem.FramedImage, { use: jsx("img", { src: getChainImage(environment, chainId), alt: chainName }) }), jsx(MenuItem.Label, { size: "medium", children: chainName })] }));
}

({
    [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
    [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
    [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
    [ChainId.ETHEREUM]: 'base.color.accent.5',
    [ChainId.SEPOLIA]: 'base.color.accent.5',
});
const walletButtonOuterStyles = {
    position: 'relative',
    width: '100%',
    backgroundColor: 'base.color.translucent.emphasis.100',
    borderRadius: 'base.borderRadius.x4',
    paddingX: 'base.spacing.x3',
    paddingY: 'base.spacing.x5',
    display: 'flex',
    flexDirection: 'row',
    gap: 'base.spacing.x4',
    alignItems: 'center',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
        cursor: 'pointer',
        backgroundColor: 'base.color.translucent.emphasis.200',
    },
};
const wcWalletLogoStyles$1 = {
    width: 'base.icon.size.500',
    backgroundColor: 'base.color.translucent.standard.200',
    borderRadius: 'base.borderRadius.x2',
};
const wcStickerLogoStyles$1 = {
    position: 'absolute',
    top: '14px',
    left: '38px',
    width: '28px',
    padding: 'base.spacing.x1',
    backgroundColor: 'base.color.translucent.inverse.900',
    borderRadius: 'base.borderRadius.x2',
};
const walletCaptionStyles = { color: 'base.color.text.body.secondary' };
const networkButtonStyles = {
    paddingY: 'base.spacing.x6',
    borderRadius: 'base.borderRadius.x18',
};

function WalletNetworkButton({ testId, walletProvider, walletProviderDetail, walletAddress, walletName, chainId, disableNetworkButton = false, onWalletClick, onNetworkClick, environment, }) {
    const networkName = getChainNameById(chainId);
    const [walletLogoUrl, setWalletLogoUrl] = reactExports.useState(undefined);
    const [walletConnectPeerName, setWalletConnectPeerName] = reactExports.useState('Other');
    const [isWalletConnect, setIsWalletConnect] = reactExports.useState(false);
    const { isWalletConnectEnabled, getWalletLogoUrl, getWalletName } = useWalletConnect();
    const walletDisplayName = reactExports.useMemo(() => {
        if (walletProviderDetail?.info.rdns === WalletProviderRdns.PASSPORT) {
            return walletName;
        }
        if (isWalletConnectProvider(walletProvider)) {
            return walletConnectPeerName;
        }
        return walletProviderDetail?.info.name;
    }, [walletProviderDetail, walletConnectPeerName, walletProvider]);
    reactExports.useEffect(() => {
        if (isWalletConnectEnabled) {
            const isProviderWalletConnect = isWalletConnectProvider(walletProvider);
            setIsWalletConnect(isProviderWalletConnect);
            if (isProviderWalletConnect) {
                (async () => {
                    setWalletLogoUrl(await getWalletLogoUrl());
                })();
                setWalletConnectPeerName(getWalletName());
            }
        }
    }, [isWalletConnectEnabled, walletProvider, getWalletLogoUrl, getWalletName]);
    const { base } = useTheme();
    return (jsxs(Box, { testId: `${testId}-${walletProviderDetail?.info.rdns}-${chainId}-button-wrapper`, sx: walletButtonOuterStyles, onClick: onWalletClick, children: [isWalletConnect && walletLogoUrl ? (jsxs(Fragment, { children: [jsx(FramedImage, { imageUrl: walletLogoUrl, relativeImageSizeInLayout: base.icon.size[500], alt: "walletconnect", sx: wcWalletLogoStyles$1 }), jsx(Logo, { logo: "WalletConnectSymbol", sx: wcStickerLogoStyles$1 })] })) : (walletProviderDetail && (jsx(RawImage, { src: walletProviderDetail.info.icon, alt: walletProviderDetail.info.name }))), jsxs(Box, { sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                }, children: [jsx(Heading, { size: "xSmall", sx: { textTransform: 'capitalize' }, children: walletDisplayName }), jsx(Body, { size: "xSmall", sx: walletCaptionStyles, children: walletAddress })] }), jsxs(Button, { testId: `${testId}-network-${chainId}-button`, size: "small", disabled: disableNetworkButton, onClick: (e) => {
                    // stop propagation so onWalletClick is not triggered
                    e.stopPropagation();
                    onNetworkClick(e);
                }, variant: "tertiary", sx: networkButtonStyles, children: [jsx(FramedImage, { sx: {
                            w: 'base.icon.size.400',
                            h: 'base.icon.size.400',
                        }, use: (jsx("img", { src: getChainImage(environment, chainId), alt: networkName[chainId] })) }), networkName] })] }));
}

const testId$1 = 'wallet-network-selector';
function WalletAndNetworkSelector() {
    const { t } = useTranslation();
    const { bridgeState: { checkout, from, to }, bridgeDispatch, } = reactExports.useContext(BridgeContext);
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { providers } = useInjectedProviders({ checkout });
    const { environment } = checkout.config;
    const { track } = useAnalytics();
    // add default state from context values
    // if user has clicked back button
    const defaultFromWeb3Provider = from?.web3Provider ?? null;
    const defaultFromNetwork = from?.network ?? null;
    const defaultFromWalletAddress = from?.walletAddress?.toLowerCase() ?? '';
    const defaultFromWallet = from ? {
        provider: defaultFromWeb3Provider,
        providerDetail: {
            provider: defaultFromWeb3Provider,
            info: {
                ...from.walletProviderInfo,
            },
        },
    } : null;
    const defaultToWeb3Provider = to?.web3Provider ?? null;
    const defaultToNetwork = to?.network ?? null;
    const defaultToWalletAddress = to?.walletAddress?.toLowerCase() ?? '';
    const defaultToWallet = to ? {
        provider: defaultToWeb3Provider,
        providerDetail: {
            provider: defaultToWeb3Provider,
            info: {
                ...to.walletProviderInfo,
            },
        },
    } : null;
    // calculating l1/l2 chains to work with based on Checkout environment
    const l1NetworkChainId = getL1ChainId(checkout.config);
    const l1NetworkName = getChainNameById(l1NetworkChainId);
    const imtblZkEvmNetworkChainId = getL2ChainId(checkout.config);
    const imtblZkEvmNetworkName = getChainNameById(imtblZkEvmNetworkChainId);
    /** From wallet and from network local state */
    const [fromWalletDrawerOpen, setFromWalletDrawerOpen] = reactExports.useState(false);
    const [fromNetworkDrawerOpen, setFromNetworkDrawerOpen] = reactExports.useState(false);
    const [fromWalletWeb3Provider, setFromWalletWeb3Provider] = reactExports.useState(defaultFromWeb3Provider);
    const [fromNetwork, setFromNetwork] = reactExports.useState(defaultFromNetwork);
    const [fromWalletAddress, setFromWalletAddress] = reactExports.useState(defaultFromWalletAddress);
    const [fromWallet, setFromWallet] = reactExports.useState(defaultFromWallet);
    /** To wallet local state */
    const [toNetworkDrawerOpen, setToNetworkDrawerOpen] = reactExports.useState(false);
    const [toWalletDrawerOpen, setToWalletDrawerOpen] = reactExports.useState(false);
    const [toWalletWeb3Provider, setToWalletWeb3Provider] = reactExports.useState(defaultToWeb3Provider);
    const [toNetwork, setToNetwork] = reactExports.useState(defaultToNetwork);
    const [toWalletAddress, setToWalletAddress] = reactExports.useState(defaultToWalletAddress);
    const [toWallet, setToWallet] = reactExports.useState(defaultToWallet);
    /* Derived state */
    const isFromWalletAndNetworkSelected = fromWalletWeb3Provider && fromNetwork;
    const isToWalletAndNetworkSelected = toWalletWeb3Provider && toNetwork;
    const fromWalletProviderName = reactExports.useMemo(() => {
        if (!fromWalletWeb3Provider)
            return null;
        return getWalletProviderNameByProvider(fromWalletWeb3Provider);
    }, [fromWalletWeb3Provider]);
    const toWalletProviderName = reactExports.useMemo(() => {
        if (!toWalletWeb3Provider)
            return null;
        return getWalletProviderNameByProvider(toWalletWeb3Provider);
    }, [toWalletWeb3Provider]);
    const fromWalletSelectorOptions = reactExports.useMemo(() => providers, [providers]);
    const toWalletSelectorOptions = reactExports.useMemo(() => (providers
        .filter((providerDetail) => (providerDetail.info.rdns !== WalletProviderRdns.PASSPORT
        || (providerDetail.info.rdns === WalletProviderRdns.PASSPORT
            && fromWallet?.providerDetail?.info?.rdns !== WalletProviderRdns.PASSPORT)))), [providers, fromNetwork, fromWallet]);
    reactExports.useEffect(() => {
        if (!from || !to)
            return;
        bridgeDispatch({
            payload: {
                type: BridgeActions.SET_WALLETS_AND_NETWORKS,
                from: null,
                to: null,
            },
        });
    }, [from, to]);
    function clearToWalletSelections() {
        setToWalletWeb3Provider(null);
        setToNetwork(null);
    }
    /* --------------------------- */
    /* --- Handling selections --- */
    /* --------------------------- */
    const handleFromWalletConnectionSuccess = async (provider) => {
        setFromWalletWeb3Provider(provider);
        const address = await provider.getSigner().getAddress();
        setFromWalletAddress(address.toLowerCase());
        track({
            userJourney: UserJourney.BRIDGE,
            screen: 'WalletAndNetwork',
            control: 'FromWallet',
            controlType: 'Select',
            extras: {
                walletAddress: address.toLowerCase(),
            },
        });
        /** if Passport skip from network selector and default to zkEVM */
        if (isPassportProvider(provider)) {
            setFromNetwork(imtblZkEvmNetworkChainId);
            setFromWalletDrawerOpen(false);
            track({
                userJourney: UserJourney.BRIDGE,
                screen: 'WalletAndNetwork',
                control: 'FromNetwork',
                controlType: 'Select',
                extras: {
                    chainId: imtblZkEvmNetworkChainId,
                },
            });
            return;
        }
        /**
         * Force the selection of network
         * by clearing the fromNetwork
         * and opening the network drawer
         */
        setFromNetwork(null);
        setFromWalletDrawerOpen(false);
        setTimeout(() => setFromNetworkDrawerOpen(true), 500);
    };
    const handleFromWalletConnection = reactExports.useCallback(async (event) => {
        clearToWalletSelections();
        setFromWallet(event);
        let changeAccount = false;
        if (event.providerDetail.info.rdns === WalletProviderRdns.METAMASK) {
            changeAccount = true;
        }
        const web3Provider = new Web3Provider(event.provider);
        const connectedProvider = await connectToProvider(checkout, web3Provider, changeAccount);
        // CM-793 Check for sanctioned address
        if (await isAddressSanctioned(await connectedProvider.getSigner().getAddress(), checkout.config.environment)) {
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW,
                        error: new Error('Sanctioned address'),
                    },
                },
            });
            return;
        }
        await handleFromWalletConnectionSuccess(connectedProvider);
    }, [checkout]);
    const handleFromNetworkSelection = reactExports.useCallback(async (chainId) => {
        if (!fromWalletWeb3Provider)
            return;
        clearToWalletSelections();
        setFromNetworkDrawerOpen(false);
        setFromNetwork(chainId);
        track({
            userJourney: UserJourney.BRIDGE,
            screen: 'WalletAndNetwork',
            control: 'FromNetwork',
            controlType: 'Select',
            extras: {
                chainId,
            },
        });
    }, [checkout, fromWalletWeb3Provider]);
    const handleToNetworkSelection = reactExports.useCallback(async (chainId) => {
        if (!toWalletWeb3Provider)
            return;
        setToNetworkDrawerOpen(false);
        setToNetwork(chainId);
        track({
            userJourney: UserJourney.BRIDGE,
            screen: 'WalletAndNetwork',
            control: 'ToNetwork',
            controlType: 'Select',
            extras: {
                chainId,
            },
        });
    }, [checkout, toWalletWeb3Provider]);
    const handleSettingToNetwork = reactExports.useCallback((toAddress) => {
        // If the toWallet is Passport the toNetwork can only be L2
        // If the user selects the same wallet (e.g. MetaMask) for from AND to this can only be a bridge
        const theToNetwork = fromWalletAddress === toAddress && fromNetwork === imtblZkEvmNetworkChainId
            ? l1NetworkChainId
            : imtblZkEvmNetworkChainId;
        setToNetwork(theToNetwork);
        setToWalletDrawerOpen(false);
        track({
            userJourney: UserJourney.BRIDGE,
            screen: 'WalletAndNetwork',
            control: 'ToNetwork',
            controlType: 'Select',
            extras: {
                chainId: theToNetwork,
            },
        });
    }, [fromWalletAddress, fromNetwork]);
    const handleWalletConnectToWalletConnection = reactExports.useCallback((provider) => {
        setToWalletWeb3Provider(provider);
        provider
            .getSigner()
            .getAddress()
            .then((address) => {
            setToWalletAddress(address.toLowerCase());
            handleSettingToNetwork(address.toLowerCase());
            track({
                userJourney: UserJourney.BRIDGE,
                screen: 'WalletAndNetwork',
                control: 'ToWallet',
                controlType: 'Select',
                extras: {
                    walletAddress: address.toLowerCase(),
                },
            });
        });
    }, [handleSettingToNetwork]);
    const handleToWalletSelection = reactExports.useCallback(async (event) => {
        if (fromWallet?.providerDetail.info.rdns === event.providerDetail.info.rdns) {
            // if same from wallet and to wallet, just use the existing fromWalletLocalWeb3Provider
            setToWalletWeb3Provider(fromWalletWeb3Provider);
            setToWallet(event);
            const address = await fromWalletWeb3Provider.getSigner().getAddress();
            setToWalletAddress(address.toLowerCase());
            handleSettingToNetwork(address.toLowerCase());
            track({
                userJourney: UserJourney.BRIDGE,
                screen: 'WalletAndNetwork',
                control: 'ToWallet',
                controlType: 'Select',
                extras: {
                    walletAddress: address.toLowerCase(),
                },
            });
            return;
        }
        try {
            setToWallet(event);
            const web3Provider = new Web3Provider(event.provider);
            const connectedProvider = await connectToProvider(checkout, web3Provider, false);
            // CM-793 Check for sanctioned address
            if (await isAddressSanctioned(await connectedProvider.getSigner().getAddress(), checkout.config.environment)) {
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW,
                            error: new Error('Sanctioned address'),
                        },
                    },
                });
                return;
            }
            if (isWalletConnectProvider(connectedProvider)) {
                handleWalletConnectToWalletConnection(connectedProvider);
            }
            else {
                setToWalletWeb3Provider(connectedProvider);
                const address = await connectedProvider.getSigner().getAddress();
                setToWalletAddress(address.toLowerCase());
                handleSettingToNetwork(address.toLowerCase());
                track({
                    userJourney: UserJourney.BRIDGE,
                    screen: 'WalletAndNetwork',
                    control: 'ToWallet',
                    controlType: 'Select',
                    extras: {
                        walletAddress: address.toLowerCase(),
                    },
                });
            }
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }, [
        fromWalletProviderName,
        fromWalletWeb3Provider,
        handleSettingToNetwork,
        handleWalletConnectToWalletConnection,
    ]);
    const handleSubmitDetails = reactExports.useCallback(() => {
        if (!fromWalletWeb3Provider
            || !fromNetwork
            || !toWalletWeb3Provider
            || !toNetwork)
            return;
        bridgeDispatch({
            payload: {
                type: BridgeActions.SET_TOKEN_BALANCES,
                tokenBalances: [],
            },
        });
        bridgeDispatch({
            payload: {
                type: BridgeActions.SET_ALLOWED_TOKENS,
                allowedTokens: [],
            },
        });
        bridgeDispatch({
            payload: {
                type: BridgeActions.SET_WALLETS_AND_NETWORKS,
                from: {
                    web3Provider: fromWalletWeb3Provider,
                    walletAddress: fromWalletAddress.toLowerCase(),
                    walletProviderInfo: fromWallet?.providerDetail.info,
                    network: fromNetwork,
                },
                to: {
                    web3Provider: toWalletWeb3Provider,
                    walletAddress: toWalletAddress.toLowerCase(),
                    walletProviderInfo: toWallet?.providerDetail.info,
                    network: toNetwork,
                },
            },
        });
        track({
            userJourney: UserJourney.BRIDGE,
            screen: 'WalletAndNetwork',
            control: 'Next',
            controlType: 'Button',
            extras: {
                fromWalletAddress,
                fromNetwork,
                fromWallet: {
                    address: fromWalletAddress,
                    rdns: fromWallet?.providerDetail.info.rdns,
                    uuid: fromWallet?.providerDetail.info.uuid,
                    isPassportWallet: isPassportProvider(fromWalletWeb3Provider),
                    isMetaMask: isMetaMaskProvider(fromWalletWeb3Provider),
                },
                toWalletAddress,
                toNetwork,
                toWallet: {
                    address: toWalletAddress,
                    rdns: toWallet?.providerDetail.info.rdns,
                    uuid: toWallet?.providerDetail.info.uuid,
                    isPassportWallet: isPassportProvider(toWalletWeb3Provider),
                    isMetaMask: isMetaMaskProvider(toWalletWeb3Provider),
                },
                moveType: fromNetwork && fromNetwork === toNetwork ? 'transfer' : 'bridge',
            },
        });
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: { type: BridgeWidgetViews.BRIDGE_FORM },
            },
        });
    }, [
        fromWallet,
        fromWalletWeb3Provider,
        fromNetwork,
        fromWalletAddress,
        toWallet,
        toWalletWeb3Provider,
        toNetwork,
        toWalletAddress,
    ]);
    return (jsxs(Box, { testId: testId$1, sx: brigdeWalletWrapperStyles, children: [jsx(Heading, { testId: `${testId$1}-heading`, size: "small", weight: "regular", sx: bridgeHeadingStyles, children: t('views.WALLET_NETWORK_SELECTION.heading') }), jsx(Heading, { size: "xSmall", sx: { paddingBottom: 'base.spacing.x2' }, children: t('views.WALLET_NETWORK_SELECTION.fromFormInput.heading') }), jsx(WalletDrawer, { testId: `${testId$1}-from`, drawerText: {
                    heading: t('views.WALLET_NETWORK_SELECTION.fromFormInput.walletSelectorHeading'),
                    defaultText: t('views.WALLET_NETWORK_SELECTION.fromFormInput.selectDefaultText'),
                }, showWalletSelectorTarget: !isFromWalletAndNetworkSelected, showDrawer: fromWalletDrawerOpen, setShowDrawer: setFromWalletDrawerOpen, walletOptions: fromWalletSelectorOptions, onWalletChange: handleFromWalletConnection }), isFromWalletAndNetworkSelected && fromWalletProviderName && (jsxs(Box, { sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'base.spacing.x10',
                }, children: [jsx(WalletNetworkButton, { testId: testId$1, walletProviderDetail: fromWallet?.providerDetail, walletProvider: fromWalletWeb3Provider, walletName: fromWalletProviderName, walletAddress: abbreviateAddress(fromWalletAddress), chainId: fromNetwork, disableNetworkButton: fromWalletProviderName === WalletProviderName.PASSPORT.toString(), onWalletClick: () => {
                            // TODO: Force an account selection here
                            setFromWalletDrawerOpen(true);
                        }, onNetworkClick: () => setFromNetworkDrawerOpen(true), environment: environment }), jsxs(Box, { children: [jsx(Heading, { size: "xSmall", sx: { paddingBottom: 'base.spacing.x2' }, children: t('views.WALLET_NETWORK_SELECTION.toFormInput.heading') }), jsx(WalletDrawer, { testId: `${testId$1}-to`, drawerText: {
                                    heading: t('views.WALLET_NETWORK_SELECTION.toFormInput.walletSelectorHeading'),
                                    defaultText: t('views.WALLET_NETWORK_SELECTION.toFormInput.selectDefaultText'),
                                }, showWalletSelectorTarget: !isToWalletAndNetworkSelected, walletOptions: toWalletSelectorOptions, showDrawer: toWalletDrawerOpen, setShowDrawer: setToWalletDrawerOpen, onWalletChange: handleToWalletSelection })] })] })), jsx(Drawer, { headerBarTitle: t(fromNetworkDrawerOpen ? 'views.WALLET_NETWORK_SELECTION.fromFormInput.networkSelectorHeading'
                    : 'views.WALLET_NETWORK_SELECTION.toFormInput.networkSelectorHeading'), size: "full", onCloseDrawer: () => {
                    if (fromNetworkDrawerOpen) {
                        setFromNetworkDrawerOpen(false);
                    }
                    else {
                        setToNetworkDrawerOpen(false);
                    }
                }, visible: fromNetworkDrawerOpen || toNetworkDrawerOpen, children: jsxs(Drawer.Content, { sx: { paddingX: 'base.spacing.x4' }, children: [jsx(NetworkItem, { testId: testId$1, chainName: imtblZkEvmNetworkName, onNetworkClick: fromNetworkDrawerOpen ? handleFromNetworkSelection : handleToNetworkSelection, chainId: imtblZkEvmNetworkChainId, environment: environment }, imtblZkEvmNetworkName), (toNetworkDrawerOpen || fromWallet?.providerDetail.info.rdns !== WalletProviderRdns.PASSPORT) && (jsx(NetworkItem, { testId: testId$1, chainName: l1NetworkName, onNetworkClick: fromNetworkDrawerOpen ? handleFromNetworkSelection : handleToNetworkSelection, chainId: l1NetworkChainId, environment: environment }, l1NetworkName))] }) }), isToWalletAndNetworkSelected && toWalletProviderName && (jsxs(Box, { sx: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }, children: [jsx(WalletNetworkButton, { testId: testId$1, walletProviderDetail: toWallet?.providerDetail, walletProvider: toWalletWeb3Provider, walletName: toWalletProviderName, walletAddress: abbreviateAddress(toWalletAddress), chainId: toNetwork, disableNetworkButton: fromNetwork === l1NetworkChainId
                            || toWalletProviderName === WalletProviderName.PASSPORT.toString()
                            || fromWalletAddress === toWalletAddress, onWalletClick: () => {
                            setToWalletDrawerOpen(true);
                        }, onNetworkClick: () => {
                            setToNetworkDrawerOpen(true);
                        }, environment: environment }), jsx(Box, { sx: submitButtonWrapperStyles, children: jsx(Button, { testId: `${testId$1}-submit-button`, size: "large", onClick: handleSubmitDetails, children: t('views.WALLET_NETWORK_SELECTION.submitButton.text') }) })] }))] }));
}

function WalletNetworkSelectionView({ showBackButton, }) {
    const { t } = useTranslation();
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.BRIDGE,
            screen: 'WalletNetworkSelection',
        });
    }, []);
    return (jsx(SimpleLayout, { testId: "bridge-view", header: (jsx(HeaderNavigation, { title: t('views.WALLET_NETWORK_SELECTION.layoutHeading'), onCloseButtonClick: () => sendBridgeWidgetCloseEvent(eventTarget), rightActions: (jsx(ButtCon, { icon: "Minting", sx: ButtonNavigationStyles(), onClick: () => {
                    viewDispatch({
                        payload: {
                            type: ViewActions.UPDATE_VIEW,
                            view: { type: BridgeWidgetViews.TRANSACTIONS },
                        },
                    });
                }, testId: "move-transactions-button" })), showBack: showBackButton, onBackButtonClick: () => {
                orchestrationEvents.sendRequestGoBackEvent(eventTarget, IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, {});
            } })), footer: jsx(FooterLogo, {}), children: jsx(WalletAndNetworkSelector, {}) }));
}

function validateToken(fromToken) {
    if (!fromToken)
        return 'views.BRIDGE_FORM.validation.noTokenSelected';
    return '';
}
function validateAmount(amount, balance) {
    if (!amount || parseFloat(amount) === 0)
        return 'views.BRIDGE_FORM.validation.noAmountInputted';
    if (balance && Number(amount) > Number(balance))
        return 'views.BRIDGE_FORM.validation.insufficientBalance';
    return '';
}

const bridgeFormWrapperStyles = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 'base.spacing.x10',
};
const formInputsContainerStyles = {
    paddingTop: 'base.spacing.x4',
    display: 'flex',
    gap: 'base.spacing.x1',
};
const bridgeFormButtonContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    paddingY: 'base.spacing.x6',
    paddingX: 'base.spacing.x4',
};

function TokenSelectShimmer({ sx }) {
    return (jsxs(Box, { sx: {
            ...sx,
            paddingTop: '0',
            marginTop: 'base.spacing.x4',
        }, rc: jsx("div", {}), children: [jsx(Box, { sx: {
                    display: 'flex',
                    backgroundColor: '#F3F3F30A',
                    borderRadius: '8px',
                }, children: jsx(Box, { sx: {
                        minw: '170px',
                        height: '64px',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        WebkitMaskPosition: 'left center',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        WebkitMaskRepeat: 'no-repeat',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        WebkitMaskSize: 'contain',
                        // eslint-disable-next-line @typescript-eslint/naming-convention,max-len
                        WebkitMaskImage: 'url(\'data:image/svg+xml;utf8, <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M154.75 39q1.65 0 2.85-1.15 1.15-1.15 1.15-2.85v-4q0-1.65-1.15-2.8-1.2-1.2-2.85-1.2h-93.6q-2.3 0-3.85 1.2-1.55 1.15-1.55 2.8v4q0 1.7 1.55 2.85Q58.85 39 61.15 39h93.6m-111.7-3.35q.2-1.3.2-2.65 0-1.35-.2-2.65-.75-4.9-4.5-8.65-4.7-4.7-11.3-4.7-6.65 0-11.3 4.7-4.7 4.7-4.7 11.3 0 6.65 4.7 11.3Q20.6 49 27.25 49q6.6 0 11.3-4.7 3.75-3.7 4.5-8.65Z" id="a"/></svg>\')',
                    }, rc: jsx("span", {}), children: jsx(ShimmerBox, { rc: jsx("span", {}) }) }) }), jsx(Box, { sx: {
                    display: 'flex',
                    width: '100%',
                    backgroundColor: '#F3F3F30A',
                    borderRadius: '8px',
                }, children: jsx(Box, { sx: {
                        width: '100%',
                        height: '64px',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        WebkitMaskPosition: 'right center',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        WebkitMaskRepeat: 'no-repeat',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        WebkitMaskSize: 'contain',
                        // eslint-disable-next-line @typescript-eslint/naming-convention,max-len
                        WebkitMaskImage: 'url(\'data:image/svg+xml;utf8, <svg xmlns="http://www.w3.org/2000/svg" width="196" height="96"><path d="M182.85 55.2Q181.65 54 180 54h-56q-1.7 0-2.85 1.2Q120 56.35 120 58v4q0 1.7 1.15 2.85Q122.3 66 124 66h56q1.65 0 2.85-1.15Q184 63.7 184 62v-4q0-1.65-1.15-2.8m0-22Q181.65 32 180 32H68q-1.7 0-2.85 1.2Q64 34.35 64 36v8q0 1.7 1.15 2.85Q66.3 48 68 48h112q1.65 0 2.85-1.15Q184 45.7 184 44v-8q0-1.65-1.15-2.8Z" id="a"/></svg>\')',
                    }, rc: jsx("span", {}), children: jsx(ShimmerBox, { rc: jsx("span", {}) }) }) })] }));
}

function BridgeForm(props) {
    const { t } = useTranslation();
    const { bridgeDispatch, bridgeState: { tokenBalances, allowedTokens, checkout, from, to, amount, token, }, } = reactExports.useContext(BridgeContext);
    const { cryptoFiatState, cryptoFiatDispatch } = reactExports.useContext(CryptoFiatContext);
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { testId, defaultAmount, defaultTokenAddress, isTokenBalancesLoading, defaultTokenImage, environment, theme, } = props;
    const { track } = useAnalytics();
    // Form state
    const [formAmount, setFormAmount] = reactExports.useState(defaultAmount || '');
    const [amountError, setAmountError] = reactExports.useState('');
    const [formToken, setFormToken] = reactExports.useState();
    const [tokenError, setTokenError] = reactExports.useState('');
    const [amountFiatValue, setAmountFiatValue] = reactExports.useState('');
    const [loading, setLoading] = reactExports.useState(false);
    const hasSetDefaultState = reactExports.useRef(false);
    const tokenBalanceSubtext = formToken
        ? `${t('views.BRIDGE_FORM.content.availableBalancePrefix')} ${tokenValueFormat(formToken?.formattedBalance)}`
        : '';
    // Fee estimates & transactions
    const [tokensOptions, setTokensOptions] = reactExports.useState([]);
    // user rejects transaction
    const [showTxnRejectedState, setShowTxnRejectedState] = reactExports.useState(false);
    const formatTokenOptionsId = reactExports.useCallback((symbol, address) => {
        if (!address)
            return symbol.toLowerCase();
        return `${symbol.toLowerCase()}-${address.toLowerCase()}`;
    }, []);
    reactExports.useEffect(() => {
        if (tokenBalances.length === 0)
            return;
        // WT-1350 removing ETH as possible bridge option from being selected
        // balance > 0 AND token is not ETH
        const options = tokenBalances
            .filter((tokenBalance) => tokenBalance.balance.gt(0))
            .map((tokenBalance) => ({
            id: formatTokenOptionsId(tokenBalance.token.symbol, tokenBalance.token.address),
            name: tokenBalance.token.name,
            symbol: tokenBalance.token.symbol,
            icon: tokenBalance.token.icon,
            balance: {
                formattedFiatAmount: cryptoFiatState.conversions.size === 0 ? formatZeroAmount('')
                    : calculateCryptoToFiat(tokenBalance.formattedBalance, tokenBalance.token.symbol, cryptoFiatState.conversions),
                formattedAmount: tokenValueFormat(tokenBalance.formattedBalance),
            },
        }));
        setTokensOptions(options);
        if (!hasSetDefaultState.current) {
            hasSetDefaultState.current = true;
            if (defaultTokenAddress) {
                setFormToken(tokenBalances.find((b) => (isNativeToken(b.token.address) && defaultTokenAddress?.toLocaleUpperCase() === NATIVE)
                    || (b.token.address?.toLowerCase() === defaultTokenAddress?.toLowerCase())));
            }
        }
    }, [
        tokenBalances,
        cryptoFiatState.conversions,
        defaultTokenAddress,
        hasSetDefaultState.current,
        formatTokenOptionsId,
        formatZeroAmount,
    ]);
    reactExports.useEffect(() => {
        // This useEffect is for populating the form
        // with values from context when the user
        // has selected the back button from the review screen
        if (!amount || !token)
            return;
        setFormAmount(amount);
        for (let i = 0; i < tokenBalances.length; i++) {
            const balance = tokenBalances[i];
            if (balance.token.address === token.address) {
                setFormToken(balance);
                break;
            }
        }
        bridgeDispatch({
            payload: {
                type: BridgeActions.SET_TOKEN_AND_AMOUNT,
                token: null,
                amount: '',
            },
        });
    }, [amount, token, tokenBalances]);
    const selectedOption = reactExports.useMemo(() => (formToken && formToken.token
        ? formatTokenOptionsId(formToken.token.symbol, formToken.token.address)
        : undefined), [formToken, tokenBalances, cryptoFiatState.conversions, formatTokenOptionsId]);
    const canFetchEstimates = (silently) => {
        if (Number.isNaN(parseFloat(formAmount)))
            return false;
        if (parseFloat(formAmount) <= 0)
            return false;
        if (!formToken)
            return false;
        if (!from || !from.walletAddress)
            return false;
        if (!to || !to.walletAddress)
            return false;
        if (loading)
            return false;
        if (!checkout)
            return false;
        return true;
    };
    const handleBridgeAmountChange = (value) => {
        setFormAmount(value);
        if (amountError) {
            const validateAmountError = validateAmount(value, formToken?.formattedBalance);
            setAmountError(validateAmountError);
        }
        if (!formToken)
            return;
        setAmountFiatValue(calculateCryptoToFiat(value, formToken.token.symbol, cryptoFiatState.conversions));
        if (canFetchEstimates()) {
            setLoading(true);
        }
    };
    const handleSelectTokenChange = (value) => {
        const selected = tokenBalances.find((tokenBalance) => (value === formatTokenOptionsId(tokenBalance.token.symbol, tokenBalance.token.address)));
        if (!selected)
            return;
        setFormToken(selected);
        setTokenError('');
    };
    reactExports.useEffect(() => {
        cryptoFiatDispatch({
            payload: {
                type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
                tokenSymbols: allowedTokens.map((allowedToken) => allowedToken.symbol),
            },
        });
    }, [cryptoFiatDispatch, allowedTokens]);
    reactExports.useEffect(() => {
        if (!formAmount)
            return;
        if (!formToken)
            return;
        setAmountFiatValue(calculateCryptoToFiat(formAmount, formToken.token.symbol, cryptoFiatState.conversions));
    }, [formAmount, formToken]);
    const bridgeFormValidator = reactExports.useCallback(() => {
        const validateTokenError = validateToken(formToken);
        const validateAmountError = validateAmount(formAmount, formToken?.formattedBalance);
        if (validateTokenError)
            setTokenError(validateTokenError);
        if (validateAmountError)
            setAmountError(validateAmountError);
        if (validateTokenError || validateAmountError)
            return false;
        return true;
    }, [formToken, formAmount, setTokenError, setAmountError]);
    const submitBridgeValues = reactExports.useCallback(async () => {
        if (!bridgeFormValidator())
            return;
        if (!checkout || !from?.web3Provider || !formToken)
            return;
        track({
            userJourney: UserJourney.BRIDGE,
            screen: 'TokenAmount',
            control: 'Review',
            controlType: 'Button',
            extras: {
                tokenAddress: formToken.token.address,
                amount: formAmount,
            },
        });
        bridgeDispatch({
            payload: {
                type: BridgeActions.SET_TOKEN_AND_AMOUNT,
                token: formToken.token,
                amount: formAmount,
            },
        });
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: BridgeWidgetViews.BRIDGE_REVIEW,
                },
            },
        });
    }, [
        checkout,
        from?.web3Provider,
        bridgeFormValidator,
        formToken,
    ]);
    const retrySubmitBridgeValues = async () => {
        setShowTxnRejectedState(false);
        await submitBridgeValues();
    };
    return (jsxs(Box, { testId: testId, sx: bridgeFormWrapperStyles, children: [jsxs(Box, { sx: { paddingX: 'base.spacing.x4' }, children: [jsx(Heading, { testId: `${testId}-content-heading`, size: "small", weight: "regular", sx: { paddingBottom: 'base.spacing.x4' }, children: t('views.BRIDGE_FORM.content.title') }), (!defaultTokenAddress || !isTokenBalancesLoading) && (jsxs(Box, { sx: formInputsContainerStyles, children: [jsx(SelectForm, { testId: "bridge-token", options: tokensOptions, optionsLoading: isTokenBalancesLoading, coinSelectorHeading: t('views.BRIDGE_FORM.bridgeForm.from.selectorTitle'), selectedOption: selectedOption, subtext: tokenBalanceSubtext, textAlign: "left", errorMessage: t(tokenError), onSelectChange: (option) => handleSelectTokenChange(option), defaultTokenImage: defaultTokenImage, environment: environment, theme: theme }), jsx(TextInputForm, { testId: "bridge-amount", type: "number", value: formAmount, placeholder: t('views.BRIDGE_FORM.bridgeForm.from.inputPlaceholder'), subtext: `${t('views.BRIDGE_FORM.content.fiatPricePrefix')} $${formatZeroAmount(amountFiatValue, true)}`, validator: amountInputValidation, onTextInputChange: (value) => handleBridgeAmountChange(value), onTextInputEnter: submitBridgeValues, textAlign: "right", inputMode: "decimal", errorMessage: t(amountError) })] })), defaultTokenAddress && isTokenBalancesLoading && (jsx(TokenSelectShimmer, { sx: formInputsContainerStyles }))] }), jsxs(Box, { sx: bridgeFormButtonContainerStyles, children: [jsx(Button, { testId: `${testId}-button`, variant: "primary", onClick: submitBridgeValues, size: "large", children: t('views.BRIDGE_FORM.bridgeForm.buttonText') }), jsx(TransactionRejected, { visible: showTxnRejectedState, showHeaderBar: false, onCloseDrawer: () => setShowTxnRejectedState(false), onRetry: retrySubmitBridgeValues })] })] }));
}

const REFRESH_TOKENS_INTERVAL_MS = 10000;
function Bridge({ amount, tokenAddress, defaultTokenImage, theme, }) {
    const { t } = useTranslation();
    const { bridgeState, bridgeDispatch } = reactExports.useContext(BridgeContext);
    const { checkout, from } = bridgeState;
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const [isTokenBalancesLoading, setIsTokenBalancesLoading] = reactExports.useState(false);
    const showBackButton = true;
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        if (amount || tokenAddress) {
            page({
                userJourney: UserJourney.BRIDGE,
                screen: 'TokenAmount',
                extras: {
                    amount,
                    tokenAddress,
                },
            });
        }
    }, []);
    // This is used to refresh the balances after the Bridge widget
    // has been loaded so that processing transfers will be eventually
    // reflected.
    const refreshBalances = reactExports.useCallback(async () => {
        if (!checkout || !from?.web3Provider)
            return;
        try {
            const tokensAndBalances = await getAllowedBalances({
                checkout,
                provider: from.web3Provider,
                chainId: from?.network,
                allowTokenListType: TokenFilterTypes.BRIDGE,
                // Skip retry given that in this case it is not needed;
                // refreshBalances will be, automatically, called again
                // after REFRESH_TOKENS_INTERVAL_MS.
                retryPolicy: { retryIntervalMs: 0, retries: 0 },
            });
            // Why? Check getAllowedBalances
            if (tokensAndBalances === undefined)
                return;
            bridgeDispatch({
                payload: {
                    type: BridgeActions.SET_TOKEN_BALANCES,
                    tokenBalances: tokensAndBalances.allowedBalances,
                },
            });
            bridgeDispatch({
                payload: {
                    type: BridgeActions.SET_ALLOWED_TOKENS,
                    allowedTokens: tokensAndBalances.allowList.tokens,
                },
            });
            // Ignore errors given that this is a background refresh
            // and the logic will retry anyways.
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.debug(e);
        }
    }, [checkout, from?.web3Provider, from?.network]);
    useInterval(refreshBalances, REFRESH_TOKENS_INTERVAL_MS);
    reactExports.useEffect(() => {
        if (!checkout || !from?.web3Provider)
            return;
        setIsTokenBalancesLoading(true);
        refreshBalances().finally(() => setIsTokenBalancesLoading(false));
    }, [checkout, from?.web3Provider]);
    return (jsx(SimpleLayout, { testId: "bridge-view", header: (jsx(HeaderNavigation, { showBack: showBackButton, title: t('views.BRIDGE_FORM.header.title'), onCloseButtonClick: () => sendBridgeWidgetCloseEvent(eventTarget) })), footer: jsx(FooterLogo, {}), children: jsx(BridgeForm, { testId: "bridge-form", defaultAmount: amount, defaultTokenAddress: tokenAddress, isTokenBalancesLoading: isTokenBalancesLoading, defaultTokenImage: defaultTokenImage, environment: checkout?.config.environment, theme: theme }) }));
}

const containerStyles$1 = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 'base.spacing.x6',
    height: '100%',
    paddingX: 'base.spacing.x6',
};
const headingTextStyles = {
    fontFamily: 'base.font.family.heading.secondary',
    textAlign: 'center',
    marginTop: '15px',
    paddingX: 'base.spacing.x6',
};
const bodyTextStyles = {
    ...headingTextStyles,
    color: 'base.color.text.body.secondary',
};
const actionButtonContainerStyles$1 = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 'base.spacing.x2',
    height: '100%',
    width: '100%',
};
const actionButtonStyles$1 = {
    width: '100%',
    height: 'base.spacing.x16',
};

function NotEnoughGas({ environment, onCloseDrawer, visible, walletAddress, tokenSymbol, onAddCoinsClick, }) {
    const { t } = useTranslation();
    const [isCopied, setIsCopied] = reactExports.useState(false);
    const notEnoughEth = getRemoteImage(environment, '/notenougheth.svg');
    const notEnoughImx = getRemoteImage(environment, '/notenoughimx.svg');
    const heading = t('drawers.notEnoughGas.content.heading', {
        token: tokenSymbol.toUpperCase(),
    });
    const body = t('drawers.notEnoughGas.content.body', {
        token: tokenSymbol.toUpperCase(),
    });
    const handleCopy = reactExports.useCallback(() => {
        if (walletAddress && walletAddress !== '') {
            navigator.clipboard.writeText(walletAddress);
        }
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 3000);
    }, [walletAddress]);
    return (jsx(Drawer, { size: "threeQuarter", visible: visible, showHeaderBar: true, headerBarTitle: undefined, onCloseDrawer: onCloseDrawer, children: jsxs(Drawer.Content, { testId: "not-enough-gas-bottom-sheet", sx: containerStyles$1, children: [jsx(CloudImage, { sx: { w: '90px', h: tokenSymbol === ETH_TOKEN_SYMBOL ? '110px' : '90px' }, use: (jsx("img", { src: tokenSymbol === ETH_TOKEN_SYMBOL
                            ? notEnoughEth
                            : notEnoughImx, alt: heading })) }), jsx(Heading, { size: "small", weight: "bold", sx: headingTextStyles, testId: "not-enough-gas-heading", children: heading }), jsx(Body, { sx: bodyTextStyles, children: body }), jsx(Box, { sx: actionButtonContainerStyles$1, children: tokenSymbol === ETH_TOKEN_SYMBOL
                        ? (jsxs(Button, { testId: "not-enough-gas-copy-address-button", sx: actionButtonStyles$1, variant: "primary", onClick: handleCopy, children: [t('drawers.notEnoughGas.buttons.copyAddress'), jsx(Button.Icon, { icon: isCopied ? 'Tick' : 'CopyText' })] }))
                        : (jsx(Button, { testId: "not-enough-gas-add-imx-button", sx: actionButtonStyles$1, variant: "primary", onClick: onAddCoinsClick, children: t('drawers.notEnoughGas.buttons.addMoreImx') })) })] }) }));
}

const topMenuItemStyles = {
    borderBottomLeftRadius: '0px',
    borderBottomRightRadius: '0px',
    marginBottom: '2px',
    position: 'relative',
};
const bottomMenuItemStyles = {
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
    backgroundColor: 'base.color.translucent.emphasis.100',
    position: 'relative',
};
const wcWalletLogoStyles = {
    width: 'base.icon.size.400',
};
const wcStickerLogoStyles = {
    position: 'absolute',
    top: '2px',
    left: '26px',
    width: '20px',
    padding: '2px',
    backgroundColor: 'base.color.translucent.inverse.900',
    borderRadius: 'base.borderRadius.x2',
};
const bridgeReviewWrapperStyles = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingX: 'base.spacing.x4',
};
const bridgeReviewHeadingStyles = {
    paddingTop: 'base.spacing.x10',
    paddingBottom: 'base.spacing.x4',
};
const arrowIconWrapperStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingY: 'base.spacing.x1',
};
const arrowIconStyles = {
    width: 'base.icon.size.300',
    transform: 'rotate(270deg)',
};
const bridgeButtonIconLoadingStyle = {
    width: 'base.icon.size.400',
};
const rawImageStyle = {
    backgroundColor: 'base.color.translucent.standard.200',
    position: 'absolute',
    width: '32px',
    height: '32px',
    padding: '6px',
    left: 'base.spacing.x3',
};
const networkIconStyles = {
    position: 'absolute',
    right: 'base.spacing.x3',
    w: 'base.icon.size.400',
    h: 'base.icon.size.400',
};

const formatBridgeFees = (estimates, isDeposit, cryptoFiatState, t) => {
    const fees = [];
    if (!estimates?.fees || !estimates.token)
        return fees;
    let serviceFee = BigNumber.from(0);
    if (estimates.fees.bridgeFee)
        serviceFee = serviceFee.add(estimates.fees.bridgeFee);
    if (estimates.fees.imtblFee)
        serviceFee = serviceFee.add(estimates.fees.imtblFee);
    if (serviceFee.gt(0)) {
        fees.push({
            label: isDeposit
                ? t('drawers.feesBreakdown.fees.serviceFee.depositLabel')
                : t('drawers.feesBreakdown.fees.serviceFee.withdrawLabel'),
            fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(formatUnits(serviceFee, estimates.token.decimals), estimates.token.symbol, cryptoFiatState.conversions)}`,
            amount: tokenValueFormat(formatUnits(serviceFee, estimates.token.decimals)),
            token: estimates.token,
        });
    }
    if (estimates.fees.sourceChainGas?.gt(0)) {
        const formattedGas = formatUnits(estimates.fees.sourceChainGas, estimates.token.decimals);
        fees.push({
            label: t('drawers.feesBreakdown.fees.gasFeeMove.label'),
            fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(formattedGas, estimates.token.symbol, cryptoFiatState.conversions)}`,
            amount: `${tokenValueFormat(formattedGas)}`,
            prefix: '≈ ',
            token: estimates.token,
        });
    }
    if (estimates.fees.approvalFee?.gt(0)) {
        const formattedApprovalGas = formatUnits(estimates.fees.approvalFee, estimates.token.decimals);
        fees.push({
            label: t('drawers.feesBreakdown.fees.approvalFee.label'),
            fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(formattedApprovalGas, estimates.token.symbol, cryptoFiatState.conversions)}`,
            amount: `${tokenValueFormat(formattedApprovalGas)}`,
            prefix: '≈ ',
            token: estimates.token,
        });
    }
    return fees;
};

const getErc20Contract = (token, signer) => new Contract(token, ['function transfer(address to, uint amount)'], signer);

var WithdrawalQueueWarningType;
(function (WithdrawalQueueWarningType) {
    WithdrawalQueueWarningType["TYPE_THRESHOLD"] = "exceedsThreshold";
    WithdrawalQueueWarningType["TYPE_ACTIVE_QUEUE"] = "queueActivated";
})(WithdrawalQueueWarningType || (WithdrawalQueueWarningType = {}));
function WithdrawalQueueDrawer({ visible, checkout, warningType, onCloseDrawer, onAdjustAmount, threshold, }) {
    const { t } = useTranslation();
    const bridgeWarningUrl = getRemoteImage(checkout.config.environment ?? Environment.PRODUCTION, '/notenougheth.svg');
    return (warningType && (jsx(Drawer, { size: warningType === WithdrawalQueueWarningType.TYPE_THRESHOLD ? 'full' : 'threeQuarter', visible: visible, onCloseDrawer: onCloseDrawer, showHeaderBar: false, children: jsxs(Drawer.Content, { testId: "withdraway-queue-bottom-sheet", sx: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
            }, children: [jsxs(Box, { sx: {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }, children: [jsx(CloudImage, { sx: { paddingTop: 'base.spacing.x4', paddingBottom: 'base.spacing.x9' }, use: (jsx("img", { src: bridgeWarningUrl, alt: t(`drawers.withdrawalQueue.${warningType}.heading`, { threshold }) })) }), jsxs(Box, { sx: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 'base.spacing.x4',
                                paddingX: 'base.spacing.x6',
                            }, children: [jsx(Heading, { size: "small", weight: "bold", sx: { textAlign: 'center', paddingX: 'base.spacing.x6' }, children: t(`drawers.withdrawalQueue.${warningType}.heading`, { threshold }) }), jsx(Body, { size: "medium", weight: "regular", sx: {
                                        color: 'base.color.text.body.secondary',
                                        textAlign: 'center',
                                        paddingX: 'base.spacing.x6',
                                    }, children: t(`drawers.withdrawalQueue.${warningType}.body`, { threshold }) })] })] }), jsxs(Box, { sx: {
                        display: 'flex',
                        flexDirection: 'column',
                        paddingX: 'base.spacing.x6',
                        width: '100%',
                    }, children: [warningType === WithdrawalQueueWarningType.TYPE_THRESHOLD && (jsx(Button, { size: "large", variant: "primary", sx: { width: '100%', marginBottom: 'base.spacing.x5' }, onClick: onAdjustAmount, children: t('drawers.withdrawalQueue.exceedsThreshold.buttons.cancel') })), jsx(Button, { size: "large", variant: "primary", sx: { width: '100%', marginBottom: 'base.spacing.x10' }, onClick: onCloseDrawer, children: t(`drawers.withdrawalQueue.${warningType}.buttons.proceed`) })] })] }) })));
}

const testId = 'bridge-review-summary';
function BridgeReviewSummary() {
    const { t } = useTranslation();
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { bridgeState: { checkout, tokenBridge, from, to, token, amount, tokenBalances, }, bridgeDispatch, } = reactExports.useContext(BridgeContext);
    const { environment } = checkout.config;
    const { track } = useAnalytics();
    const { cryptoFiatState } = reactExports.useContext(CryptoFiatContext);
    const [loading, setLoading] = reactExports.useState(false);
    const [estimates, setEstimates] = reactExports.useState(undefined);
    const [gasFee, setGasFee] = reactExports.useState('');
    const [gasFeeFiatValue, setGasFeeFiatValue] = reactExports.useState('');
    const [approveTransaction, setApproveTransaction] = reactExports.useState(undefined);
    const [transaction, setTransaction] = reactExports.useState(undefined);
    const [showSwitchNetworkDrawer, setShowSwitchNetworkDrawer] = reactExports.useState(false);
    const [fromWalletLogoUrl, setFromWalletLogoUrl] = reactExports.useState(undefined);
    const [toWalletLogoUrl, setToWalletLogoUrl] = reactExports.useState(undefined);
    const [fromWalletIsWalletConnect, setFromWalletIsWalletConnect] = reactExports.useState(false);
    const [toWalletIsWalletConnect, setToWalletIsWalletConnect] = reactExports.useState(false);
    const { isWalletConnectEnabled, getWalletLogoUrl } = useWalletConnect();
    // Not enough ETH to cover gas
    const [showNotEnoughGasDrawer, setShowNotEnoughGasDrawer] = reactExports.useState(false);
    const [withdrawalQueueWarning, setWithdrawalQueueWarning] = reactExports.useState({ visible: false });
    const isTransfer = reactExports.useMemo(() => from?.network === to?.network, [from, to]);
    const isDeposit = reactExports.useMemo(() => (getL2ChainId(checkout.config) === to?.network), [from, to, checkout]);
    const insufficientFundsForGas = reactExports.useMemo(() => {
        if (!estimates)
            return false;
        if (!token)
            return true;
        const nativeTokenBalance = tokenBalances
            .find((balance) => isNativeToken(balance.token.address));
        let requiredAmount = BigNumber.from(estimates.fees.totalFees);
        if (isNativeToken(token.address)) {
            // add native move amount to required amount as they need to cover
            // the gas + move amount
            requiredAmount = requiredAmount.add(parseUnits(amount, token.decimals));
        }
        return !nativeTokenBalance || nativeTokenBalance.balance.lt(requiredAmount);
    }, [tokenBalances, estimates, token, amount]);
    const displayAmount = reactExports.useMemo(() => (token?.symbol ? `${token?.symbol} ${amount}` : `${amount}`), [token, amount]);
    const fromFiatAmount = reactExports.useMemo(() => {
        if (!amount || !token)
            return '';
        return calculateCryptoToFiat(amount, token.symbol, cryptoFiatState.conversions);
    }, [token, amount]);
    const fromAddress = reactExports.useMemo(() => {
        if (!from)
            return '-';
        return from.walletAddress;
    }, [from]);
    const fromNetwork = reactExports.useMemo(() => from && from.network, [from]);
    const toAddress = reactExports.useMemo(() => {
        if (!to)
            return '-';
        return to.walletAddress;
    }, [to]);
    const toNetwork = reactExports.useMemo(() => to?.network, [to]);
    const fetchTransferGasEstimate = reactExports.useCallback(async () => {
        if (!tokenBridge || !amount || !from || !to || !token)
            return;
        const tokenToTransfer = token?.address?.toLowerCase() ?? NATIVE.toUpperCase();
        const gasEstimateResult = {
            gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
            fees: {},
            token: checkout.config.networkMap.get(from.network)?.nativeCurrency,
        };
        let estimatePromise;
        if (tokenToTransfer === NATIVE.toLowerCase()) {
            estimatePromise = checkout.providerCall(from.web3Provider, async (provider) => await provider.estimateGas({
                to: toAddress,
                // If 'from' not provided it assumes the transaction is being sent from the zero address.
                // Estimation will fail unless the amount is within the zero addresses balance.
                from: fromAddress,
                value: parseUnits(amount, token.decimals),
            }));
        }
        else {
            const erc20 = getErc20Contract(tokenToTransfer, from.web3Provider.getSigner());
            estimatePromise = erc20.estimateGas.transfer(toAddress, parseUnits(amount, token.decimals));
        }
        try {
            const [estimate, gasPrice] = await Promise.all([estimatePromise, from.web3Provider.getGasPrice()]);
            const gas = estimate.mul(gasPrice);
            const formattedEstimate = formatUnits(gas, DEFAULT_TOKEN_DECIMALS);
            gasEstimateResult.fees.sourceChainGas = gas;
            gasEstimateResult.fees.totalFees = gas;
            setEstimates(gasEstimateResult);
            setGasFee(formattedEstimate);
            setGasFeeFiatValue(calculateCryptoToFiat(formattedEstimate, NATIVE.toUpperCase(), cryptoFiatState.conversions));
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error('Unable to fetch gas estimate', e);
        }
    }, [checkout, from, to, token, amount]);
    const fetchBridgeGasEstimate = reactExports.useCallback(async () => {
        if (!tokenBridge || !amount || !from || !to || !token)
            return;
        const bundledTxn = await tokenBridge.getUnsignedBridgeBundledTx({
            senderAddress: fromAddress,
            recipientAddress: toAddress,
            token: token.address ?? NATIVE.toUpperCase(),
            amount: parseUnits(amount, token.decimals),
            sourceChainId: from?.network.toString(),
            destinationChainId: to?.network.toString(),
            gasMultiplier: 'auto',
        });
        if (bundledTxn.withdrawalQueueActivated) {
            setWithdrawalQueueWarning({
                visible: true,
                warningType: WithdrawalQueueWarningType.TYPE_ACTIVE_QUEUE,
            });
        }
        else if (bundledTxn.delayWithdrawalLargeAmount && bundledTxn.largeTransferThresholds) {
            const threshold = formatUnits(bundledTxn.largeTransferThresholds, token.decimals);
            setWithdrawalQueueWarning({
                visible: true,
                warningType: WithdrawalQueueWarningType.TYPE_THRESHOLD,
                threshold: parseInt(threshold, 10),
            });
        }
        const unsignedApproveTransaction = {
            contractToApprove: bundledTxn.contractToApprove,
            unsignedTx: bundledTxn.unsignedApprovalTx,
        };
        const unsignedTransaction = {
            feeData: bundledTxn.feeData,
            unsignedTx: bundledTxn.unsignedBridgeTx,
        };
        setApproveTransaction(unsignedApproveTransaction);
        setTransaction(unsignedTransaction);
        // todo: add approval gas fees
        const transactionFeeData = unsignedTransaction.feeData;
        const { totalFees, approvalFee } = transactionFeeData;
        let rawTotalFees = totalFees;
        if (!unsignedApproveTransaction.unsignedTx) {
            rawTotalFees = totalFees.sub(approvalFee);
            transactionFeeData.approvalFee = BigNumber.from(0);
        }
        const gasEstimateResult = {
            gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
            fees: {
                ...transactionFeeData,
                totalFees: rawTotalFees,
            },
            token: checkout.config.networkMap.get(from.network)?.nativeCurrency,
        };
        setEstimates(gasEstimateResult);
        const estimatedAmount = formatUnits(gasEstimateResult?.fees.totalFees || 0, DEFAULT_TOKEN_DECIMALS);
        setGasFee(estimatedAmount);
        setGasFeeFiatValue(calculateCryptoToFiat(estimatedAmount, gasEstimateResult?.token?.symbol || '', cryptoFiatState.conversions));
    }, [checkout, tokenBridge]);
    useInterval(() => {
        if (isTransfer) {
            fetchTransferGasEstimate();
        }
        else {
            fetchBridgeGasEstimate();
        }
    }, DEFAULT_QUOTE_REFRESH_INTERVAL);
    const formatFeeBreakdown = reactExports.useCallback(() => formatBridgeFees(estimates, isDeposit, cryptoFiatState, t), [estimates, isDeposit]);
    reactExports.useEffect(() => {
        (async () => {
            setLoading(true);
            if (isTransfer) {
                await fetchTransferGasEstimate();
            }
            else {
                await fetchBridgeGasEstimate();
            }
            setLoading(false);
        })();
    }, []);
    const handleNetworkSwitch = reactExports.useCallback((provider) => {
        bridgeDispatch({
            payload: {
                type: BridgeActions.SET_WALLETS_AND_NETWORKS,
                from: {
                    web3Provider: provider,
                    walletAddress: from?.walletAddress,
                    walletProviderInfo: from?.walletProviderInfo,
                    network: from?.network,
                },
                to: {
                    web3Provider: to?.web3Provider,
                    walletAddress: to?.walletAddress,
                    walletProviderInfo: to?.walletProviderInfo,
                    network: to?.network,
                },
            },
        });
    }, [from?.web3Provider, from?.network, to?.web3Provider, to?.network]);
    reactExports.useEffect(() => {
        if (!from?.web3Provider)
            return;
        const handleChainChanged = () => {
            const newProvider = new Web3Provider(from?.web3Provider.provider);
            handleNetworkSwitch(newProvider);
            setShowSwitchNetworkDrawer(false);
        };
        addChainChangedListener(from?.web3Provider, handleChainChanged);
        // eslint-disable-next-line consistent-return
        return () => {
            removeChainChangedListener(from?.web3Provider, handleChainChanged);
        };
    }, [from?.web3Provider]);
    reactExports.useEffect(() => {
        if (isWalletConnectEnabled) {
            const isFromProviderWalletConnect = isWalletConnectProvider(from?.web3Provider);
            const isToProviderWalletConnect = isWalletConnectProvider(to?.web3Provider);
            setFromWalletIsWalletConnect(isFromProviderWalletConnect);
            setToWalletIsWalletConnect(isToProviderWalletConnect);
            (async () => {
                if (isFromProviderWalletConnect) {
                    setFromWalletLogoUrl(await getWalletLogoUrl());
                }
                if (isToProviderWalletConnect) {
                    setToWalletLogoUrl(await getWalletLogoUrl());
                }
            })();
        }
    }, [isWalletConnectEnabled, from?.web3Provider, to?.web3Provider]);
    reactExports.useEffect(() => {
        if (insufficientFundsForGas) {
            setShowNotEnoughGasDrawer(true);
        }
    }, [insufficientFundsForGas]);
    const submitBridge = reactExports.useCallback(async () => {
        if (!isTransfer && (!approveTransaction || !transaction))
            return;
        if (insufficientFundsForGas) {
            setShowNotEnoughGasDrawer(true);
            return;
        }
        try {
            const currentChainId = await (from?.web3Provider.provider).request({ method: 'eth_chainId', params: [] });
            // eslint-disable-next-line radix
            const parsedChainId = parseInt(currentChainId.toString());
            if (parsedChainId !== from?.network) {
                setShowSwitchNetworkDrawer(true);
                return;
            }
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('Current network check failed', err);
        }
        track({
            userJourney: UserJourney.BRIDGE,
            screen: 'Summary',
            control: 'Submit',
            controlType: 'Button',
            extras: {
                fromWalletAddress: fromAddress,
                fromNetwork,
                fromWallet: {
                    address: fromAddress,
                    rdns: from?.walletProviderInfo?.rdns,
                    uuid: from?.walletProviderInfo?.uuid,
                    isPassportWallet: isPassportProvider(from?.web3Provider),
                    isMetaMask: isMetaMaskProvider(from?.web3Provider),
                },
                toWalletAddress: toAddress,
                toNetwork,
                toWallet: {
                    address: toAddress,
                    rdns: to?.walletProviderInfo?.rdns,
                    uuid: to?.walletProviderInfo?.uuid,
                    isPassportWallet: isPassportProvider(to?.web3Provider),
                    isMetaMask: isMetaMaskProvider(to?.web3Provider),
                },
                amount,
                fiatAmount: fromFiatAmount,
                tokenAddress: token?.address,
                moveType: isTransfer ? 'transfer' : 'bridge',
            },
        });
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: BridgeWidgetViews.APPROVE_TRANSACTION,
                    approveTransaction,
                    transaction,
                },
            },
        });
    }, [
        viewDispatch,
        approveTransaction,
        transaction,
        from?.web3Provider,
        from?.network,
        from?.walletProviderInfo,
        to?.web3Provider,
        to?.network,
        to?.walletProviderInfo,
    ]);
    return (jsxs(Box, { testId: testId, sx: bridgeReviewWrapperStyles, children: [jsx(Heading, { testId: `${testId}-heading`, size: "small", weight: "regular", sx: bridgeReviewHeadingStyles, children: t('views.BRIDGE_REVIEW.heading') }), jsxs(MenuItem, { testId: `${testId}-from-amount`, size: "small", emphasized: true, sx: topMenuItemStyles, children: [jsx(MenuItem.Label, { size: "small", sx: { marginBottom: 'base.spacing.x4', fontWeight: 'bold' }, children: t('views.BRIDGE_REVIEW.fromLabel.amountHeading') }), jsx(MenuItem.Caption, {}), jsx(MenuItem.PriceDisplay, { price: displayAmount ?? '-', fiatAmount: `${t('views.BRIDGE_REVIEW.fiatPricePrefix')}${fromFiatAmount}` })] }), jsxs(MenuItem, { testId: `${testId}-from-address`, size: "xSmall", emphasized: true, sx: bottomMenuItemStyles, children: [(fromWalletIsWalletConnect && fromWalletLogoUrl) ? (jsxs(Fragment, { children: [jsx(MenuItem.FramedImage, { imageUrl: fromWalletLogoUrl, alt: "walletconnect", sx: wcWalletLogoStyles }), jsx(Logo, { logo: "WalletConnectSymbol", sx: wcStickerLogoStyles })] })) : (from?.walletProviderInfo && (jsx(RawImage, { src: from?.walletProviderInfo.icon, alt: from?.walletProviderInfo.name, sx: rawImageStyle }))), jsxs(MenuItem.Label, { sx: { marginLeft: (fromWalletIsWalletConnect && fromWalletLogoUrl) ? '0px' : '45px' }, children: [jsx("strong", { children: t('views.BRIDGE_REVIEW.fromLabel.heading') }), ' ', jsx(Body, { size: "small", sx: {
                                    color: 'base.color.text.body.secondary',
                                }, children: abbreviateAddress(fromAddress ?? '') })] }), fromNetwork && (jsx(MenuItem.FramedImage, { use: (jsx("img", { src: getChainImage(environment, fromNetwork), alt: networkName[fromNetwork] })), sx: networkIconStyles }))] }), jsx(Box, { sx: arrowIconWrapperStyles, children: jsx(Icon, { icon: "ArrowBackward", sx: arrowIconStyles }) }), jsxs(MenuItem, { testId: `${testId}-to-address`, size: "xSmall", emphasized: true, sx: topMenuItemStyles, children: [(toWalletIsWalletConnect && toWalletLogoUrl) ? (jsxs(Fragment, { children: [jsx(MenuItem.FramedImage, { imageUrl: toWalletLogoUrl, alt: "walletconnect", sx: wcWalletLogoStyles }), jsx(Logo, { logo: "WalletConnectSymbol", sx: wcStickerLogoStyles })] })) : (to?.walletProviderInfo && (jsx(RawImage, { src: to?.walletProviderInfo.icon, alt: to?.walletProviderInfo.name, sx: rawImageStyle }))), jsxs(MenuItem.Label, { sx: { marginLeft: (toWalletIsWalletConnect && toWalletLogoUrl) ? '0px' : '45px' }, children: [jsx("strong", { children: t('views.BRIDGE_REVIEW.toLabel.heading') }), ' ', jsx(Body, { size: "small", sx: {
                                    color: 'base.color.text.body.secondary',
                                }, children: abbreviateAddress(toAddress ?? '') })] }), toNetwork && (jsx(MenuItem.FramedImage, { use: (jsx("img", { src: getChainImage(environment, toNetwork), alt: networkName[toNetwork] })), sx: networkIconStyles }))] }), jsx(Fees, { gasFeeValue: gasFee, gasFeeFiatValue: gasFeeFiatValue, gasFeeToken: estimates?.token, fees: formatFeeBreakdown(), onFeesClick: () => {
                    track({
                        userJourney: UserJourney.BRIDGE,
                        screen: 'MoveCoins',
                        control: 'ViewFees',
                        controlType: 'Button',
                    });
                }, sx: { borderTopRightRadius: '0', borderTopLeftRadius: '0' }, loading: loading }), jsx(Box, { sx: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    paddingY: 'base.spacing.x6',
                    width: '100%',
                }, children: (estimates && !loading) && (jsx(Button, { size: "large", sx: { width: '100%' }, onClick: submitBridge, disabled: loading, testId: `${testId}__submit-button`, children: loading ? (jsx(Button.Icon, { icon: "Loading", sx: bridgeButtonIconLoadingStyle })) : (t('views.BRIDGE_REVIEW.submitButton.buttonText')) })) }), jsx(NetworkSwitchDrawer, { visible: showSwitchNetworkDrawer, targetChainId: from?.network, provider: from?.web3Provider, checkout: checkout, onCloseDrawer: () => setShowSwitchNetworkDrawer(false), onNetworkSwitch: handleNetworkSwitch }), jsx(NotEnoughGas, { environment: checkout.config.environment, visible: showNotEnoughGasDrawer, onCloseDrawer: () => setShowNotEnoughGasDrawer(false), walletAddress: from?.walletAddress || '', tokenSymbol: from?.network === getL1ChainId(checkout?.config)
                    ? ETH_TOKEN_SYMBOL
                    : IMX_TOKEN_SYMBOL, onAddCoinsClick: () => {
                    viewDispatch({
                        payload: {
                            type: ViewActions.UPDATE_VIEW,
                            view: {
                                type: SharedViews.TOP_UP_VIEW,
                            },
                        },
                    });
                } }), jsx(WithdrawalQueueDrawer, { visible: withdrawalQueueWarning.visible, warningType: withdrawalQueueWarning.warningType, checkout: checkout, onAdjustAmount: () => {
                    setWithdrawalQueueWarning({ visible: false });
                    viewDispatch({
                        payload: {
                            type: ViewActions.UPDATE_VIEW,
                            view: {
                                type: BridgeWidgetViews.BRIDGE_FORM,
                            },
                        },
                    });
                }, onCloseDrawer: () => {
                    setWithdrawalQueueWarning({ visible: false });
                }, threshold: withdrawalQueueWarning.threshold })] }));
}

function BridgeReview() {
    const { t } = useTranslation();
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.BRIDGE,
            screen: 'Review',
        });
    }, []);
    return (jsx(SimpleLayout, { testId: "bridge-review", header: (jsx(HeaderNavigation, { showBack: true, title: t('views.BRIDGE_REVIEW.layoutHeading'), onCloseButtonClick: () => sendBridgeWidgetCloseEvent(eventTarget) })), footer: (jsx(FooterLogo, {})), children: jsx(BridgeReviewSummary, {}) }));
}

function RocketHero({ environment }) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { RiveComponent } = dist.useRive({
        src: `${CHECKOUT_CDN_BASE_URL[environment]}/v1/blob/img/rocket.riv`,
        autoplay: true,
        layout: new dist.Layout({ fit: dist.Fit.Cover }),
        stateMachines: 'State Machine 1',
    });
    return (jsx(Box, { sx: {
            ...heroBackGroundStyles,
            background: 'base.color.translucent.emphasis.100',
        }, children: jsx(Box, { sx: heroImageStyles, rc: jsx(RiveComponent, {}) }) }));
}

function MoveInProgress({ transactionHash, isTransfer }) {
    const { t } = useTranslation();
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { page } = useAnalytics();
    const { cryptoFiatState } = reactExports.useContext(CryptoFiatContext);
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { bridgeState: { checkout, from, to, token, amount, }, } = reactExports.useContext(BridgeContext);
    reactExports.useEffect(() => {
        sendBridgeTransactionSentEvent(eventTarget, transactionHash);
        const fiatAmount = calculateCryptoToFiat(amount, token?.symbol ?? '', cryptoFiatState.conversions);
        page({
            userJourney: UserJourney.BRIDGE,
            screen: 'InProgress',
            extras: {
                fromWalletAddress: from?.walletAddress,
                toWalletAddress: to?.walletAddress,
                amount,
                fiatAmount,
                tokenAddress: token?.address,
                moveType: isTransfer ? 'transfer' : 'bridge',
            },
        });
    }, []);
    return (jsx(SimpleLayout, { testId: "move-in-progress-view", header: (jsx(HeaderNavigation, { transparent: true, onCloseButtonClick: () => sendBridgeWidgetCloseEvent(eventTarget), rightActions: (jsxs(Fragment, { children: [jsx(ButtCon, { icon: "Minting", sx: ButtonNavigationStyles(), onClick: () => {
                            viewDispatch({
                                payload: {
                                    type: ViewActions.UPDATE_VIEW,
                                    view: { type: BridgeWidgetViews.TRANSACTIONS },
                                },
                            });
                        }, testId: "settings-button" }), !isTransfer
                        && (jsx(Badge, { isAnimated: true, variant: "guidance", sx: {
                                position: 'absolute',
                                right: 'base.spacing.x14',
                                top: 'base.spacing.x1',
                            } }))] })) })), footer: (jsx(FooterLogo, {})), heroContent: jsx(RocketHero, { environment: checkout.config.environment }), floatHeader: true, children: jsxs(SimpleTextBody, { heading: t(isTransfer ? 'views.IN_PROGRESS.transferHeading' : 'views.IN_PROGRESS.heading'), children: [!isTransfer && (jsxs(Fragment, { children: [t('views.IN_PROGRESS.body1'), jsx("br", {}), jsx("br", {})] })), t('views.IN_PROGRESS.body2')] }) }));
}

function ApproveTransaction({ bridgeTransaction }) {
    const { t } = useTranslation();
    const { bridgeState } = reactExports.useContext(BridgeContext);
    const { checkout, from, to, token, amount, } = bridgeState;
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.BRIDGE,
            screen: 'ApproveTransaction',
            extras: {
                moveType: bridgeTransaction ? 'bridge' : 'transfer',
            },
        });
    }, []);
    // Local state
    const [actionDisabled, setActionDisabled] = reactExports.useState(false);
    const [txProcessing, setTxProcessing] = reactExports.useState(false);
    const [loading, setLoading] = reactExports.useState(false);
    const [rejectedBridge, setRejectedBridge] = reactExports.useState(false);
    // Common error view function
    const showErrorView = reactExports.useCallback(() => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SharedViews.ERROR_VIEW,
                    error: new Error('No checkout object or no provider object found'),
                },
            },
        });
    }, [viewDispatch]);
    const goBack = reactExports.useCallback(() => {
        viewDispatch({
            payload: {
                type: ViewActions.GO_BACK,
            },
        });
    }, [viewDispatch]);
    const handleExceptions = (err) => {
        if (err.type === CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT) {
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: BridgeWidgetViews.BRIDGE_FAILURE,
                        reason: 'Unpredictable gas limit',
                    },
                },
            });
            return;
        }
        if (err.type === CheckoutErrorType.TRANSACTION_FAILED
            || err.type === CheckoutErrorType.INSUFFICIENT_FUNDS
            || (err.receipt && err.receipt.status === 0)) {
            let reason = 'Transaction failed';
            if (err.type === CheckoutErrorType.INSUFFICIENT_FUNDS)
                reason = 'Insufficient funds';
            if (err.receipt && err.receipt.status === 0)
                reason = 'Transaction failed to settle on chain';
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: BridgeWidgetViews.BRIDGE_FAILURE,
                        reason,
                    },
                },
            });
            return;
        }
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SharedViews.ERROR_VIEW,
                    error: err,
                },
            },
        });
    };
    const handleApproveTransferClick = reactExports.useCallback(async () => {
        if (!checkout || !from?.web3Provider) {
            showErrorView();
            return;
        }
        if (actionDisabled)
            return;
        setActionDisabled(true);
        setTxProcessing(true);
        const tokenToTransfer = token?.address?.toLowerCase() ?? NATIVE.toUpperCase();
        let txHash;
        try {
            if (tokenToTransfer === NATIVE.toLowerCase()) {
                const request = {
                    to: to?.walletAddress,
                    value: parseUnits(amount, token?.decimals),
                };
                const result = await checkout.sendTransaction({
                    provider: from.web3Provider,
                    transaction: request,
                });
                txHash = result.transactionResponse.hash;
            }
            else {
                const erc20 = getErc20Contract(tokenToTransfer, from.web3Provider.getSigner());
                const parsedAmount = parseUnits(amount, token?.decimals);
                const response = await checkout.providerCall(from.web3Provider, async () => await erc20.transfer(to?.walletAddress, parsedAmount));
                txHash = response.hash;
            }
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: BridgeWidgetViews.IN_PROGRESS,
                        transactionHash: txHash,
                        isTransfer: true,
                    },
                },
            });
        }
        catch (e) {
            setTxProcessing(false);
            if (e.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
                setRejectedBridge(true);
            }
            else {
                handleExceptions(e);
            }
        }
        finally {
            setActionDisabled(false);
        }
    }, [
        checkout,
        from,
        showErrorView,
        viewDispatch,
        actionDisabled,
    ]);
    const handleApproveBridgeClick = reactExports.useCallback(async () => {
        let bridgeRejected = false;
        // Force unwrap as bridgeTransaction being defined is a requirement for this callback to be invoked
        const { approveTransaction, transaction } = bridgeTransaction;
        if (!checkout || !from?.web3Provider || !transaction) {
            showErrorView();
            return;
        }
        if (actionDisabled)
            return;
        setActionDisabled(true);
        // Approvals as required
        if (approveTransaction.unsignedTx) {
            try {
                setTxProcessing(true);
                const approveSpendingResult = await checkout.sendTransaction({
                    provider: from.web3Provider,
                    transaction: approveTransaction.unsignedTx,
                });
                const approvalReceipt = await approveSpendingResult.transactionResponse.wait();
                if (approvalReceipt.status !== 1) {
                    viewDispatch({
                        payload: {
                            type: ViewActions.UPDATE_VIEW,
                            view: {
                                type: BridgeWidgetViews.BRIDGE_FAILURE,
                                reason: 'Transaction failed to settle on chain',
                            },
                        },
                    });
                    return;
                }
            }
            catch (error) {
                setTxProcessing(false);
                if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
                    setRejectedBridge(true);
                    bridgeRejected = true;
                }
                else {
                    handleExceptions(error);
                }
            }
            finally {
                setActionDisabled(false);
            }
        }
        try {
            if (bridgeRejected)
                return;
            setTxProcessing(true);
            const sendResult = await checkout.sendTransaction({
                provider: from.web3Provider,
                transaction: transaction.unsignedTx,
            });
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: BridgeWidgetViews.IN_PROGRESS,
                        transactionHash: sendResult.transactionResponse.hash,
                        isTransfer: false,
                    },
                },
            });
            const receipt = await sendResult.transactionResponse.wait();
            if (receipt.status === 0) {
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: BridgeWidgetViews.BRIDGE_FAILURE,
                            reason: 'Approval transaction failed to settle on chain',
                        },
                    },
                });
            }
        }
        catch (error) {
            if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
                setRejectedBridge(true);
            }
            else {
                handleExceptions(error);
            }
        }
        finally {
            setLoading(false);
            setTxProcessing(false);
            setActionDisabled(false);
        }
    }, [
        checkout,
        from,
        showErrorView,
        viewDispatch,
        bridgeTransaction,
        actionDisabled,
    ]);
    return (jsxs(Fragment, { children: [loading && (jsx(LoadingView, { loadingText: t('views.APPROVE_TRANSACTION.loadingView.text') })), !loading && (jsx(SimpleLayout, { header: (jsx(HeaderNavigation, { transparent: true, showBack: true, onCloseButtonClick: () => sendBridgeWidgetCloseEvent(eventTarget), onBackButtonClick: goBack })), floatHeader: true, heroContent: jsx(WalletApproveHero, {}), footer: (jsxs(Box, { sx: { width: '100%', flexDirection: 'column' }, children: [jsx(FooterButton, { loading: txProcessing, actionText: t(`views.APPROVE_TRANSACTION.${rejectedBridge ? 'footer.retryText' : 'footer.buttonText'}`), onActionClick: bridgeTransaction ? handleApproveBridgeClick : handleApproveTransferClick }), jsx(FooterLogo, {})] })), children: jsx(SimpleTextBody, { heading: t('views.APPROVE_TRANSACTION.content.heading'), children: jsx(Box, { children: t('views.APPROVE_TRANSACTION.content.body') }) }) }))] }));
}

const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 'base.spacing.x6',
    paddingBottom: 'base.spacing.x1',
    height: '100%',
};
const contentTextStyles = {
    color: 'base.color.text.body.secondary',
    fontFamily: 'base.font.family.heading.secondary',
    textAlign: 'center',
    marginTop: '15px',
};
const actionButtonContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'base.spacing.x2',
    height: '100%',
    width: '100%',
};
const actionButtonStyles = {
    width: '100%',
    height: 'base.spacing.x16',
};

function NotEnoughEthToWithdraw({ visible, onClose, onChangeAccount, }) {
    const { t } = useTranslation();
    const { bridgeState: { checkout } } = reactExports.useContext(BridgeContext);
    const ethLogo = getEthTokenImage(checkout.config.environment);
    return (jsx(Drawer, { headerBarTitle: undefined, size: "full", onCloseDrawer: onClose, visible: visible, showHeaderBar: false, children: jsx(Drawer.Content, { children: jsxs(Box, { testId: "not-enough-eth-drawer", sx: containerStyles, children: [jsx(CloudImage, { sx: { w: 'base.icon.size.600', h: 'base.icon.size.600' }, use: (jsx("img", { src: ethLogo, alt: "ETH" })) }), jsx(Heading, { size: "small", sx: contentTextStyles, testId: "not-enough-gas-heading", children: `${t('drawers.notEnoughEthWithdrawal.content.heading1')} ${ETH_TOKEN_SYMBOL} ${t('drawers.notEnoughEthWithdrawal.content.heading2')}` }), jsx(Body, { sx: contentTextStyles, children: `${t('drawers.notEnoughEthWithdrawal.content.body1')} ${ETH_TOKEN_SYMBOL} ${t('drawers.notEnoughEthWithdrawal.content.body2')}` }), jsxs(Box, { sx: actionButtonContainerStyles, children: [jsx(Button, { testId: "not-enough-eth-drawer-retry-button", sx: actionButtonStyles, variant: "tertiary", onClick: onChangeAccount, children: t('drawers.notEnoughEthWithdrawal.buttons.retry') }), jsx(Button, { sx: actionButtonStyles, variant: "tertiary", onClick: onClose, testId: "not-enough-eth-drawer-dismiss-button", children: t('drawers.notEnoughEthWithdrawal.buttons.dismiss') })] })] }) }) }));
}

function ClaimWithdrawal({ transaction }) {
    const { t } = useTranslation();
    const { bridgeState: { checkout, tokenBridge, from } } = reactExports.useContext(BridgeContext);
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.BRIDGE,
            screen: 'ClaimWithdrawal',
        });
    }, []);
    const [txProcessing, setTxProcessing] = reactExports.useState(false);
    const [loading, setLoading] = reactExports.useState(false);
    const [hasWithdrawError, setHasWithdrawError] = reactExports.useState(false);
    const [withdrawalResponse, setWithdrawalResponse] = reactExports.useState();
    const [showNotEnoughEthDrawer, setShowNotEnoughEthDrawer] = reactExports.useState(false);
    const goBack = reactExports.useCallback(() => {
        viewDispatch({
            payload: {
                type: ViewActions.GO_BACK,
            },
        });
    }, [viewDispatch]);
    /**
      * This effect should load the transaction that should be ready to be withdrawn.
      * There should be a receiver -> details.to_address AND
      * there should be an index ->  details.current_status.index
      */
    reactExports.useEffect(() => {
        const getWithdrawalTxn = async () => {
            if (!tokenBridge || !transaction || transaction.details.current_status?.index === undefined)
                return;
            // get withdrawal transaction from the token bridge by receipient address and index
            setLoading(true);
            try {
                const flowRateWithdrawTxnResponse = await tokenBridge?.getFlowRateWithdrawTx({
                    recipient: transaction.details.to_address,
                    index: transaction.details.current_status.index,
                });
                setWithdrawalResponse(flowRateWithdrawTxnResponse);
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.log(err);
            }
            finally {
                setLoading(false);
            }
        };
        getWithdrawalTxn();
    }, [tokenBridge, transaction]);
    const handleWithdrawalClaimClick = reactExports.useCallback(async ({ forceChangeAccount }) => {
        if (!checkout || !tokenBridge || !from?.web3Provider || !withdrawalResponse)
            return;
        if (!withdrawalResponse.pendingWithdrawal.canWithdraw || !withdrawalResponse.unsignedTx) {
            // eslint-disable-next-line max-len, no-console
            console.log(`Unable to process withdrawal transaction as it is not ready yet. Delay timeout at ${withdrawalResponse.pendingWithdrawal.timeoutEnd} `);
            return;
        }
        let providerToUse = from?.web3Provider;
        const l1ChainId = getL1ChainId(checkout.config);
        setTxProcessing(true);
        if (isPassportProvider(from?.web3Provider) || forceChangeAccount) {
            // user should switch to MetaMask
            try {
                const createProviderResult = await checkout.createProvider({ walletProviderName: WalletProviderName.METAMASK });
                const connectResult = await checkout.connect({
                    provider: createProviderResult.provider,
                    requestWalletPermissions: true,
                });
                providerToUse = connectResult.provider;
                setShowNotEnoughEthDrawer(false);
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.log(err);
                setHasWithdrawError(true);
                setTxProcessing(false);
                return;
            }
        }
        /**
         * Gas fee estimation and balance checks are done on a best effort basis.
         * If for some reason the balance calls fail or gas fee data calls fail
         * don't block the transaction from being submitted.
         */
        let gasEstimate;
        let ethGasCostWei = null;
        try {
            try {
                gasEstimate = await providerToUse.estimateGas(withdrawalResponse.unsignedTx);
            }
            catch (err) {
                gasEstimate = BigNumber.from(WITHDRAWAL_CLAIM_GAS_LIMIT);
            }
            let feeData = null;
            try {
                feeData = await providerToUse.getFeeData();
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.log(err);
            }
            let gasPriceInWei = null;
            if (feeData && feeData.lastBaseFeePerGas && feeData.maxPriorityFeePerGas) {
                gasPriceInWei = feeData.lastBaseFeePerGas.add(feeData.maxPriorityFeePerGas);
            }
            else if (feeData && feeData.gasPrice) {
                gasPriceInWei = feeData.gasPrice;
            }
            if (gasPriceInWei) {
                ethGasCostWei = gasEstimate.mul(gasPriceInWei);
            }
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
        }
        // get L1 balances and do check for enough ETH to cover gas
        try {
            const balancesResult = await checkout.getAllBalances({
                provider: providerToUse,
                chainId: l1ChainId,
            });
            const ethBalance = balancesResult.balances.find((balance) => isNativeToken(balance.token.address));
            if (!ethBalance || ethBalance.balance.lt(ethGasCostWei)) {
                setShowNotEnoughEthDrawer(true);
                setTxProcessing(false);
                return;
            }
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
        }
        // check that provider is connected to L1
        const network = await providerToUse.getNetwork();
        if (network.chainId !== l1ChainId) {
            try {
                const switchNetworkResult = await checkout.switchNetwork({
                    provider: providerToUse,
                    chainId: l1ChainId,
                });
                providerToUse = switchNetworkResult.provider;
            }
            catch (err) {
                setHasWithdrawError(true);
                setLoading(false);
                // eslint-disable-next-line no-console
                console.log(err);
                return;
            }
        }
        // send transaction to wallet for signing
        try {
            const response = await checkout.sendTransaction({
                provider: providerToUse,
                transaction: withdrawalResponse.unsignedTx,
            });
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: BridgeWidgetViews.CLAIM_WITHDRAWAL_IN_PROGRESS,
                        transactionResponse: response.transactionResponse,
                    },
                },
            });
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
            setHasWithdrawError(true);
            setTxProcessing(false);
        }
        finally {
            setTxProcessing(false);
        }
    }, [tokenBridge, from, withdrawalResponse]);
    return (jsxs(SimpleLayout, { testId: "claim-withdrawal", header: (jsx(HeaderNavigation, { transparent: true, showBack: true, onCloseButtonClick: () => sendBridgeWidgetCloseEvent(eventTarget), onBackButtonClick: goBack })), floatHeader: true, heroContent: jsx(WalletApproveHero, {}), footer: (jsxs(Box, { sx: {
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
            }, children: [jsx(Box, { sx: {
                        pb: 'base.spacing.x5',
                        px: 'base.spacing.x6',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }, children: jsx(Button, { testId: "claim-withdrawal-continue-button", size: "large", variant: "primary", disabled: loading, onClick: () => ((txProcessing || loading)
                            ? undefined
                            : handleWithdrawalClaimClick({ forceChangeAccount: true })), children: loading || txProcessing ? (jsx(Button.Icon, { icon: "Loading", sx: { width: 'base.icon.size.400' } })) : t(`views.CLAIM_WITHDRAWAL.${hasWithdrawError ? 'footer.retryText' : 'footer.buttonText'}`) }) }), jsx(FooterLogo, {})] })), children: [jsxs(SimpleTextBody, { heading: `${t('views.CLAIM_WITHDRAWAL.content.heading')} ${getChainNameById(getL1ChainId(checkout.config))}`, children: [jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', pb: 'base.spacing.x1' }, children: t('views.CLAIM_WITHDRAWAL.content.body') }), jsxs(Box, { children: [t('views.CLAIM_WITHDRAWAL.content.body2'), jsx(EllipsizedText, { text: transaction.details.to_address.toLowerCase() ?? '' })] })] }), jsx(NotEnoughEthToWithdraw, { visible: showNotEnoughEthDrawer, onClose: () => setShowNotEnoughEthDrawer(false), onChangeAccount: () => handleWithdrawalClaimClick({ forceChangeAccount: true }) })] }));
}

function BridgeWidget({ checkout, web3Provider, config, amount, tokenAddress, showBackButton, }) {
    const { t } = useTranslation();
    const { environment, isOnRampEnabled, isSwapEnabled, isBridgeEnabled, theme, } = config;
    const defaultTokenImage = getDefaultTokenImage(checkout.config.environment, theme);
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { page } = useAnalytics();
    const [viewState, viewDispatch] = reactExports.useReducer(viewReducer, {
        ...initialViewState,
        view: { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
        history: [{ type: BridgeWidgetViews.WALLET_NETWORK_SELECTION }],
    });
    const [bridgeState, bridgeDispatch] = reactExports.useReducer(bridgeReducer, {
        ...initialBridgeState,
        checkout,
        web3Provider: web3Provider ?? null,
        tokenBridge: (() => {
            let bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_TESTNET;
            if (checkout.config.isDevelopment)
                bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_DEVNET;
            if (checkout.config.isProduction)
                bridgeInstance = ETH_MAINNET_TO_ZKEVM_MAINNET;
            // Root provider is always L1
            const rootProvider = new JsonRpcProvider(checkout.config.networkMap.get(getL1ChainId(checkout.config))?.rpcUrls[0]);
            // Child provider is always L2
            const childProvider = new JsonRpcProvider(checkout.config.networkMap.get(getL2ChainId(checkout.config))?.rpcUrls[0]);
            const bridgeConfiguration = new BridgeConfiguration({
                baseConfig: new ImmutableConfiguration({ environment: checkout.config.environment }),
                bridgeInstance,
                rootProvider,
                childProvider,
            });
            return new TokenBridge(bridgeConfiguration);
        })(),
    });
    const viewReducerValues = reactExports.useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
    const bridgeReducerValues = reactExports.useMemo(() => ({ bridgeState, bridgeDispatch }), [bridgeState, bridgeDispatch]);
    const goBackToWalletNetworkSelectorClearState = reactExports.useCallback(() => {
        bridgeDispatch({
            payload: {
                type: BridgeActions.SET_WALLETS_AND_NETWORKS,
                from: null,
                to: null,
            },
        });
        bridgeDispatch({
            payload: {
                type: BridgeActions.SET_TOKEN_AND_AMOUNT,
                amount: '',
                token: null,
            },
        });
        viewDispatch({
            payload: {
                type: ViewActions.GO_BACK_TO,
                view: { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
            },
        });
    }, [viewDispatch]);
    const goBackToWalletNetworkSelector = reactExports.useCallback(() => {
        viewDispatch({
            payload: {
                type: ViewActions.GO_BACK_TO,
                view: { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
            },
        });
    }, [viewDispatch]);
    const updateToTransactionsPage = reactExports.useCallback(() => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: BridgeWidgetViews.TRANSACTIONS,
                },
            },
        });
    }, [viewDispatch]);
    const goBackToReview = reactExports.useCallback(() => {
        viewDispatch({
            payload: {
                type: ViewActions.GO_BACK_TO,
                view: { type: BridgeWidgetViews.BRIDGE_REVIEW },
            },
        });
    }, [viewDispatch]);
    reactExports.useEffect(() => {
        (async () => {
            bridgeDispatch({
                payload: {
                    type: BridgeActions.SET_PROVIDER,
                    web3Provider: web3Provider ?? null,
                },
            });
        })();
    }, [web3Provider]);
    return (jsx(ViewContext.Provider, { value: viewReducerValues, children: jsx(BridgeContext.Provider, { value: bridgeReducerValues, children: jsxs(CryptoFiatProvider, { environment: environment, children: [viewState.view.type === BridgeWidgetViews.WALLET_NETWORK_SELECTION && (jsx(WalletNetworkSelectionView, { showBackButton: showBackButton })), viewState.view.type === BridgeWidgetViews.BRIDGE_FORM && (jsx(Bridge, { amount: amount, tokenAddress: tokenAddress, defaultTokenImage: defaultTokenImage, theme: theme })), viewState.view.type === BridgeWidgetViews.BRIDGE_REVIEW && (jsx(BridgeReview, {})), viewState.view.type === BridgeWidgetViews.IN_PROGRESS && (jsx(MoveInProgress, { transactionHash: viewState.view.transactionHash, isTransfer: viewState.view.isTransfer })), viewState.view.type === BridgeWidgetViews.BRIDGE_FAILURE
                        && (jsx(StatusView, { testId: "bridge-fail", statusText: t('views.BRIDGE_FAILURE.bridgeFailureText.statusText'), actionText: t('views.BRIDGE_FAILURE.bridgeFailureText.actionText'), onActionClick: goBackToReview, statusType: StatusType.FAILURE, onRenderEvent: () => {
                                let reason = '';
                                if (viewState.view.type === BridgeWidgetViews.BRIDGE_FAILURE) {
                                    reason = viewState.view.reason;
                                }
                                page({
                                    userJourney: UserJourney.BRIDGE,
                                    screen: 'Failed',
                                    extras: {
                                        reason,
                                    },
                                });
                                sendBridgeFailedEvent(eventTarget, reason);
                            } })), viewState.view.type === BridgeWidgetViews.APPROVE_TRANSACTION && (jsx(ApproveTransaction, { bridgeTransaction: viewState.view.approveTransaction && viewState.view.transaction
                            ? { approveTransaction: viewState.view.approveTransaction, transaction: viewState.view.transaction }
                            : undefined })), viewState.view.type === BridgeWidgetViews.TRANSACTIONS && (jsx(Transactions, { onBackButtonClick: goBackToWalletNetworkSelector, defaultTokenImage: defaultTokenImage })), viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL && (jsx(ClaimWithdrawal, { transaction: viewState.view.transaction })), viewState.view.type === SharedViews.ERROR_VIEW && (jsx(ErrorView, { actionText: t('views.ERROR_VIEW.actionText'), onActionClick: goBackToWalletNetworkSelectorClearState, onCloseClick: () => sendBridgeWidgetCloseEvent(eventTarget), errorEventAction: () => {
                            page({
                                userJourney: UserJourney.BRIDGE,
                                screen: 'Error',
                            });
                        } })), viewState.view.type === SharedViews.TOP_UP_VIEW && (jsx(TopUpView, { analytics: { userJourney: UserJourney.BRIDGE }, widgetEvent: IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, checkout: checkout, provider: web3Provider, showOnrampOption: isOnRampEnabled, showSwapOption: isSwapEnabled, showBridgeOption: isBridgeEnabled, onCloseButtonClick: () => sendBridgeWidgetCloseEvent(eventTarget) })), viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_IN_PROGRESS && (jsx(ClaimWithdrawalInProgress, { transactionResponse: viewState.view.transactionResponse })), viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_SUCCESS && (jsx(StatusView, { statusText: t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.success.text'), actionText: t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.success.actionText'), onRenderEvent: () => {
                            page({
                                userJourney: UserJourney.BRIDGE,
                                screen: 'ClaimWithdrawalSuccess',
                            });
                            sendBridgeClaimWithdrawalSuccessEvent(eventTarget, viewState.view.transactionHash);
                        }, onActionClick: updateToTransactionsPage, statusType: StatusType.SUCCESS, testId: "claim-withdrawal-success-view" })), viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE && (jsx(StatusView, { statusText: t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.failure.text'), actionText: t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.failure.actionText'), onRenderEvent: () => {
                            let reason = '';
                            if (viewState.view.type === BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE) {
                                reason = viewState.view.reason;
                            }
                            page({
                                userJourney: UserJourney.BRIDGE,
                                screen: 'ClaimWithdrawalFailure',
                                extras: {
                                    reason,
                                },
                            });
                            sendBridgeClaimWithdrawalFailedEvent(eventTarget, viewState.view.transactionHash, 'Transaction failed');
                        }, onActionClick: updateToTransactionsPage, statusType: StatusType.FAILURE, onCloseClick: () => sendBridgeWidgetCloseEvent(eventTarget), testId: "claim-withdrawal-fail-view" })), viewState.view.type === SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW && (jsx(ServiceUnavailableErrorView, { service: ServiceType.GENERIC, onCloseClick: () => sendBridgeWidgetCloseEvent(eventTarget) }))] }) }) }));
}

var BridgeWidget$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: BridgeWidget
});

export { BridgeWidget as B, Contract as C, BridgeWidget$1 as a };
