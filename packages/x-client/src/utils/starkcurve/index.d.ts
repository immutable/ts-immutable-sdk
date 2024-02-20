/// <reference types="node" />
/* tslint:disable */
/* eslint-disable */
declare namespace BN {
    type Endianness = "le" | "be";
    type IPrimeName = "k256" | "p224" | "p192" | "p25519";

    interface MPrime {
        name: string;
        p: BN;
        n: number;
        k: BN;
    }

    interface ReductionContext {
        m: number;
        prime: MPrime;
        [key: string]: any;
    }
}

declare class BN {
    static BN: typeof BN;
    static wordSize: 26;

    constructor(
        number: number | string | number[] | Uint8Array | Buffer | BN,
        base?: number | "hex",
        endian?: BN.Endianness,
    );
    constructor(
        number: number | string | number[] | Uint8Array | Buffer | BN,
        endian?: BN.Endianness,
    );

    /**
     * @description  create a reduction context
     */
    static red(reductionContext: BN | BN.IPrimeName): BN.ReductionContext;

    /**
     * @description  create a reduction context  with the Montgomery trick.
     */
    static mont(num: BN): BN.ReductionContext;

    /**
     * @description returns true if the supplied object is a BN.js instance
     */
    static isBN(b: any): b is BN;

    /**
     * @description returns the maximum of 2 BN instances.
     */
    static max(left: BN, right: BN): BN;

    /**
     * @description returns the minimum of 2 BN instances.
     */
    static min(left: BN, right: BN): BN;

    /**
     * @description  clone number
     */
    clone(): BN;

    /**
     * @description  convert to base-string and pad with zeroes
     */
    toString(base?: number | "hex", length?: number): string;

    /**
     * @description convert to Javascript Number (limited to 53 bits)
     */
    toNumber(): number;

    /**
     * @description convert to JSON compatible hex string (alias of toString(16))
     */
    toJSON(): string;

    /**
     * @description  convert to byte Array, and optionally zero pad to length, throwing if already exceeding
     */
    toArray(endian?: BN.Endianness, length?: number): number[];

    /**
     * @description convert to an instance of `type`, which must behave like an Array
     */
    toArrayLike(
        ArrayType: typeof Buffer,
        endian?: BN.Endianness,
        length?: number,
    ): Buffer;

    toArrayLike(
        ArrayType: any[],
        endian?: BN.Endianness,
        length?: number,
    ): any[];

    /**
     * @description  convert to Node.js Buffer (if available). For compatibility with browserify and similar tools, use this instead: a.toArrayLike(Buffer, endian, length)
     */
    toBuffer(endian?: BN.Endianness, length?: number): Buffer;

    /**
     * @description get number of bits occupied
     */
    bitLength(): number;

    /**
     * @description return number of less-significant consequent zero bits (example: 1010000 has 4 zero bits)
     */
    zeroBits(): number;

    /**
     * @description return number of bytes occupied
     */
    byteLength(): number;

    /**
     * @description  true if the number is negative
     */
    isNeg(): boolean;

    /**
     * @description  check if value is even
     */
    isEven(): boolean;

    /**
     * @description   check if value is odd
     */
    isOdd(): boolean;

    /**
     * @description  check if value is zero
     */
    isZero(): boolean;

    /**
     * @description compare numbers and return `-1 (a < b)`, `0 (a == b)`, or `1 (a > b)` depending on the comparison result
     */
    cmp(b: BN): -1 | 0 | 1;

    /**
     * @description compare numbers and return `-1 (a < b)`, `0 (a == b)`, or `1 (a > b)` depending on the comparison result
     */
    ucmp(b: BN): -1 | 0 | 1;

    /**
     * @description compare numbers and return `-1 (a < b)`, `0 (a == b)`, or `1 (a > b)` depending on the comparison result
     */
    cmpn(b: number): -1 | 0 | 1;

    /**
     * @description a less than b
     */
    lt(b: BN): boolean;

    /**
     * @description a less than b
     */
    ltn(b: number): boolean;

    /**
     * @description a less than or equals b
     */
    lte(b: BN): boolean;

    /**
     * @description a less than or equals b
     */
    lten(b: number): boolean;

    /**
     * @description a greater than b
     */
    gt(b: BN): boolean;

    /**
     * @description a greater than b
     */
    gtn(b: number): boolean;

    /**
     * @description a greater than or equals b
     */
    gte(b: BN): boolean;

    /**
     * @description a greater than or equals b
     */
    gten(b: number): boolean;

    /**
     * @description a equals b
     */
    eq(b: BN): boolean;

    /**
     * @description a equals b
     */
    eqn(b: number): boolean;

    /**
     * @description convert to two's complement representation, where width is bit width
     */
    toTwos(width: number): BN;

    /**
     * @description  convert from two's complement representation, where width is the bit width
     */
    fromTwos(width: number): BN;

    /**
     * @description negate sign
     */
    neg(): BN;

    /**
     * @description negate sign
     */
    ineg(): BN;

    /**
     * @description absolute value
     */
    abs(): BN;

    /**
     * @description absolute value
     */
    iabs(): BN;

    /**
     * @description addition
     */
    add(b: BN): BN;

    /**
     * @description  addition
     */
    iadd(b: BN): BN;

    /**
     * @description addition
     */
    addn(b: number): BN;

    /**
     * @description addition
     */
    iaddn(b: number): BN;

    /**
     * @description subtraction
     */
    sub(b: BN): BN;

    /**
     * @description subtraction
     */
    isub(b: BN): BN;

    /**
     * @description subtraction
     */
    subn(b: number): BN;

    /**
     * @description subtraction
     */
    isubn(b: number): BN;

    /**
     * @description multiply
     */
    mul(b: BN): BN;

    /**
     * @description multiply
     */
    imul(b: BN): BN;

    /**
     * @description multiply
     */
    muln(b: number): BN;

    /**
     * @description multiply
     */
    imuln(b: number): BN;

    /**
     * @description square
     */
    sqr(): BN;

    /**
     * @description square
     */
    isqr(): BN;

    /**
     * @description raise `a` to the power of `b`
     */
    pow(b: BN): BN;

    /**
     * @description divide
     */
    div(b: BN): BN;

    /**
     * @description divide
     */
    divn(b: number): BN;

    /**
     * @description divide
     */
    idivn(b: number): BN;

    /**
     * @description division with remainder
     */
    divmod(b: BN, mode?: "div" | "mod", positive?: boolean): { div: BN; mod: BN };

    /**
     * @description reduct
     */
    mod(b: BN): BN;

    /**
     * @description reduct
     */
    umod(b: BN): BN;

    /**
     * @deprecated
     * @description reduct
     */
    modn(b: number): number;

    /**
     * @description reduct
     */
    modrn(b: number): number;

    /**
     * @description  rounded division
     */
    divRound(b: BN): BN;

    /**
     * @description or
     */
    or(b: BN): BN;

    /**
     * @description or
     */
    ior(b: BN): BN;

    /**
     * @description or
     */
    uor(b: BN): BN;

    /**
     * @description or
     */
    iuor(b: BN): BN;

    /**
     * @description and
     */
    and(b: BN): BN;

    /**
     * @description and
     */
    iand(b: BN): BN;

    /**
     * @description and
     */
    uand(b: BN): BN;

    /**
     * @description and
     */
    iuand(b: BN): BN;

    /**
     * @description and (NOTE: `andln` is going to be replaced with `andn` in future)
     */
    andln(b: number): BN;

    /**
     * @description xor
     */
    xor(b: BN): BN;

    /**
     * @description xor
     */
    ixor(b: BN): BN;

    /**
     * @description xor
     */
    uxor(b: BN): BN;

    /**
     * @description xor
     */
    iuxor(b: BN): BN;

    /**
     * @description set specified bit to value
     */
    setn(b: number, value: boolean | 0 | 1): BN;

    /**
     * @description shift left
     */
    shln(b: number): BN;

    /**
     * @description shift left
     */
    ishln(b: number): BN;

    /**
     * @description shift left
     */
    ushln(b: number): BN;

    /**
     * @description shift left
     */
    iushln(b: number): BN;

    /**
     * @description shift right
     */
    shrn(b: number): BN;

    /**
     * @description shift right (unimplemented https://github.com/indutny/bn.js/blob/master/lib/bn.js#L2086)
     */
    ishrn(b: number): BN;

    /**
     * @description shift right
     */
    ushrn(b: number): BN;
    /**
     * @description shift right
     */

    iushrn(b: number): BN;
    /**
     * @description  test if specified bit is set
     */

    testn(b: number): boolean;
    /**
     * @description clear bits with indexes higher or equal to `b`
     */

    maskn(b: number): BN;
    /**
     * @description clear bits with indexes higher or equal to `b`
     */

    imaskn(b: number): BN;
    /**
     * @description add `1 << b` to the number
     */
    bincn(b: number): BN;

    /**
     * @description not (for the width specified by `w`)
     */
    notn(w: number): BN;

    /**
     * @description not (for the width specified by `w`)
     */
    inotn(w: number): BN;

    /**
     * @description GCD
     */
    gcd(b: BN): BN;

    /**
     * @description Extended GCD results `({ a: ..., b: ..., gcd: ... })`
     */
    egcd(b: BN): { a: BN; b: BN; gcd: BN };

    /**
     * @description inverse `a` modulo `b`
     */
    invm(b: BN): BN;

    /**
     * @description Convert number to red
     */
    toRed(reductionContext: BN.ReductionContext): RedBN;
}

/**
 * BN operations in a reduction context.
 */
declare class RedBN extends BN {
    /**
     * @description Convert back a number using a reduction context
     */
    fromRed(): BN;

    /**
     * @description modular addition
     */
    redAdd(b: RedBN): RedBN;

    /**
     * @description in-place modular addition
     */
    redIAdd(b: RedBN): RedBN;

    /**
     * @description modular subtraction
     */
    redSub(b: RedBN): RedBN;

    /**
     * @description in-place modular subtraction
     */
    redISub(b: RedBN): RedBN;

    /**
     * @description modular shift left
     */
    redShl(num: number): RedBN;

    /**
     * @description modular multiplication
     */
    redMul(b: RedBN): RedBN;

    /**
     * @description in-place modular multiplication
     */
    redIMul(b: RedBN): RedBN;

    /**
     * @description modular square
     */
    redSqr(): RedBN;

    /**
     * @description in-place modular square
     */
    redISqr(): RedBN;

    /**
     * @description modular square root
     */
    redSqrt(): RedBN;

    /**
     * @description modular inverse of the number
     */
    redInvm(): RedBN;

    /**
     * @description modular negation
     */
    redNeg(): RedBN;

    /**
     * @description modular exponentiation
     */
    redPow(b: BN): RedBN;
}

type BNInput = string | BN | number | Buffer | Uint8Array | readonly number[];
type SignatureInput = ec.Signature | ec.SignatureOptions | Uint8Array | readonly number[] | string;

declare namespace curve {
    /**
     * @description Base class for the curves
     */
    class base {
        p: BN;
        type: string;
        red: any; // ?
        zero: BN;
        one: BN;
        two: BN;
        n: BN;
        g: base.BasePoint;
        redN: BN;

        constructor(type: string, conf: base.BaseCurveOptions);

        validate(point: base.BasePoint): boolean;
        decodePoint(bytes: Buffer | string, enc?: "hex"): base.BasePoint;
    }

    namespace base {
        class BasePoint {
            curve: base;
            type: string;
            precomputed: PrecomputedValues | null;

            constructor(curve: base, type: string);

            encode(enc: "hex", compact: boolean): string;
            encode(enc: "array" | undefined, compact: boolean): number[];
            encodeCompressed(enc: "hex"): string;
            encodeCompressed(enc?: "array"): number[];
            validate(): boolean;
            precompute(power: number): BasePoint;
            dblp(k: number): BasePoint;
            inspect(): string;
            isInfinity(): boolean;
            add(p: BasePoint): BasePoint;
            mul(k: BN): BasePoint;
            dbl(): BasePoint;
            getX(): BN;
            getY(): BN;
            eq(p: BasePoint): boolean;
            neg(): BasePoint;
        }

        interface BaseCurveOptions {
            p: number | string | number[] | Buffer | BN;
            prime?: BN | string | undefined;
            n?: number | BN | Buffer | undefined;
            g?: BasePoint | undefined;
            gRed?: any; // ?
        }

        interface PrecomputedValues {
            doubles: any; // ?
            naf: any; // ?
            beta: any; // ?
        }
    }

    class edwards extends base {
        a: BN;
        c: BN;
        c2: BN;
        d: BN;
        dd: BN;

        constructor(conf: edwards.EdwardsConf);

        point(
            x: BNInput,
            y: BNInput,
            z?: BNInput,
            t?: BNInput,
        ): edwards.EdwardsPoint;
        pointFromX(x: BNInput, odd?: boolean): edwards.EdwardsPoint;
        pointFromY(y: BNInput, odd?: boolean): edwards.EdwardsPoint;
        pointFromJSON(obj: BNInput[]): edwards.EdwardsPoint;
    }

    namespace edwards {
        interface EdwardsConf extends base.BaseCurveOptions {
            a: BNInput;
            c: BNInput;
            d: BNInput;
        }

        class EdwardsPoint extends base.BasePoint {
            x: BN;
            y: BN;
            z: BN;
            t: BN;

            normalize(): EdwardsPoint;
            eqXToP(x: BN): boolean;
        }
    }

    class short extends base {
        a: BNInput;
        b: BNInput;
        g: short.ShortPoint;

        constructor(conf: short.ShortConf);

        point(x: BNInput, y: BNInput, isRed?: boolean): short.ShortPoint;
        pointFromX(x: BNInput, odd?: boolean): short.ShortPoint;
        pointFromJSON(obj: BNInput[], red: boolean): short.ShortPoint;
    }

    namespace short {
        interface ShortConf extends base.BaseCurveOptions {
            a: BNInput;
            b: BNInput;
            beta?: BNInput | undefined;
            lambda?: BNInput | undefined;
        }

        class ShortPoint extends base.BasePoint {
            x: BN | null;
            y: BN | null;
            inf: boolean;

            toJSON(): BNInput[];
        }
    }
}

declare namespace curves {
    class PresetCurve {
        type: string;
        g: any; // ?
        n: BN | undefined | null;
        hash: any; // ?

        constructor(options: PresetCurve.Options);
    }

    namespace PresetCurve {
        interface Options {
            type: string;
            prime: string | null;
            p: string;
            a: string;
            b: string;
            n: string;
            hash: any;
            gRed: boolean;
            g: any; // ?
            beta?: string | undefined;
            lambda?: string | undefined;
            basis?: any; // ?
        }
    }
}

declare class ec {
    curve: any;
    n: BN | undefined | null;
    nh: any;
    g: any;
    hash: any;

    constructor(options: string | curves.PresetCurve);

    keyPair(options: ec.KeyPairOptions): ec.KeyPair;
    keyFromPrivate(
        priv: Uint8Array | Buffer | string | number[] | ec.KeyPair,
        enc?: string,
    ): ec.KeyPair;
    keyFromPublic(
        pub: Uint8Array | Buffer | string | number[] | { x: string; y: string } | ec.KeyPair,
        enc?: string,
    ): ec.KeyPair;
    genKeyPair(options?: ec.GenKeyPairOptions): ec.KeyPair;
    sign(
        msg: BNInput,
        key: Buffer | ec.KeyPair,
        enc: string,
        options?: ec.SignOptions,
    ): ec.Signature;
    sign(
        msg: BNInput,
        key: Buffer | ec.KeyPair,
        options?: ec.SignOptions,
    ): ec.Signature;
    verify(
        msg: BNInput,
        signature: SignatureInput,
        key: Buffer | ec.KeyPair,
        enc?: string,
    ): boolean;
    recoverPubKey(
        msg: BNInput,
        signature: SignatureInput,
        j: number,
        enc?: string,
    ): any;
    getKeyRecoveryParam(
        e: Error | undefined,
        signature: SignatureInput,
        Q: BN,
        enc?: string,
    ): number;
}

declare namespace ec {
    interface GenKeyPairOptions {
        pers?: any;
        entropy: any;
        persEnc?: string | undefined;
        entropyEnc?: string | undefined;
    }

    interface SignOptions {
        pers?: any;
        persEnc?: string | undefined;
        canonical?: boolean | undefined;
        k?: BN | undefined;
    }

    class KeyPair {
        static fromPublic(
            ec: ec,
            pub: Buffer | string | { x: string; y: string } | KeyPair,
            enc?: string,
        ): KeyPair;
        static fromPrivate(
            ec: ec,
            priv: Buffer | string | KeyPair,
            enc?: string,
        ): KeyPair;

        ec: ec;

        constructor(ec: ec, options: KeyPairOptions);

        validate(): { readonly result: boolean; readonly reason: string };
        getPublic(compact: boolean, enc: "hex"): string;
        getPublic(compact: boolean, enc: "array"): number[];
        getPublic(enc: "hex"): string;
        getPublic(enc: "array"): number[];
        getPublic(): curve.base.BasePoint;
        getPrivate(enc: "hex"): string;
        getPrivate(): BN;
        derive(pub: curve.base.BasePoint): BN;
        sign(msg: BNInput, enc: string, options?: SignOptions): Signature;
        sign(msg: BNInput, options?: SignOptions): Signature;
        verify(
            msg: BNInput,
            signature: SignatureInput,
        ): boolean;
        inspect(): string;
    }

    interface Signature {
        r: BN;
        s: BN;
        recoveryParam: number | null;

        toDER(): number[];
        toDER(enc: "hex"): string;
    }

    interface SignatureOptions {
        r: BNInput;
        s: BNInput;
        recoveryParam?: number | undefined;
    }

    interface KeyPairOptions {
        priv?: Buffer | undefined;
        privEnc?: string | undefined;
        pub?: Buffer | undefined;
        pubEnc?: string | undefined;
    }
}

type Instruction = 'order' | 'transfer' | 'registerUser' | 'deposit' | 'withdraw' | 'cancelOrder';
type InstructionWithFee = 'orderWithFee' | 'transferWithFee';

declare const DEFAULT_ACCOUNT_MAPPING_KEY = "STARKWARE_ACCOUNT_MAPPING";
declare const DEFAULT_SIGNATURE_MESSAGE = "Only sign this request if you\u2019ve initiated an action with Immutable X.";
declare const DEFAULT_ACCOUNT_LAYER = "starkex";
declare const DEFAULT_ACCOUNT_APPLICATION = "immutablex";
declare const DEFAULT_ACCOUNT_INDEX = "1";
declare const NFT_ASSET_ID_PREFIX = "NFT:";
declare const MINTABLE_ASSET_ID_PREFIX = "MINTABLE:";
declare const prime: BN;
declare const starkEc: ec;
declare const constantPoints: any[];
declare const shiftPoint: any;
declare const instructionEncodingMap: {
    [instruction in Instruction | InstructionWithFee]: BN;
};
declare const ZERO_BN: BN;
declare const ONE_BN: BN;
declare const TWO_POW_22_BN: BN;
declare const TWO_POW_31_BN: BN;
declare const TWO_POW_63_BN: BN;
declare const PRIME_BN: BN;
declare const MAX_ECDSA_BN: BN;
declare const MISSING_HEX_PREFIX = "Hex strings expected to be prefixed with 0x.";
declare const ORDER: BN;
declare const SECP_ORDER: BN;

declare function isHexPrefixed(str: string): boolean;
declare function checkHexValue(hex: string): void;
declare function getIntFromBits(hex: string, start: number, end?: number | undefined): number;
declare function getAccountPath(layer: string, application: string, ethereumAddress: string, index: string): string;
declare function hashKeyWithIndex(key: string, index: number): BN;
declare function grindKey(privateKey: string): string;
declare function getKeyPair(privateKey: string): ec.KeyPair;
declare function getPrivateKeyFromPath(seed: string, path: string): string;
declare function getKeyPairFromPath(seed: string, path: string): ec.KeyPair;
declare function getPublic(keyPair: ec.KeyPair, compressed?: boolean): string;
declare function getStarkPublicKey(keyPair: ec.KeyPair): string;
declare function getKeyPairFromPublicKey(publicKey: string): ec.KeyPair;
declare function getKeyPairFromPrivateKey(privateKey: string): ec.KeyPair;
declare function getXCoordinate(publicKey: string): string;

declare const index_d$1_DEFAULT_ACCOUNT_APPLICATION: typeof DEFAULT_ACCOUNT_APPLICATION;
declare const index_d$1_DEFAULT_ACCOUNT_INDEX: typeof DEFAULT_ACCOUNT_INDEX;
declare const index_d$1_DEFAULT_ACCOUNT_LAYER: typeof DEFAULT_ACCOUNT_LAYER;
declare const index_d$1_DEFAULT_ACCOUNT_MAPPING_KEY: typeof DEFAULT_ACCOUNT_MAPPING_KEY;
declare const index_d$1_DEFAULT_SIGNATURE_MESSAGE: typeof DEFAULT_SIGNATURE_MESSAGE;
declare const index_d$1_MAX_ECDSA_BN: typeof MAX_ECDSA_BN;
declare const index_d$1_MINTABLE_ASSET_ID_PREFIX: typeof MINTABLE_ASSET_ID_PREFIX;
declare const index_d$1_MISSING_HEX_PREFIX: typeof MISSING_HEX_PREFIX;
declare const index_d$1_NFT_ASSET_ID_PREFIX: typeof NFT_ASSET_ID_PREFIX;
declare const index_d$1_ONE_BN: typeof ONE_BN;
declare const index_d$1_ORDER: typeof ORDER;
declare const index_d$1_PRIME_BN: typeof PRIME_BN;
declare const index_d$1_SECP_ORDER: typeof SECP_ORDER;
declare const index_d$1_TWO_POW_22_BN: typeof TWO_POW_22_BN;
declare const index_d$1_TWO_POW_31_BN: typeof TWO_POW_31_BN;
declare const index_d$1_TWO_POW_63_BN: typeof TWO_POW_63_BN;
declare const index_d$1_ZERO_BN: typeof ZERO_BN;
declare const index_d$1_checkHexValue: typeof checkHexValue;
declare const index_d$1_constantPoints: typeof constantPoints;
declare const index_d$1_getAccountPath: typeof getAccountPath;
declare const index_d$1_getIntFromBits: typeof getIntFromBits;
declare const index_d$1_getKeyPair: typeof getKeyPair;
declare const index_d$1_getKeyPairFromPath: typeof getKeyPairFromPath;
declare const index_d$1_getKeyPairFromPrivateKey: typeof getKeyPairFromPrivateKey;
declare const index_d$1_getKeyPairFromPublicKey: typeof getKeyPairFromPublicKey;
declare const index_d$1_getPrivateKeyFromPath: typeof getPrivateKeyFromPath;
declare const index_d$1_getPublic: typeof getPublic;
declare const index_d$1_getStarkPublicKey: typeof getStarkPublicKey;
declare const index_d$1_getXCoordinate: typeof getXCoordinate;
declare const index_d$1_grindKey: typeof grindKey;
declare const index_d$1_hashKeyWithIndex: typeof hashKeyWithIndex;
declare const index_d$1_instructionEncodingMap: typeof instructionEncodingMap;
declare const index_d$1_isHexPrefixed: typeof isHexPrefixed;
declare const index_d$1_prime: typeof prime;
declare const index_d$1_shiftPoint: typeof shiftPoint;
declare const index_d$1_starkEc: typeof starkEc;
declare namespace index_d$1 {
  export { index_d$1_DEFAULT_ACCOUNT_APPLICATION as DEFAULT_ACCOUNT_APPLICATION, index_d$1_DEFAULT_ACCOUNT_INDEX as DEFAULT_ACCOUNT_INDEX, index_d$1_DEFAULT_ACCOUNT_LAYER as DEFAULT_ACCOUNT_LAYER, index_d$1_DEFAULT_ACCOUNT_MAPPING_KEY as DEFAULT_ACCOUNT_MAPPING_KEY, index_d$1_DEFAULT_SIGNATURE_MESSAGE as DEFAULT_SIGNATURE_MESSAGE, index_d$1_MAX_ECDSA_BN as MAX_ECDSA_BN, index_d$1_MINTABLE_ASSET_ID_PREFIX as MINTABLE_ASSET_ID_PREFIX, index_d$1_MISSING_HEX_PREFIX as MISSING_HEX_PREFIX, index_d$1_NFT_ASSET_ID_PREFIX as NFT_ASSET_ID_PREFIX, index_d$1_ONE_BN as ONE_BN, index_d$1_ORDER as ORDER, index_d$1_PRIME_BN as PRIME_BN, index_d$1_SECP_ORDER as SECP_ORDER, index_d$1_TWO_POW_22_BN as TWO_POW_22_BN, index_d$1_TWO_POW_31_BN as TWO_POW_31_BN, index_d$1_TWO_POW_63_BN as TWO_POW_63_BN, index_d$1_ZERO_BN as ZERO_BN, index_d$1_checkHexValue as checkHexValue, index_d$1_constantPoints as constantPoints, index_d$1_getAccountPath as getAccountPath, index_d$1_getIntFromBits as getIntFromBits, index_d$1_getKeyPair as getKeyPair, index_d$1_getKeyPairFromPath as getKeyPairFromPath, index_d$1_getKeyPairFromPrivateKey as getKeyPairFromPrivateKey, index_d$1_getKeyPairFromPublicKey as getKeyPairFromPublicKey, index_d$1_getPrivateKeyFromPath as getPrivateKeyFromPath, index_d$1_getPublic as getPublic, index_d$1_getStarkPublicKey as getStarkPublicKey, index_d$1_getXCoordinate as getXCoordinate, index_d$1_grindKey as grindKey, index_d$1_hashKeyWithIndex as hashKeyWithIndex, index_d$1_instructionEncodingMap as instructionEncodingMap, index_d$1_isHexPrefixed as isHexPrefixed, index_d$1_prime as prime, index_d$1_shiftPoint as shiftPoint, index_d$1_starkEc as starkEc };
}

declare type Bytes = ArrayLike<number>;
declare type BytesLike = Bytes | string;
interface Hexable {
    toHexString(): string;
}

declare type BigNumberish = BigNumber | Bytes | bigint | string | number;
declare class BigNumber implements Hexable {
    readonly _hex: string;
    readonly _isBigNumber: boolean;
    constructor(constructorGuard: any, hex: string);
    fromTwos(value: number): BigNumber;
    toTwos(value: number): BigNumber;
    abs(): BigNumber;
    add(other: BigNumberish): BigNumber;
    sub(other: BigNumberish): BigNumber;
    div(other: BigNumberish): BigNumber;
    mul(other: BigNumberish): BigNumber;
    mod(other: BigNumberish): BigNumber;
    pow(other: BigNumberish): BigNumber;
    and(other: BigNumberish): BigNumber;
    or(other: BigNumberish): BigNumber;
    xor(other: BigNumberish): BigNumber;
    mask(value: number): BigNumber;
    shl(value: number): BigNumber;
    shr(value: number): BigNumber;
    eq(other: BigNumberish): boolean;
    lt(other: BigNumberish): boolean;
    lte(other: BigNumberish): boolean;
    gt(other: BigNumberish): boolean;
    gte(other: BigNumberish): boolean;
    isNegative(): boolean;
    isZero(): boolean;
    toNumber(): number;
    toBigInt(): bigint;
    toString(): string;
    toHexString(): string;
    toJSON(key?: string): any;
    static from(value: any): BigNumber;
    static isBigNumber(value: any): value is BigNumber;
}

declare type Network = {
    name: string;
    chainId: number;
    ensAddress?: string;
    _defaultProvider?: (providers: any, options?: any) => any;
};

declare type Deferrable<T> = {
    [K in keyof T]: T[K] | Promise<T[K]>;
};
declare class Description<T = any> {
    constructor(info: {
        [K in keyof T]: T[K];
    });
}

declare type AccessList = Array<{
    address: string;
    storageKeys: Array<string>;
}>;
declare type AccessListish = AccessList | Array<[string, Array<string>]> | Record<string, Array<string>>;
interface Transaction {
    hash?: string;
    to?: string;
    from?: string;
    nonce: number;
    gasLimit: BigNumber;
    gasPrice?: BigNumber;
    data: string;
    value: BigNumber;
    chainId: number;
    r?: string;
    s?: string;
    v?: number;
    type?: number | null;
    accessList?: AccessList;
    maxPriorityFeePerGas?: BigNumber;
    maxFeePerGas?: BigNumber;
}

interface OnceBlockable {
    once(eventName: "block", handler: () => void): void;
}

declare type TransactionRequest = {
    to?: string;
    from?: string;
    nonce?: BigNumberish;
    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;
    data?: BytesLike;
    value?: BigNumberish;
    chainId?: number;
    type?: number;
    accessList?: AccessListish;
    maxPriorityFeePerGas?: BigNumberish;
    maxFeePerGas?: BigNumberish;
    customData?: Record<string, any>;
    ccipReadEnabled?: boolean;
};
interface TransactionResponse extends Transaction {
    hash: string;
    blockNumber?: number;
    blockHash?: string;
    timestamp?: number;
    confirmations: number;
    from: string;
    raw?: string;
    wait: (confirmations?: number) => Promise<TransactionReceipt>;
}
declare type BlockTag = string | number;
interface _Block {
    hash: string;
    parentHash: string;
    number: number;
    timestamp: number;
    nonce: string;
    difficulty: number;
    _difficulty: BigNumber;
    gasLimit: BigNumber;
    gasUsed: BigNumber;
    miner: string;
    extraData: string;
    baseFeePerGas?: null | BigNumber;
}
interface Block extends _Block {
    transactions: Array<string>;
}
interface BlockWithTransactions extends _Block {
    transactions: Array<TransactionResponse>;
}
interface Log {
    blockNumber: number;
    blockHash: string;
    transactionIndex: number;
    removed: boolean;
    address: string;
    data: string;
    topics: Array<string>;
    transactionHash: string;
    logIndex: number;
}
interface TransactionReceipt {
    to: string;
    from: string;
    contractAddress: string;
    transactionIndex: number;
    root?: string;
    gasUsed: BigNumber;
    logsBloom: string;
    blockHash: string;
    transactionHash: string;
    logs: Array<Log>;
    blockNumber: number;
    confirmations: number;
    cumulativeGasUsed: BigNumber;
    effectiveGasPrice: BigNumber;
    byzantium: boolean;
    type: number;
    status?: number;
}
interface FeeData {
    lastBaseFeePerGas: null | BigNumber;
    maxFeePerGas: null | BigNumber;
    maxPriorityFeePerGas: null | BigNumber;
    gasPrice: null | BigNumber;
}
interface EventFilter {
    address?: string;
    topics?: Array<string | Array<string> | null>;
}
interface Filter extends EventFilter {
    fromBlock?: BlockTag;
    toBlock?: BlockTag;
}
declare abstract class ForkEvent extends Description {
    readonly expiry: number;
    readonly _isForkEvent?: boolean;
    static isForkEvent(value: any): value is ForkEvent;
}
declare type EventType = string | Array<string | Array<string>> | EventFilter | ForkEvent;
declare type Listener = (...args: Array<any>) => void;
declare abstract class Provider implements OnceBlockable {
    abstract getNetwork(): Promise<Network>;
    abstract getBlockNumber(): Promise<number>;
    abstract getGasPrice(): Promise<BigNumber>;
    getFeeData(): Promise<FeeData>;
    abstract getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    abstract getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
    abstract getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    abstract getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    abstract sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    abstract call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
    abstract estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber>;
    abstract getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
    abstract getBlockWithTransactions(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<BlockWithTransactions>;
    abstract getTransaction(transactionHash: string): Promise<TransactionResponse>;
    abstract getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt>;
    abstract getLogs(filter: Filter): Promise<Array<Log>>;
    abstract resolveName(name: string | Promise<string>): Promise<null | string>;
    abstract lookupAddress(address: string | Promise<string>): Promise<null | string>;
    abstract on(eventName: EventType, listener: Listener): Provider;
    abstract once(eventName: EventType, listener: Listener): Provider;
    abstract emit(eventName: EventType, ...args: Array<any>): boolean;
    abstract listenerCount(eventName?: EventType): number;
    abstract listeners(eventName?: EventType): Array<Listener>;
    abstract off(eventName: EventType, listener?: Listener): Provider;
    abstract removeAllListeners(eventName?: EventType): Provider;
    addListener(eventName: EventType, listener: Listener): Provider;
    removeListener(eventName: EventType, listener: Listener): Provider;
    abstract waitForTransaction(transactionHash: string, confirmations?: number, timeout?: number): Promise<TransactionReceipt>;
    readonly _isProvider: boolean;
    constructor();
    static isProvider(value: any): value is Provider;
}

declare abstract class Signer {
    readonly provider?: Provider;
    abstract getAddress(): Promise<string>;
    abstract signMessage(message: Bytes | string): Promise<string>;
    abstract signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;
    abstract connect(provider: Provider): Signer;
    readonly _isSigner: boolean;
    constructor();
    getBalance(blockTag?: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber>;
    call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag): Promise<string>;
    sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse>;
    getChainId(): Promise<number>;
    getGasPrice(): Promise<BigNumber>;
    getFeeData(): Promise<FeeData>;
    resolveName(name: string): Promise<string>;
    checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest>;
    populateTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest>;
    _checkProvider(operation?: string): void;
    static isSigner(value: any): value is Signer;
}

declare function signRaw(payload: string, signer: Signer): Promise<string>;
type IMXAuthorisationHeaders = {
    timestamp: string;
    signature: string;
};
declare function generateIMXAuthorisationHeaders(ethSigner: Signer): Promise<IMXAuthorisationHeaders>;
declare function signMessage(message: string, signer: Signer): Promise<{
    message: string;
    ethAddress: string;
    ethSignature: string;
}>;

declare const index_d_generateIMXAuthorisationHeaders: typeof generateIMXAuthorisationHeaders;
declare const index_d_signMessage: typeof signMessage;
declare const index_d_signRaw: typeof signRaw;
declare namespace index_d {
  export { index_d_generateIMXAuthorisationHeaders as generateIMXAuthorisationHeaders, index_d_signMessage as signMessage, index_d_signRaw as signRaw };
}

declare function generateStarkPrivateKey(): string;
declare function generateLegacyStarkPrivateKey(signer: Signer): Promise<string>;

interface StarkSigner {
    signMessage(message: string): Promise<string>;
    getAddress(): string | Promise<string>;
}

declare function createStarkSigner(starkPrivateKey: string): StarkSigner;

export { createStarkSigner, index_d as crypto, generateLegacyStarkPrivateKey, generateStarkPrivateKey, index_d$1 as legacy };
