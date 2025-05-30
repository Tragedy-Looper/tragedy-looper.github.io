// import { characters } from './model/characters';
// import { incidents } from './model/incidents';
// import { plots } from './model/plots';
// import { roles } from './model/roles';
// import { tragedySets } from './model/tragedySets';
import { translations as data } from './data-translations';
import { browser } from '$app/environment';
import { getLocalisatio } from './storage';
import { ui_strings } from './data-ui-strings';
import { writable } from 'svelte/store';
import { characters, incidents, plots, roles, scripts, tragedys } from './data';
import MarkdownIt, { type Options } from 'markdown-it';
import type { Renderer, Token } from 'markdown-it/index.js';



function getLinksFromMarkdown(markdown: string): Set<string> {
    const links = new Set<string>();

    const md = MarkdownIt({
        html: false,
        linkify: false,
        typographer: true,
    });

    // add base to links
    const originalValidateLink = md.validateLink;
    md.validateLink = (link: string) => {
        // Allow all links, even if they are not valid URLs
        console.log('Validating link:', link);
        if (link) {
            links.add(link);
        }

        return originalValidateLink.call(md, link);
    }
    md.parseInline(markdown, {});
    return links;
}




const toCheck = [characters, incidents, plots, roles, tragedys, scripts.flatMap(x => [x.cast, x.title, x['victory-conditions'], x.story, x.mastermindHints]),
    ...ui_strings,
    'Location Icons',
    'Intrigue Places',
    'kind off',
    'Location background',
    'could be better',
    'Dispair place',
    'Day stages',
    'They are already prety clean, but images and not text.',
    'Day track',
    'Incident track',
    'Loop track',
    'Extra gauge',
    'Additional decorations',
];

const allStrings = getAllStrings(toCheck);

const missingInToCheck: Set<string> = new Set();

const translation: Record<string, Record<string, string>> = data;

// mapp {TAG} to object with key tag and value unknown
export type ObjectFromTagedVoid<T extends string | undefined> =
    T extends undefined
    ? void
    : T extends `${string}{${string}}${string}`
    ? ObjectFromTagedGet<T>
    : T extends `${string}{${string}}`
    ? ObjectFromTagedGet<T>
    : void;
export type ObjectFromTaged<T extends string | undefined> =
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


export function translationExists(lang: string, key: string): boolean {
    if (!lang || !key) {
        return false;
    }
    if (lang == 'en') {
        return true; // English is always available
    }
    const keyTrimed = key.trim();
    if (keyTrimed.includes('|')) {
        return keyTrimed.split('|').every(k => translationExists(lang, k));
    }
    if (translation[lang] && translation[lang][keyTrimed] && translation[lang][keyTrimed].length > 0) {
        return true;
    }

    const localTranslation =
        (browser && getLocalisatio(lang) && getLocalisatio(lang)[keyTrimed]) ? getLocalisatio(lang)[keyTrimed] : undefined;
    if (localTranslation && localTranslation.length > 0) {
        return true;
    }
    return false
}

export function hasLocalTranslation(lang: string, key: string): boolean {
    if (!lang) {
        return false;
    }
    if (browser) {
        const localTranslation = getLocalisatio(lang);
        if (localTranslation && localTranslation[key]) {
            return localTranslation[key].length > 0;
        }
    }
    return false;
}

export function getStringForLanguage<TKey extends string | undefined>(key: TKey, lang: string | undefined, ...params: ObjectFromTagedArray<TKey>): string {
    if (!key) {
        return "";
    }

    // return JSON.stringify(params);

    if (key.includes('|')) {
        return key.split('|').map(k => getStringForLanguage(k, lang)).join('|');
    }

    const keyTrimed = key.trim()
    const toTest = allStrings;
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
    if (translated == undefined || translated.length == 0) {
        translated = keyTrimed; // Fallback to key if no translation is found
    }

    const localTranslation =
        (browser && getLocalisatio(lang) && getLocalisatio(lang)[keyTrimed]) ? getLocalisatio(lang)[keyTrimed] : undefined;

    if (localTranslation && localTranslation != translated)
        translated = '«' + localTranslation + '»';


    Object.entries(params[0] ?? {}).forEach(([name, value]) => {
        console.log(`Replacing {${name.toString()}} with ${value} in "${translated}" (${key}) for language "${lang}"`);
        translated = translated.replaceAll(`{${name.toString()}}`, `${value}`);
    })

    const result = translated.length > 0 ? translated : keyTrimed;

    // Check that every link in the result was also in the key
    const linksInResult = getLinksFromMarkdown(result);
    const linksInKey = getLinksFromMarkdown(keyTrimed);
    const linksNotInKey = [...linksInResult].filter(link => !linksInKey.has(link));
    if (linksNotInKey.length > 0) {
        console.error(`Links in translation for "${keyTrimed}" in language "${lang}" not found in key:`, linksNotInKey);
        return `${keyTrimed} (**ERROR**: unknown links: ${linksNotInKey.join(', ')} falling back to key)`;
    }
    return result;
}

export function getDeployedLanguage(): string[] {
    return ['en', ...Object.keys(translation).filter(x => x != 'en')];
}
export function getAllTranslationsForLanguage(lang: string) {
    const currentTranslation = { ...translation[lang], ...((browser && getLocalisatio(lang)) ? getLocalisatio(lang) : undefined) };


    if (lang == 'en') {
        allStrings.filter(x => x.length > 0).forEach(key => {
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
    const neededKeys = allStrings.filter(x => x.length > 0);

    return neededKeys.filter(x => !alreadyTranslated.includes(x));
}

export function getAllKeys(): string[] {
    return allStrings.filter(x => x.length > 0);
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
