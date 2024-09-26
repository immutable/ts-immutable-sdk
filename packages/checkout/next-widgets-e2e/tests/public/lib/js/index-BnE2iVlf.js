import { de as __awaiter, df as __generator } from './index-Ae2juTF3.js';

function loadLegacyVideoPlugins(analytics) {
    return __awaiter(this, void 0, void 0, function () {
        var plugins;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, import(
                    // @ts-expect-error
                    './index.umd-D9CtO37o.js').then(function (n) { return n.i; })
                    // This is super gross, but we need to support the `window.analytics.plugins` namespace
                    // that is linked in the segment docs in order to be backwards compatible with ajs-classic
                    // @ts-expect-error
                ];
                case 1:
                    plugins = _a.sent();
                    // This is super gross, but we need to support the `window.analytics.plugins` namespace
                    // that is linked in the segment docs in order to be backwards compatible with ajs-classic
                    // @ts-expect-error
                    analytics._plugins = plugins;
                    return [2 /*return*/];
            }
        });
    });
}

export { loadLegacyVideoPlugins };
