import { characters } from './model/characters';
import { incidents } from './model/incidents';
import { plots } from './model/plots';
import { roles } from './model/roles';
import { tragedySets } from './model/tragedySets';
import { translations as data } from './data-translations';
import { browser } from '$app/environment';
import { getLocalisatio } from './storage';

const toCheck = [characters, incidents, plots, roles, tragedySets,
    ...[
        'Tragedy Looper Deduction overview',
        'If your are the Mastermind',
        'choose a script (SPOILER!!)',
        'Otherwise ask your Mastermind to choose a script and send you the link.',
        'Feedback (in english) is appriciated on',
        'or',
        "Missing Translations",
        "Key",
        "Translation",
        "Language",
        "Only show Missing",

        "For your Language there are missing translations, if you have time and fun you can help and add some localisations using the below. And post them on Github.",
        "Translation Overview",

        "Main Plot",
        "Characters",
        "Goodwill Refusel",
        "Once per {type}",
        "Immortal",
        "After Death",
        "Day {day}",
        "Goodwill refusal",
        "If you translated something, please open an issue on Github and post the exported text, or submit a pull request.",
        "This should list all texts and keywords used, but not yet translated into your language. However, it's not applied everywhere yet. The Player Aid should be completely set, but others are missing.",
        'After I include your text, everyone should be able to see the translations online  Currently, your translations are stored in your browser, so you can check if it works as intended. These are marked with «»',
    ],
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

    return translated.length>0 ? translated : key;


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
