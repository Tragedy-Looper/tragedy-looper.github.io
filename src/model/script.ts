/* eslint-disable no-extra-boolean-cast */
import type { SetIntersection } from "utility-types";
import { type KeysOfUnion, type Union, toRecord, require } from "../misc";
import { isCharacterName, type CharacterName, type LocationName, isLocationName, type CharactersAvailableAtScriptCreation } from "./characters";
import type { DefinitionRecord, Options } from "./core";
import { isIncidentName, type IncidentName, type FakedIncident, type MobIncident, isIncident, incidents, type Incident } from "./incidents";
import { isPlotName, type Plots } from "./plots";
import { isRoleName, type RoleName } from "./roles";
import { isTragedySetName, type CastOptions, type TragedySets } from "./tragedySets";

import * as data from "../data";



export type ScriptIncident<T extends keyof TragedySets = keyof TragedySets> = {
    day: number,
    // incident: Exclude<IncidentName, FakedIncident> | readonly [FakedIncident, Exclude<IncidentName, FakedIncident>],
    incident: Exclude<Union<TragedySets[T]['incidents']>, FakedIncident | MobIncident> | readonly [Exclude<SetIntersection<Union<TragedySets[T]['incidents']>, FakedIncident>, MobIncident>, Exclude<Union<TragedySets[T]['incidents']>, FakedIncident>],
    culprit: CharacterName,
} | {
    day: number,
    // incident: Exclude<IncidentName, FakedIncident> | readonly [FakedIncident, Exclude<IncidentName, FakedIncident>],
    incident: SetIntersection<MobIncident, Exclude<Union<TragedySets[T]['incidents']>, FakedIncident>> | readonly [SetIntersection<MobIncident, SetIntersection<Union<TragedySets[T]['incidents']>, FakedIncident>>, Exclude<Union<TragedySets[T]['incidents']>, FakedIncident>],
    culprit: LocationName,
};



export type ScriptIncidentPlayer = {
    day: number,
    incident: Exclude<IncidentName, FakedIncident>
}
export function toPlayerIncident(params: ScriptIncident): ScriptIncidentPlayer {
    return {
        day: params.day,
        incident: Array.isArray(params.incident) ? params.incident[1] : params.incident,
    }

}

export function isScriptIncident(obj: unknown, omitCulprit: true): obj is ScriptIncidentPlayer;
export function isScriptIncident(obj: unknown): obj is ScriptIncident;
export function isScriptIncident(obj: unknown, omitCulprit?: true): obj is ScriptIncident {

    if (typeof obj !== 'object') {
        return false;
    }
    if (!obj) {
        return false;
    }

    if (!('day' in obj)) {
        return false;
    }
    if (typeof obj.day !== 'number') {
        return false;
    }

    if (!('incident' in obj)) {
        return false;
    }

    let currentIncident: Incident;
    if (typeof obj.incident === 'string') {
        const name = obj.incident;
        if (!isIncidentName(name)) {
            console.error('not an incident name', name)
            return false;
        }
        currentIncident = incidents[name];
    } else if (Array.isArray(obj.incident) && obj.incident.length == 2) {
        if (!isIncidentName(obj.incident[0]) || !isIncidentName(obj.incident[1])) {
            console.error('not an incident name', obj.incident)
            return false;
        }
        currentIncident = incidents[obj.incident[0]];
    } else {
        console.error('not an incident name', obj.incident)
        return false;
    }



    if (!omitCulprit) {

        if (!('culprit' in obj)) {
            return false;
        }
        if (typeof obj.culprit === 'string') {

            if (require(currentIncident).mob !== undefined) {
                if (!isLocationName(obj.culprit)) {
                    console.error('Not a Locaion name', obj.culprit)
                    return false;
                }
            } else {
                if (!isCharacterName(obj.culprit)) {
                    console.error('Not a charcter name', obj.culprit)
                    return false;
                }
            }
        } else {
            false;
        }
        // if ((typeof obj.culprit !== 'string' || (!isCharacterName(obj.culprit) && !isLocationName(obj.culprit))) &&
        //     (!Array.isArray(obj.culprit) || obj.culprit.length != 2 || !isLocationName(obj.culprit[0]) || typeof obj.culprit[1] != 'number')) {
        //     return false;
        // }
    }

    return true;
}

export function isScriptIncidentWithoutCulprit(obj: unknown): obj is ScriptIncidentPlayer {
    return isScriptIncident(obj, true);
}

export function getRoleOfCast(scrtipt: Script, char: CharacterName): RoleName | undefined {
    const castObject = scrtipt.cast[char as keyof Script['cast']] as RoleName
        | readonly [RoleName];
    if (!castObject) {
        return undefined;
    }
    if (typeof castObject == 'string') {
        return castObject;
    }
    else {
        return castObject[0];
    }
}

export type Script = Scripts[keyof Scripts];
export type Scripts = typeof scripts;


export function isScript(obj: unknown): obj is Script {
    if (typeof obj !== 'object') return false;
    if (obj === null) return false;
    if (!(!Array.isArray(obj))) { console.error("faild test !Array.isArray(obj)"); return false; }
    if (!('title' in obj)) { console.error("faild test 'title' in obj"); return false; }
    if (!(typeof obj.title == 'string')) { console.error("faild test typeof obj.title == 'string'"); return false; }
    if (!('creator' in obj)) { console.error("faild test 'creator' in obj"); return false; }
    if (!(typeof obj.creator == 'string')) { console.error("faild test typeof obj.creator == 'string'"); return false; }
    if (!(!('set' in obj)
        || (typeof obj.set == 'object'
            && obj.set !== null
            && 'name' in obj.set && typeof obj.set.name == 'string'
            && 'number' in obj.set && typeof obj.set.number == 'number')
    )) { console.error("faild test set"); return false; }
    if (!('difficultySets' in obj)) { console.error("faild test 'difficultySets' in obj"); return false; }
    if (!(Array.isArray(obj.difficultySets))) { console.error("faild test Array.isArray(obj.difficultySets)"); return false; }
    if (!(obj.difficultySets.every((e: object) => typeof e == 'object'
        && e !== null
        && 'numberOfLoops' in e
        && typeof e.numberOfLoops == 'number'
        && 'difficulty' in e
        && typeof e.difficulty == 'number'
    ))) { console.error("faild test difficulty"); return false; }
    if (!('tragedySet' in obj)) { console.error("faild test 'tragedySet' in obj"); return false; }
    if (!(typeof obj.tragedySet == 'string')) { console.error("faild test typeof obj.tragedySet == 'string'"); return false; }
    if (!(isTragedySetName(obj.tragedySet))) { console.error("faild test isTragedySetName(obj.tragedySet)"); return false; }
    if (!('mainPlot' in obj)) { console.error("faild test 'mainPlot' in obj"); return false; }
    if (!(Array.isArray(obj.mainPlot))) { console.error("faild test Array.isArray(obj.mainPlot)", obj.mainPlot); return false; }
    if (!(obj.mainPlot.every(isPlotName))) { console.error("faild test obj.mainPlot.every(isPlotName)", obj.mainPlot); return false; }
    if (!('subPlots' in obj)) { console.error("faild test 'subPlots' in obj"); return false; }
    if (!(Array.isArray(obj.subPlots))) { console.error("faild test Array.isArray(obj.subPlots)", obj.subPlots); return false; }
    if (!(obj.subPlots.every(x => {
        if (typeof x == 'string') {
            return isPlotName(x);
        } else if (Array.isArray(x)) {
            return isPlotName(x[0]);
        } else {
            return false;
        }
    }))) { console.error("faild test obj.subPlots.every(isPlotName)", obj.subPlots); return false; }
    if (!('daysPerLoop' in obj)) { console.error("faild test 'daysPerLoop' in obj"); return false; }
    if (!('cast' in obj)) { console.error("faild test 'cast' in obj"); return false; }
    if (!(typeof obj.cast == 'object')) { console.error("faild test typeof obj.cast == 'object'"); return false; }
    if (!(obj.cast !== null)) { console.error("faild test obj.cast !== null"); return false; }
    if (!(Object.keys(obj.cast).every(isCharacterName))) { console.error("faild test Object.keys(obj.cast).every(isCharacterName)"); return false; }
    if (!(Object.values(obj.cast).every((value: unknown) => {
        if (typeof value == 'string') {
            return isRoleName(value);
        } else if (Array.isArray(value) && typeof value[0] == 'string') {
            return isRoleName(value[0]) && typeof value[1] == 'object' && value[1] !== null && Object.keys(value[1]).every(x => typeof x == 'string');
        }
    }))) { console.error("faild test cast"); return false; }
    if (!('incidents' in obj)) { console.error("faild test 'incidents' in obj"); return false; }
    if (!(Array.isArray(obj.incidents))) { console.error("faild test Array.isArray(obj.incidents)"); return false; }
    if (!(obj.incidents.every(x => isScriptIncident(x)))) { console.error("faild test obj.incidents.every(x => isScriptIncident(x))", obj.incidents); return false; }
    if (!(!('specialRules' in obj)
        || (typeof obj.specialRules == 'object'
            && Array.isArray(obj.specialRules)
            && obj.specialRules.every(x => typeof x == 'string')
        )
    )) { console.error("faild test incidents"); return false; }
    if (!('specifics' in obj)) { console.error("faild test 'specifics' in obj"); return false; }
    if (!(typeof obj.specifics == 'string')) { console.error("faild test typeof obj.specifics == 'string'"); return false; }
    if (!('story' in obj)) { console.error("faild test 'story' in obj"); return false; }
    if (!(typeof obj.story == 'string')) { console.error("faild test typeof obj.story == 'string'"); return false; }
    if (!('mastermindHints' in obj)) { console.error("faild test 'mastermindHints' in obj"); return false; }
    if (!(typeof obj.mastermindHints == 'string')) { console.error("faild test typeof obj.mastermindHints == 'string'"); return false; }
    {

        return true;
    }
    return false;

}



type getCastOptions<T extends keyof TragedySets> = getCastOptions2<TragedySets[T]>
type getCastOptions2<t> = t extends Required<CastOptions> ? t['castOptions'] : readonly []
    ;
type getAdditionalRoles<t> = t extends { aditionalRoles: readonly RoleName[] } ? t['aditionalRoles'] : never
    ;

type roleToPlot<T extends keyof TragedySets, P extends keyof Plots> =
    'Person'
    | getAdditionalRoles<TragedySets[T]>[never]
    | Exclude<KeysOfUnion<Plots[P]['roles']>, 'conditonal'>
    ;

type roleToTragedySet<T extends keyof TragedySets> =
    'Person'
    | getAdditionalRoles<TragedySets[T]>[never]
    | Exclude<KeysOfUnion<Plots[TragedySets[T]['subPlots'][never]]['roles']
        | Plots[TragedySets[T]['mainPlots'][never]]['roles']>, 'conditonal'>
    | ((Plots[TragedySets[T]['subPlots'][never]]['roles']
        | Plots[TragedySets[T]['mainPlots'][never]]['roles']) extends infer K
        ? K extends { 'conditonal': Array<Partial<Record<RoleName, string>>> }
        ? KeysOfUnion<K['conditonal']>
        : never
        : never)
    ;


type ScriptPlot<set extends keyof TragedySets, plotType extends 'mainPlots' | 'subPlots'> = Partial<{
    [plot in TragedySets[set][plotType][number]]: {
        cast: DefinitionRecord<'role', 'character', Exclude<roleToPlot<set, plot>, 'Person'>, CharactersAvailableAtScriptCreation, false, getCastOptions<set>>,



    }
}>


type bar<T extends readonly unknown[], allowed extends number> =
    T['length'] extends allowed ? T
    : never
    ;
type lengthT<x extends readonly unknown[]> = x['length'];


type Range<min extends number, max extends number> =
    min extends 0
    ? max extends 3
    ? 0 | 1 | 2 | 3
    : max extends 2
    ? 0 | 1 | 2
    : max extends 1
    ? 0 | 1
    : max extends 0
    ? 0
    : never
    : min extends 1
    ? max extends 3
    ? 1 | 2 | 3
    : max extends 2
    ? 1 | 2
    : max extends 1
    ? 1
    : never
    : min extends 2
    ? max extends 3
    ? 2 | 3
    : max extends 2
    ? 2
    : never
    : min extends 3
    ? max extends 3
    ? 3
    : never
    : never;
    
function xx<T extends object>(params: T): bar< KeysOfUnion< T> , Range<1,3> > {

}
const aa = xx({foo:2,bar:2} as const);
const aai = xx({foo:2,bar:2,t1:3,t2:3,i3:3} as const);

const xxx: ScriptPlot<'First Steps', 'mainPlots'> = {
    "Light of the Avenger": {
        cast: {
            Brain: {
                Henchman: {
                    "Start Location": 'City'
                },

            },
        }
    },
    "A Place to Protect": {
        cast: {
            "Key Person": {
                "A.I.": {},
                'Alien': {}
            },
            Cultist: {
                Servant: {
                    "Start Location": 'School'
                }
            }
        }
    }
} as const;



type ScriptInternal = Union<{
    [k in keyof TragedySets]:
    {
        title: string,
        creator: string,
        set?: {
            name: string,
            number: number
        },
        difficultySets: readonly {
            numberOfLoops: number,
            difficulty: number,
        }[],
        tragedySet: TragedySets[k]['name'],
        mainPlots: ScriptPlot<k, 'mainPlots'>,
        subPlots: ScriptPlot<k, 'subPlots'>,
        daysPerLoop: number,
        cast: DefinitionRecord<'character', 'role', CharactersAvailableAtScriptCreation, roleToTragedySet<k>, true, getCastOptions<k>>,
        castOptions?: Options,
        // test: Record<roleToTragedySet<k>, 'foo'>,

        incidents: readonly ScriptIncident<k>[],
        specialRules?: readonly string[],
        specifics: string,
        story: string,
        mastermindHints: string,
    }

}>


export type ScriptName = keyof Scripts;

export const scripts = toRecord([
    // ...data.scripts.filter(x => isScript(x)),

    {
        title: 'Beyond Praying Stage',
        creator: 'NAOKI',
        set: {
            name: 'Another Horizon',
            number: 1,
        },

        tragedySet: 'Another Horizon',
        difficultySets: [
            {
                difficulty: 3,
                numberOfLoops: 4,
            },
            {
                difficulty: 5,
                numberOfLoops: 3,
            },
        ],
        mainPlots: {
            "Into Nothingness":
            {
                cast:
                {
                    Marionette: 'Office Worker',
                    Brain: 'Part-Timer',
                    Obstinate: 'Pop Idol',
                }
            }
        },
        subPlots: {
            "Jekyll and Hyde": {
                cast: {
                    Marionette: 'Shrine Maiden',
                }
            },
            "Throguh the Looking-Glass": {
                cast: {
                    Alice: 'Girl Student',
                }
            }
        },

        // ['Jekyll and Hyde', 'Throguh the Looking-Glass'],
        daysPerLoop: 4,
        cast: {
            "Girl Student": 'Alice',
            "Rich Man’s Daughter": 'Person',


        },
        incidents: [
            {
                day: 3,
                incident: 'Last Will',
                culprit: 'Rich Man’s Daughter',
            },
            {
                day: 4,
                incident: 'Crime of Passion',
                culprit: 'Pop Idol',
            },

        ],
        specifics: '',
        mastermindHints: '',
        story: '',
    },

] as const satisfies readonly ScriptInternal[], 'title');


export function isScriptName(name: string | undefined | null): name is ScriptName {
    if (!name) {
        return false;
    }
    return name in scripts;
}

