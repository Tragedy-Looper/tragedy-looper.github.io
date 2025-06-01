import { toRecord } from "../misc";
import type { ScriptSpecified } from "./core";
import type { DoseNotTriggerIncident } from "./incidents";
import * as data from "../data";
import type { Character } from "../characters.g";



export const locations = ['Hospital', 'Shrine', 'City', 'School'] as const;
export type LocationName = typeof locations[number];
export type Tag = 'boy' | 'girl' | 'student' | "man" | "woman" | "adult" | 'construct' | 'animal' | 'tree' | 'little sister';


export type CharacterName = typeof data.characters[number]['id'];



type CharacterscomesInLaterHelper<T> = T extends { 'comesInLater': true } ? T : never;
export type CharacterscomesInLater = CharacterscomesInLaterHelper<typeof data.characters[number]>['id'];
type CharactersPlotlessRole<T> = T extends { 'plotLessRole': 'all' | 'not in plots' | 'plot duplicate' } ? T : never;
export type CharacterPlotless = CharactersPlotlessRole<typeof data.characters[number]>['id'];


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

export const characterscomesInLater = Object.values(data.charactersLookup).filter(x => (x.comesInLater)).map(x => x.id) as readonly CharacterscomesInLater[];



export function isCharacterLate(name: unknown): name is CharacterscomesInLater {
    return isCharacterName(name) && ((data.charactersLookup[name])?.comesInLater ?? false);
}
export function isCharacterPlotless<T>(name: T): name is T & { plotLessRole: 'all' | 'not in plots' | 'plot duplicate' };
export function isCharacterPlotless(name: CharacterName): name is CharacterPlotless;
export function isCharacterPlotless(name: unknown): name is CharacterPlotless {
    if (typeof name === 'object' && name !== null) {
        return 'plotLessRole' in name && ['all', 'not in plots', 'plot duplicate'].some(x => x == (name as { plotLessRole?: 'all' | 'not in plots' | 'plot duplicate' })?.plotLessRole);
    } else if (typeof name === 'string') {
        return ['all', 'not in plots', 'plot duplicate'].some(x => x == ((data.charactersLookup[name as CharacterName])?.plotLessRole));
    } else {
        return false;
    }
}
export function isCharacterName(name: unknown): name is CharacterName {
    return typeof name === 'string' && name in data.charactersLookup;
}
export function isLocationName(name: unknown): name is LocationName {
    return typeof name === 'string' && locations.some(x => x == name);
}

