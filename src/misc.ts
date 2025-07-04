import type { DeepRequired, UnionToIntersection } from 'utility-types'



// export type Intersection<T> =
//     T extends readonly [infer a]
//     ? a
//     : T extends readonly [infer a, ...infer b]
//     ? a & Intersection<b>
//     : never;

export type Intersection<T> = UnionToIntersection<Union<T>>;




export type Union<T> =

    T extends readonly any[]
    ? T[never]
    : T extends Array<any>
    ? T[never]
    : T[keyof T];




type SRecord<ELEMENT extends readonly any[], Key extends keyof ELEMENT[never]> = {
    [i in keyof ELEMENT]: {
        [k in ELEMENT[i][Key]]: ELEMENT[i]
    }
};


export function includes<T>(a: readonly T[] | undefined, el: ArrayOfUnion<T>): Intersect<T, ArrayOfUnion<T>> {
    if (a == undefined) {
        return false;
    }
    return a.includes(el);
}




// export type ShowOptional<T> = T extends { [x in KeysOfUnion<T> ]: T[x] } ? { [x in KeysOfUnion<T> ]: T[x] } : { [x in KeysOfUnion<T> ]: undefined };
export type ShowOptional<T> = {
    [x in KeysOfUnion<T>]: T[x] extends string | object | number ? T[x] : OptionalProp<T, x> | undefined
};

export type RenderCharacterDeath<T extends string> = T extends `${infer pre}Character Death${infer post}` ? `${pre}Character Death${post}` : T;
export function renderCharacterDeath<T extends string>(t: T): RenderCharacterDeath<T> {
    return t.replaceAll('Character Death', 'Character Death') as any;

}

// export function showAll<T>(a: T): ShowOptional<T>;
export function require<T>(a: T): ShowOptional<T> {
    return a as any;
}

export function showAll<T>(a: readonly T[]): ShowOptional<T>[];
export function showAll<T>(a: readonly T[]): ShowOptional<T>[] {
    return a as any;
}


export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>>
    & {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys]



export function isArray(a: any): a is readonly any[] {
    return Array.isArray(a);
}

export function toRecord<ELEMENT extends readonly any[], Key extends keyof ELEMENT[number]>(entries: ELEMENT, key: Key): {
    [k in ELEMENT[number][Key]]: ELEMENT[number];
} {
    return Object.fromEntries((entries.map(x => [x[key], x]))) as any;
}

export function hasProp<T extends object>(
    obj: T, prop: PropertyKey
): prop is keyof T {
    return prop in obj;
}





export function clamp(value: number, min = 0, max = 100) {
    return Math.min(Math.max(value, min), max);
};

export function round(value: number, precision = 3) {
    return parseFloat(value.toFixed(precision));
}

export function adjust(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
    return round(toMin + (toMax - toMin) * (value - fromMin) / (fromMax - fromMin));
};

export function distinct<T>(t: readonly T[], keyFunction?: (a: T) => string) {
    if (keyFunction) {
        const result = [];
        const set = new Set();

        for (const element of t) {
            const key = keyFunction(element);
            if (!set.has(key)) {
                set.add(key);
                result.push(element);
            }
        }
        return result;
    } else {
        return t.filter((v, i, a) => a.indexOf(v) === i);
    }
}

export type KeysOfUnion<T> = T extends T ? keyof T : never;


export type OptionalProp<A, T extends PropertyKey> = A extends { [x in T]: any } ? A[T] : never;

export function keys<T>(o: T): (KeysOfUnion<T>)[] {
    if (typeof o !== 'object' || o == null) {
        return [];
    }
    return Object.keys(o) as any;
}

export function fromEntries<K extends PropertyKey, T>(...o: readonly (readonly [K, T])[]): Record<K, T> {
    return Object.fromEntries(o) as any;

}






































export function tail<T>(a: readonly T[]): T[] {
    const [, ...result] = a;
    return result;
}
export function head<T>(a: readonly T[]): T[] {
    return a.slice(0, -1);
}

export function getLast<T>(array?: readonly T[]) {
    if (array == undefined) return undefined;
    return array.length == 0 ? undefined : array[array.length - 1];
}

export function join(array: readonly string[], delimeter?: string, lastDelimeter?: string): string {
    if (!delimeter) {
        delimeter = ', '
    }
    if (lastDelimeter != undefined && array.length > 1) {
        return head(array).reduce((p, c) => p.length == 0 ? c : p + delimeter + c, "") + lastDelimeter + getLast(array);

    } else {
        return array.reduce((p, c) => p.length == 0 ? c : p + delimeter + c, "");

    }
}



export function toPascalCase(str: string): string {
    return str
        .replaceAll(/(?:^\w|[A-Z]|\b\w)/g, (match) => match.toUpperCase())
        .replaceAll(/\s+/g, '');
}





const object = {};
const hasOwnProperty = object.hasOwnProperty;
function merge<T>(options: T | undefined, defaults: T) {
    if (!options) {
        return defaults;
    }
    const result = {} as Partial<T>;
    for (const key in defaults) {
        // `if (defaults.hasOwnProperty(key) { … }` is not needed here, since
        // only recognized option names are used.
        result[key] = hasOwnProperty.call(options, key) ? options[key] : defaults[key];
    }
    return result as T;
};

const regexAnySingleEscape = /[ -,./:-@[-^`{-~]/;
const regexSingleEscape = /[ -,./:-@[\]^`{-~]/;
const regexAlwaysEscape = /['"\\]/;
const regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;

// Expose default options (so they can be overridden globally).
const defaultOptions: Options = {
    'escapeEverything': false,
    'isIdentifier': false,
    'quotes': 'single',
    'wrap': false
};
type Options = {
    'escapeEverything': boolean,
    'isIdentifier': boolean,
    'quotes': 'single' | 'double',
    'wrap': boolean
};






// https://mathiasbynens.be/notes/css-escapes#css
export function cssesc(string: string, options?: Partial<Options>) {
    options = merge(options, defaultOptions);
    if (options.quotes != 'single' && options.quotes != 'double') {
        options.quotes = 'single';
    }








    const quote = options.quotes == 'double' ? '"' : '\'';
    const isIdentifier = options.isIdentifier;

    const firstChar = string.charAt(0);
    let output = '';
    let counter = 0;
    const length = string.length;
    while (counter < length) {
        const character = string.charAt(counter++);
        let codePoint = character.charCodeAt(0);
        let value = '';
        // If it’s not a printable ASCII character…
        if (codePoint < 0x20 || codePoint > 0x7E) {
            if (codePoint >= 0xD800 && codePoint <= 0xDBFF && counter < length) {
                // It’s a high surrogate, and there is a next character.
                const extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) {
                    // next character is low surrogate
                    codePoint = ((codePoint & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
                } else {
                    // It’s an unmatched surrogate; only append this code unit, in case
                    // the next code unit is the high surrogate of a surrogate pair.
                    counter--;
                }
            }
            value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
        } else {
            if (!/[a-zA-Z0-9]/.test(character)) {
                value = '_' + codePoint.toString(16).toUpperCase();
            } else {
                value = character;
            }
        }
        output += value;
    }

    if (isIdentifier) {
        if (/^-[-\d]/.test(output)) {
            output = '\\-' + output.slice(1);
        } else if (/\d/.test(firstChar)) {
            output = '\\3' + firstChar + ' ' + output.slice(1);
        }
    }

    // Remove spaces after `\HEX` escapes that are not followed by a hex digit,
    // since they’re redundant. Note that this is only possible if the escape
    // sequence isn’t preceded by an odd number of backslashes.
    output = output.replaceAll(regexExcessiveSpaces, function ($0, $1, $2) {
        if ($1 && $1.length % 2) {
            // It’s not safe to remove the space, so don’t.
            return $0;
        }
        // Strip the space.
        return ($1 || '') + $2;
    });

    if (!isIdentifier && options.wrap) {
        return quote + output + quote;
    }
    return output;
};


export function escapeRegExp(string: string): string {
    // In addition to the typical apostrophe (') and the typographic apostrophe (’),
    // the following characters could also be used as apostrophes:
    // ‘ (U+2018), ‛ (U+201B), ʻ (U+02BB), ʹ (U+02B9), ˈ (U+02C8), ´ (U+00B4), ` (U+0060)
    // Here, the most common variants are included:
    return string.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')// $& means the whole matched string
        .replaceAll(/['’‘‛ʻʹˈ´`]/g, '[\'’‘‛ʻʹˈ´`]'); 
}
