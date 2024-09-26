import { de as __awaiter, df as __generator, dg as loadScript, dh as getNextIntegrationsURL, di as unloadScript, dj as __spreadArray, dk as isOffline, dl as __assign, dm as ContextCancelation, dn as applyDestinationMiddleware, dp as dist, dq as isServer, dr as mergedOptions, ds as isPlainObject, dt as pWhile, du as PriorityQueue, dv as PersistedPriorityQueue, dw as attempt, dx as isOnline, dy as Context } from './index-Ae2juTF3.js';
import { i as isPlanEventEnabled } from './is-plan-event-enabled-mXX0dwl-.js';

function normalizeName(name) {
    return name.toLowerCase().replace('.', '').replace(/\s+/g, '-');
}
function obfuscatePathName(pathName, obfuscate) {
    if (obfuscate === void 0) { obfuscate = false; }
    return obfuscate ? btoa(pathName).replace(/=/g, '') : undefined;
}
function resolveIntegrationNameFromSource(integrationSource) {
    return ('Integration' in integrationSource
        ? integrationSource.Integration
        : integrationSource).prototype.name;
}
function recordLoadMetrics(fullPath, ctx, name) {
    var _a, _b;
    try {
        var metric = ((_b = (_a = window === null || window === void 0 ? void 0 : window.performance) === null || _a === void 0 ? void 0 : _a.getEntriesByName(fullPath, 'resource')) !== null && _b !== void 0 ? _b : [])[0];
        // we assume everything that took under 100ms is cached
        metric &&
            ctx.stats.gauge('legacy_destination_time', Math.round(metric.duration), __spreadArray([
                name
            ], (metric.duration < 100 ? ['cached'] : []), true));
    }
    catch (_) {
        // not available
    }
}
function buildIntegration(integrationSource, integrationSettings, analyticsInstance) {
    var integrationCtr;
    // GA and Appcues use a different interface to instantiating integrations
    if ('Integration' in integrationSource) {
        var analyticsStub = {
            user: function () { return analyticsInstance.user(); },
            addIntegration: function () { },
        };
        integrationSource(analyticsStub);
        integrationCtr = integrationSource.Integration;
    }
    else {
        integrationCtr = integrationSource;
    }
    var integration = new integrationCtr(integrationSettings);
    integration.analytics = analyticsInstance;
    return integration;
}
function loadIntegration(ctx, name, version, obfuscate) {
    return __awaiter(this, void 0, void 0, function () {
        var pathName, obfuscatedPathName, path, fullPath, err_1, deps;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathName = normalizeName(name);
                    obfuscatedPathName = obfuscatePathName(pathName, obfuscate);
                    path = getNextIntegrationsURL();
                    fullPath = "".concat(path, "/integrations/").concat(obfuscatedPathName !== null && obfuscatedPathName !== void 0 ? obfuscatedPathName : pathName, "/").concat(version, "/").concat(obfuscatedPathName !== null && obfuscatedPathName !== void 0 ? obfuscatedPathName : pathName, ".dynamic.js.gz");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, loadScript(fullPath)];
                case 2:
                    _a.sent();
                    recordLoadMetrics(fullPath, ctx, name);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    ctx.stats.gauge('legacy_destination_time', -1, ["plugin:".concat(name), "failed"]);
                    throw err_1;
                case 4:
                    deps = window["".concat(pathName, "Deps")];
                    return [4 /*yield*/, Promise.all(deps.map(function (dep) { return loadScript(path + dep + '.gz'); }))
                        // @ts-ignore
                    ];
                case 5:
                    _a.sent();
                    // @ts-ignore
                    window["".concat(pathName, "Loader")]();
                    return [2 /*return*/, window[
                        // @ts-ignore
                        "".concat(pathName, "Integration")]];
            }
        });
    });
}
function unloadIntegration(name, version, obfuscate) {
    return __awaiter(this, void 0, void 0, function () {
        var path, pathName, obfuscatedPathName, fullPath;
        return __generator(this, function (_a) {
            path = getNextIntegrationsURL();
            pathName = normalizeName(name);
            obfuscatedPathName = obfuscatePathName(name, obfuscate);
            fullPath = "".concat(path, "/integrations/").concat(obfuscatedPathName !== null && obfuscatedPathName !== void 0 ? obfuscatedPathName : pathName, "/").concat(version, "/").concat(obfuscatedPathName !== null && obfuscatedPathName !== void 0 ? obfuscatedPathName : pathName, ".dynamic.js.gz");
            return [2 /*return*/, unloadScript(fullPath)];
        });
    });
}
function resolveVersion(settings) {
    var _a, _b, _c, _d;
    return ((_d = (_b = (_a = settings === null || settings === void 0 ? void 0 : settings.versionSettings) === null || _a === void 0 ? void 0 : _a.override) !== null && _b !== void 0 ? _b : (_c = settings === null || settings === void 0 ? void 0 : settings.versionSettings) === null || _c === void 0 ? void 0 : _c.version) !== null && _d !== void 0 ? _d : 'latest');
}

var isInstallableIntegration = function (name, integrationSettings) {
    var _a;
    var type = integrationSettings.type, bundlingStatus = integrationSettings.bundlingStatus, versionSettings = integrationSettings.versionSettings;
    // We use `!== 'unbundled'` (versus `=== 'bundled'`) to be inclusive of
    // destinations without a defined value for `bundlingStatus`
    var deviceMode = bundlingStatus !== 'unbundled' &&
        (type === 'browser' || ((_a = versionSettings === null || versionSettings === void 0 ? void 0 : versionSettings.componentTypes) === null || _a === void 0 ? void 0 : _a.includes('browser')));
    // checking for iterable is a quick fix we need in place to prevent
    // errors showing Iterable as a failed destiantion. Ideally, we should
    // fix the Iterable metadata instead, but that's a longer process.
    return !name.startsWith('Segment') && name !== 'Iterable' && deviceMode;
};
var isDisabledIntegration = function (integrationName, globalIntegrations) {
    var allDisableAndNotDefined = globalIntegrations.All === false &&
        globalIntegrations[integrationName] === undefined;
    return (globalIntegrations[integrationName] === false || allDisableAndNotDefined);
};

function flushQueue(xt, queue) {
    return __awaiter(this, void 0, void 0, function () {
        var failedQueue;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    failedQueue = [];
                    if (isOffline()) {
                        return [2 /*return*/, queue];
                    }
                    return [4 /*yield*/, pWhile(function () { return queue.length > 0 && isOnline(); }, function () { return __awaiter(_this, void 0, void 0, function () {
                            var ctx, result, success;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        ctx = queue.pop();
                                        if (!ctx) {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, attempt(ctx, xt)];
                                    case 1:
                                        result = _a.sent();
                                        success = result instanceof Context;
                                        if (!success) {
                                            failedQueue.push(ctx);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                        // re-add failed tasks
                    ];
                case 1:
                    _a.sent();
                    // re-add failed tasks
                    failedQueue.map(function (failed) { return queue.pushWithBackoff(failed); });
                    return [2 /*return*/, queue];
            }
        });
    });
}
var LegacyDestination = /** @class */ (function () {
    function LegacyDestination(name, version, writeKey, settings, options, integrationSource) {
        if (settings === void 0) { settings = {}; }
        this.options = {};
        this.type = 'destination';
        this.middleware = [];
        this._ready = false;
        this._initialized = false;
        this.flushing = false;
        this.name = name;
        this.version = version;
        this.settings = __assign({}, settings);
        this.disableAutoISOConversion = options.disableAutoISOConversion || false;
        this.integrationSource = integrationSource;
        // AJS-Renderer sets an extraneous `type` setting that clobbers
        // existing type defaults. We need to remove it if it's present
        if (this.settings['type'] && this.settings['type'] === 'browser') {
            delete this.settings['type'];
        }
        this.options = options;
        this.buffer = options.disableClientPersistence
            ? new PriorityQueue(4, [])
            : new PersistedPriorityQueue(4, "".concat(writeKey, ":dest-").concat(name));
        this.scheduleFlush();
    }
    LegacyDestination.prototype.isLoaded = function () {
        return this._ready;
    };
    LegacyDestination.prototype.ready = function () {
        var _a;
        return (_a = this.onReady) !== null && _a !== void 0 ? _a : Promise.resolve();
    };
    LegacyDestination.prototype.load = function (ctx, analyticsInstance) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var integrationSource, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this._ready || this.onReady !== undefined) {
                            return [2 /*return*/];
                        }
                        if (!((_a = this.integrationSource) !== null && _a !== void 0)) return [3 /*break*/, 1];
                        _b = _a;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, loadIntegration(ctx, this.name, this.version, this.options.obfuscate)];
                    case 2:
                        _b = (_c.sent());
                        _c.label = 3;
                    case 3:
                        integrationSource = _b;
                        this.integration = buildIntegration(integrationSource, this.settings, analyticsInstance);
                        this.onReady = new Promise(function (resolve) {
                            var onReadyFn = function () {
                                _this._ready = true;
                                resolve(true);
                            };
                            _this.integration.once('ready', onReadyFn);
                        });
                        this.onInitialize = new Promise(function (resolve) {
                            var onInit = function () {
                                _this._initialized = true;
                                resolve(true);
                            };
                            _this.integration.on('initialize', onInit);
                        });
                        try {
                            ctx.stats.increment('analytics_js.integration.invoke', 1, [
                                "method:initialize",
                                "integration_name:".concat(this.name),
                            ]);
                            this.integration.initialize();
                        }
                        catch (error) {
                            ctx.stats.increment('analytics_js.integration.invoke.error', 1, [
                                "method:initialize",
                                "integration_name:".concat(this.name),
                            ]);
                            throw error;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LegacyDestination.prototype.unload = function (_ctx, _analyticsInstance) {
        return unloadIntegration(this.name, this.version, this.options.obfuscate);
    };
    LegacyDestination.prototype.addMiddleware = function () {
        var _a;
        var fn = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fn[_i] = arguments[_i];
        }
        this.middleware = (_a = this.middleware).concat.apply(_a, fn);
    };
    LegacyDestination.prototype.shouldBuffer = function (ctx) {
        return (
        // page events can't be buffered because of destinations that automatically add page views
        ctx.event.type !== 'page' &&
            (isOffline() || this._ready === false || this._initialized === false));
    };
    LegacyDestination.prototype.send = function (ctx, clz, eventType) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var plan, ev, planEvent, afterMiddleware, event, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.shouldBuffer(ctx)) {
                            this.buffer.push(ctx);
                            this.scheduleFlush();
                            return [2 /*return*/, ctx];
                        }
                        plan = (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.plan) === null || _b === void 0 ? void 0 : _b.track;
                        ev = ctx.event.event;
                        if (plan && ev && this.name !== 'Segment.io') {
                            planEvent = plan[ev];
                            if (!isPlanEventEnabled(plan, planEvent)) {
                                ctx.updateEvent('integrations', __assign(__assign({}, ctx.event.integrations), { All: false, 'Segment.io': true }));
                                ctx.cancel(new ContextCancelation({
                                    retry: false,
                                    reason: "Event ".concat(ev, " disabled for integration ").concat(this.name, " in tracking plan"),
                                    type: 'Dropped by plan',
                                }));
                                return [2 /*return*/, ctx];
                            }
                            else {
                                ctx.updateEvent('integrations', __assign(__assign({}, ctx.event.integrations), planEvent === null || planEvent === void 0 ? void 0 : planEvent.integrations));
                            }
                            if ((planEvent === null || planEvent === void 0 ? void 0 : planEvent.enabled) && (planEvent === null || planEvent === void 0 ? void 0 : planEvent.integrations[this.name]) === false) {
                                ctx.cancel(new ContextCancelation({
                                    retry: false,
                                    reason: "Event ".concat(ev, " disabled for integration ").concat(this.name, " in tracking plan"),
                                    type: 'Dropped by plan',
                                }));
                                return [2 /*return*/, ctx];
                            }
                        }
                        return [4 /*yield*/, applyDestinationMiddleware(this.name, ctx.event, this.middleware)];
                    case 1:
                        afterMiddleware = _c.sent();
                        if (afterMiddleware === null) {
                            return [2 /*return*/, ctx];
                        }
                        event = new clz(afterMiddleware, {
                            traverse: !this.disableAutoISOConversion,
                        });
                        ctx.stats.increment('analytics_js.integration.invoke', 1, [
                            "method:".concat(eventType),
                            "integration_name:".concat(this.name),
                        ]);
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        if (!this.integration) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.integration.invoke.call(this.integration, eventType, event)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _c.sent();
                        ctx.stats.increment('analytics_js.integration.invoke.error', 1, [
                            "method:".concat(eventType),
                            "integration_name:".concat(this.name),
                        ]);
                        throw err_1;
                    case 6: return [2 /*return*/, ctx];
                }
            });
        });
    };
    LegacyDestination.prototype.track = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.send(ctx, dist.Track, 'track')];
            });
        });
    };
    LegacyDestination.prototype.page = function (ctx) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                if (((_a = this.integration) === null || _a === void 0 ? void 0 : _a._assumesPageview) && !this._initialized) {
                    this.integration.initialize();
                }
                return [2 /*return*/, this.onInitialize.then(function () {
                        return _this.send(ctx, dist.Page, 'page');
                    })];
            });
        });
    };
    LegacyDestination.prototype.identify = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.send(ctx, dist.Identify, 'identify')];
            });
        });
    };
    LegacyDestination.prototype.alias = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.send(ctx, dist.Alias, 'alias')];
            });
        });
    };
    LegacyDestination.prototype.group = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.send(ctx, dist.Group, 'group')];
            });
        });
    };
    LegacyDestination.prototype.scheduleFlush = function () {
        var _this = this;
        if (this.flushing) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.flushing = true;
                        _a = this;
                        return [4 /*yield*/, flushQueue(this, this.buffer)];
                    case 1:
                        _a.buffer = _b.sent();
                        this.flushing = false;
                        if (this.buffer.todo > 0) {
                            this.scheduleFlush();
                        }
                        return [2 /*return*/];
                }
            });
        }); }, Math.random() * 5000);
    };
    return LegacyDestination;
}());
function ajsDestinations(writeKey, settings, globalIntegrations, options, routingMiddleware, legacyIntegrationSources) {
    var _a, _b;
    if (globalIntegrations === void 0) { globalIntegrations = {}; }
    if (options === void 0) { options = {}; }
    if (isServer()) {
        return [];
    }
    if (settings.plan) {
        options = options !== null && options !== void 0 ? options : {};
        options.plan = settings.plan;
    }
    var routingRules = (_b = (_a = settings.middlewareSettings) === null || _a === void 0 ? void 0 : _a.routingRules) !== null && _b !== void 0 ? _b : [];
    var remoteIntegrationsConfig = settings.integrations;
    var localIntegrationsConfig = options.integrations;
    // merged remote CDN settings with user provided options
    var integrationOptions = mergedOptions(settings, options !== null && options !== void 0 ? options : {});
    var adhocIntegrationSources = legacyIntegrationSources === null || legacyIntegrationSources === void 0 ? void 0 : legacyIntegrationSources.reduce(function (acc, integrationSource) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[resolveIntegrationNameFromSource(integrationSource)] = integrationSource, _a)));
    }, {});
    var installableIntegrations = new Set(__spreadArray(__spreadArray([], Object.keys(remoteIntegrationsConfig).filter(function (name) {
        return isInstallableIntegration(name, remoteIntegrationsConfig[name]);
    }), true), Object.keys(adhocIntegrationSources || {}).filter(function (name) {
        return isPlainObject(remoteIntegrationsConfig[name]) ||
            isPlainObject(localIntegrationsConfig === null || localIntegrationsConfig === void 0 ? void 0 : localIntegrationsConfig[name]);
    }), true));
    return Array.from(installableIntegrations)
        .filter(function (name) { return !isDisabledIntegration(name, globalIntegrations); })
        .map(function (name) {
        var integrationSettings = remoteIntegrationsConfig[name];
        var version = resolveVersion(integrationSettings);
        var destination = new LegacyDestination(name, version, writeKey, integrationOptions[name], options, adhocIntegrationSources === null || adhocIntegrationSources === void 0 ? void 0 : adhocIntegrationSources[name]);
        var routing = routingRules.filter(function (rule) { return rule.destinationName === name; });
        if (routing.length > 0 && routingMiddleware) {
            destination.addMiddleware(routingMiddleware);
        }
        return destination;
    });
}

export { LegacyDestination, ajsDestinations };
