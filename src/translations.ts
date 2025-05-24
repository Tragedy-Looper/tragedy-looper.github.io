import { characters } from './model/characters';
import { incidents } from './model/incidents';
import { plots } from './model/plots';
import { roles } from './model/roles';
import { tragedySets } from './model/tragedySets';
import { translations as data } from './data-translations';
import { browser } from '$app/environment';
import { getLocalisatio } from './storage';
import { ui_strings } from './data-ui-strings';
import { writable } from 'svelte/store';
import { scripts } from './data';

const toCheck = [characters, incidents, plots, roles, tragedySets, scripts.flatMap(x => [x.cast, x.title, x.specifics, x.story, x.mastermindHints]),
    ...ui_strings,
];

const missingInToCheck: Set<string> = new Set();

const translation: Record<string, Record<string, string>> = data;

// mapp {TAG} to object with key tag and value unknown
type ObjectFromTaged<T extends string | undefined> =
    T extends undefined
    ? {}
    : T extends `${string}{${string}}${string}`
    ? ObjectFromTagedGet<T>
    : T extends `${string}{${string}}`
    ? ObjectFromTagedGet<T>
    : {};
type ObjectFromTagedGet<T extends string> =
    T extends `${string}{${infer Tag}}${infer Rest}`
    ? { [K in Tag]: unknown } & ObjectFromTagedGet<Rest>
    : T extends `${string}{${infer Tag}}`
    ? { [K in Tag]: unknown }
    : {};

export type ObjectFromTagedArray<T extends string | undefined> = keyof ObjectFromTaged<T> extends never
    ? []
    : [ObjectFromTaged<T>];


export function getStringForLanguage<TKey extends string | undefined>(key: TKey, lang: string | undefined, ...params: ObjectFromTagedArray<TKey>): string {
    if (!key) {
        return "";
    }

    if (key.includes('|')) {
        return key.split('|').map(k => getStringForLanguage(k, lang)).join('|');
    }

    const keyTrimed = key.trim()
    const toTest = getAllStrings(toCheck);
    if (!toTest.includes(key)) {
        missingInToCheck.add(key);
        console.info('Missing Translations', [...missingInToCheck]);
    }

    if (!lang) {
        let translated = keyTrimed;
        Object.entries(params[0] ?? {}).forEach(([name, value]) => {
            translated = translated.replaceAll(`{${name.toString()}}`, `${value}`);
        })

        return keyTrimed;
    }
    let translated = translation[lang]?.[keyTrimed] ?? keyTrimed;

    const localTranslation =
        (browser && getLocalisatio(lang) && getLocalisatio(lang)[keyTrimed]) ? getLocalisatio(lang)[keyTrimed] : undefined;

    if (localTranslation && localTranslation != translated)
        translated = '«' + localTranslation + '»';


    Object.entries(params[0] ?? {}).forEach(([name, value]) => {
        translated = translated.replaceAll(`{${name.toString()}}`, `${value}`);
    })

    return translated.length > 0 ? translated : keyTrimed;


}

export function getAllTranslationsForLanguage(lang: string) {
    const currentTranslation = { ...translation[lang], ...((browser && getLocalisatio(lang)) ? getLocalisatio(lang) : undefined) };


    if (lang == 'en') {
        getAllStrings(toCheck).filter(x => x.length > 0).forEach(key => {
            if (currentTranslation[key] == undefined || currentTranslation[key].length == 0) {
                currentTranslation[key] = key;
            }
        });
    }
    return currentTranslation;
}
export function getMissingForLanguage(lang: string) {
    if (lang == 'en') {
        return [];
    }
    const currentTranslation = translation[lang] ?? {};

    const alreadyTranslated = Object.keys(currentTranslation ?? {}).filter(key => currentTranslation[key]?.length ?? 0 > 0);
    const neededKeys = getAllStrings(toCheck).filter(x => x.length > 0);

    return neededKeys.filter(x => !alreadyTranslated.includes(x));
}

export function getAllKeys(): string[] {
    return getAllStrings(toCheck).filter(x => x.length > 0);
}
function getAllStrings(obj: unknown): string[] {
    if (typeof obj === 'string') {
        return obj.split('|').map(s => s.trim()).filter(s => s.length > 0);
    } else if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
            return obj.flatMap(getAllStrings);
        } else {
            return [...Object.values(obj).flatMap(getAllStrings), ...Object.keys(obj).flatMap(getAllStrings)];
        }
    }
    return [];
}
