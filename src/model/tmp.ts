





export const f = '';


const data = {
    foo1: 'barA',
    foo2: 'barB',
    foo3: 'barC',
    foo4: 'barD',
} as const;

type Data = typeof data;

type DataKey = keyof Data;

type AllowedValues<T extends DataKey> = Data[T];

type mapping = {
    keys: readonly DataKey[],
    value: AllowedValues<DataKey> // <- This Type should only alow values that are used in `keys`
}

const x = {
    keys: ['foo3', 'foo1'],
    value: 'barB' // <- Should be invalid
} as const satisfies mapping;



export type Union<T> =

    T extends readonly unknown[]
    ? T[number]
    : T extends Array<unknown>
    ? T[number]
    : T[keyof T];

type mapping2 = Union<{
    [k in DataKey]: {
        key: k,
        value: AllowedValues<k> // <- This Type should only alow values that are used in `keys`
    }
}>

const x2: mapping2 = {
    key: 'foo1',
    value: 'barB' // <- Is be invalid
} as const satisfies mapping2;


