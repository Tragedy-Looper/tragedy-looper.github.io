import { characters } from './model/characters';
import { incidents } from './model/incidents';
import { plots } from './model/plots';
import { roles } from './model/roles';
import { tragedySets } from './model/tragedySets';
import { translations as data } from './data-translations';
import { browser } from '$app/environment';
import { getLocalisatio } from './storage';
import { ui_strings } from './data-ui-strings';

const toCheck = [characters, incidents, plots, roles, tragedySets,
    ...ui_strings,
];

const missingInToCheck: Set<string> = new Set();

const translation: Record<string, Record<string, string>> = data;




export function getString(key: string | undefined, lang: string | undefined, ...params: { name: string, value: unknown }[]) {
    if (!key) {
        return "";
    }


    key = key.trim()
    const toTest = getAllStrings(toCheck);
    if (!toTest.includes(key)) {
        missingInToCheck.add(key);
        console.info('Missing Translations', [...missingInToCheck]);
    }

    if (!lang) {
        return key;
    }
    let translated = translation[lang]?.[key] ?? key;

    const localTranslation =
        (browser && getLocalisatio(lang) && getLocalisatio(lang)[key]) ? getLocalisatio(lang)[key] : undefined;

    if (localTranslation && localTranslation != translated)
        translated = '«' + localTranslation + '»';


    params?.forEach(e => {
        translated = translated.replaceAll(`{${e.name}}`, `${e.value}`);
    })

    return translated.length > 0 ? translated : key;


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
        return [obj.trim()];
    } else if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
            return obj.flatMap(getAllStrings);
        } else {
            return Object.values(obj).flatMap(getAllStrings);
        }
    }
    return [];
}
