import { toRecord } from "../misc";
import type { ScriptSpecified } from "./core";
import type { DoseNotTriggerIncident } from "./incidents";
import * as data from "../data";



export type LocationName = 'Hospital' | 'Shrine' | 'City' | 'School';
export const locations = ['Hospital', 'Shrine', 'City', 'School'] as const;
export type Tag = 'boy' | 'girl' | 'student' | "man" | "woman" | "adult" | 'construct' | 'animal' | 'tree' | 'little sister';


export type Character = Characters[keyof Characters];
export type Characters = (typeof characters);
export type CharacterName = Character['name'];



type CharacterscomesInLaterHelper<T> = T extends { 'comesInLater': true } ? T : never;
export type CharacterscomesInLater = CharacterscomesInLaterHelper<Character>['name'];
type CharactersPlotlessRole<T> = T extends { 'plotLessRole': true } ? T : never;
export type CharacterPlotless = CharactersPlotlessRole<Character>['name'];



type CharacterIntern = {
    name: string,
    paranoiaLimit: number,
    tags: readonly Tag[],
    abilities: readonly Ability[],
    startLocation: readonly LocationName[];
    forbiddenLocation?: readonly LocationName[],
    comesInLater?: true,
    plotLessRole?: true,

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




export const characters = toRecord([...data.characters] as const satisfies readonly CharacterIntern[], 'name');

export const characterscomesInLater = Object.values(characters).filter(x => (x as { comesInLater?: true })['comesInLater']).map(x => x.name) as readonly CharacterscomesInLater[];



export function isCharacterLate(name: CharacterName): name is CharacterscomesInLater {
    return (characters[name] as { comesInLater?: true })?.comesInLater ?? false;
}
export function isCharacterPlotless(name: CharacterName): name is CharacterPlotless {
    return (characters[name] as { plotLessRole?: true })?.plotLessRole ?? false;
}
export function isCharacterName(name: string): name is CharacterName {
    return name in characters;
}
export function isLocationName(name: string): name is LocationName {
    return locations.some(x => x == name);
}

