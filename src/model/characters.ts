import { toRecord } from "../misc";
import type { ScriptSpecified } from "./core";
import type { DoseNotTriggerIncident } from "./incidents";
import * as data from "../data";
import type { Character } from "../characters.g";



export const locations = ['Hospital', 'Shrine', 'City', 'School'] as const;
export type LocationName = typeof locations[number];
export type Tag = 'boy' | 'girl' | 'student' | "man" | "woman" | "adult" | 'construct' | 'animal' | 'tree' | 'little sister';


export type Characters = (typeof characters);
export type CharacterName = typeof data.characters[number]['id'];



type CharacterscomesInLaterHelper<T> = T extends { 'comesInLater': true } ? T : never;
export type CharacterscomesInLater = CharacterscomesInLaterHelper<Character>['id'];
type CharactersPlotlessRole<T> = T extends { 'plotLessRole': 'all' | 'not in plots' | 'plot duplicate' } ? T : never;
export type CharacterPlotless = CharactersPlotlessRole<Character>['id'];



type CharacterIntern = {
    name: string,
    paranoiaLimit: number,
    tags: readonly Tag[],
    abilities: readonly Ability[],
    startLocation: readonly LocationName[];
    forbiddenLocation?: readonly LocationName[],
    comesInLater?: true,
    plotLessRole?: 'all' | 'not in plots' | 'plot duplicate',

} & ScriptSpecified & DoseNotTriggerIncident;

export type Ability = {
    type: 'active'
    goodwillRank: number,
    timesPerLoop?: number,
    immuneToGoodwillRefusel?: true,
    restrictedToLocation?: readonly LocationName[],
    description: string

} | {
    type: 'passive',
    description: string
}




export const characters = toRecord([...data.characters] as const satisfies readonly CharacterIntern[], 'id') as Record<CharacterName, Character>;

export const characterscomesInLater = Object.values(characters).filter(x => (x as { comesInLater?: true })['comesInLater']).map(x => x.id) as readonly CharacterscomesInLater[];



export function isCharacterLate(name: CharacterName): name is CharacterscomesInLater {
    return (characters[name] as { comesInLater?: true })?.comesInLater ?? false;
}
export function isCharacterPlotless<T>(name: T): name is T & { plotLessRole: 'all' | 'not in plots' | 'plot duplicate' };
export function isCharacterPlotless(name: CharacterName): name is CharacterPlotless;
export function isCharacterPlotless(name: unknown): name is CharacterPlotless {
    if (typeof name === 'object' && name !== null) {
        return 'plotLessRole' in name && ['all', 'not in plots', 'plot duplicate'].some(x => x == (name as { plotLessRole?: 'all' | 'not in plots' | 'plot duplicate' })?.plotLessRole);
    } else if (typeof name === 'string') {
        return ['all', 'not in plots', 'plot duplicate'].some(x => x == ((characters[name as CharacterName] as { plotLessRole?: 'all' | 'not in plots' | 'plot duplicate' })?.plotLessRole));
    } else {
        return false;
    }
}
export function isCharacterName(name: string): name is CharacterName {
    return name in characters;
}
export function isLocationName(name: string): name is LocationName {
    return locations.some(x => x == name);
}

