import { toRecord } from "../misc";
import type { ScriptSpecified } from "./core";
import type { DoseNotTriggerIncident } from "./incidents";
import * as data from "../data";



export type LocationName = 'Hospital' | 'Shrine' | 'City' | 'School';
export const locations = ['Hospital', 'Shrine', 'City', 'School'] as const;
export type Tag = 'boy' | 'girl' | 'student' | "man" | "woman" | "adult" | 'construct' | 'animal';


export type Character = Characters[keyof Characters];
export type Characters = (typeof characters);
export type CharacterName = Character['name'];


type CharactersMultipleStartLocationsHelper<T> = T extends { 'startLocation': readonly LocationName[] } ? T : never;
export type CharactersMultipleStartLocations = CharactersMultipleStartLocationsHelper<Character>['name'];

type CharactersSwitchingStartLocationHelper<T> = T extends { 'switchingStartLocation': true } ? T : never;
export type CharactersSwitchingStartLocation = CharactersSwitchingStartLocationHelper<Character>['name'];

type CharactersAvailableAtScriptCreationHelper<T> = T extends { 'notPlacedbyScript': true } ? never : T;
export type CharactersAvailableAtScriptCreation = CharactersAvailableAtScriptCreationHelper<Character>['name'];

type CharacterscomesInLaterHelper<T> = T extends { 'comesInLater': true } ? T : never;
export type CharacterscomesInLater = CharacterscomesInLaterHelper<Character>['name'];
type CharactersPlotlessRole<T> = T extends { 'plotLessRole': true } ? T : never;
export type CharacterPlotless = CharactersPlotlessRole<Character>['name'];



type CharacterIntern = {
    name: string,
    paranoiaLimit: number,
    tags: readonly Tag[],
    abilitys: readonly Ability[],
    startLocation: LocationName | readonly LocationName[];
    forbiddenLocation?: readonly LocationName[],
    switchingStartLocation?: true,
    comesInLater?: true,
    notPlacedbyScript?: true,
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




export const characters = toRecord([...data.characters,
{
    name: 'Part-Timer',
    tags: ['adult', 'man'],
    paranoiaLimit: 1,
    startLocation: 'City',
    abilitys: [
        {
            type: "passive",
            description: 'This card ignores its assigned Role and is a Person instead.'
        },

        {
            type: "passive",
            description: 'At the end of the day, if there are 3 or more total counters on this character, he dies.'
        },

        {
            type: "passive",
            description: 'At the start of the day, if this card is dead, place "Part-Timer(?)" in the City.'
        },

    ],
},
{
    name: 'Part-Timer(?)',
    tags: ['girl'],
    paranoiaLimit: 3,
    startLocation: 'City',
    notPlacedbyScript:true,
    abilitys: [
        {
            type: "passive",
            description: 'This character has the same Role, and is the culprit of the same Incident(s), as "Part-Timer"'
        },

        {
            type: "active",
            goodwillRank: 3,
            timesPerLoop: 1,
            description: 'Reveal this character‘s Role. Place 2 Goodwill on any character at this location.'
        },

    ],
},
{
    name: 'Servant',
    tags: ['adult', 'woman'],
    paranoiaLimit: 3,
    startLocation: ['City', 'School'],
    abilitys: [
        {
            type: "passive",
            description: 'If the Rich Man‘s Daughter or Boss would move from this character‘s location, she moves with that character, ignoring her original movement if needed. (If this could move her in multiple ways, the Leader decides which.) If the Rich Man‘s Daughter or Boss is at her location and would die, she dies instead.'
        },

        {
            type: "active",
            goodwillRank: 4,
            timesPerLoop: 1,
            description: 'Choose any other character in play. For the remainder of the loop, that character is also included in the above Trait.'
        },

    ],
},
{
    name: 'Metaworld Denizen',
    tags: ['girl'],
    paranoiaLimit: 2,
    startLocation: 'Shrine',
    abilitys: [

        {
            type: "active",
            goodwillRank: 3,
            timesPerLoop: 1,
            description: 'Place 1 Hope or Despair counter on a character at this location. If this character has Goodwill Refusal and at least 1 Goodwill counter, the Mastermind may use this ability as their own.'
        },

    ],
}

] as const satisfies readonly CharacterIntern[], 'name');

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

