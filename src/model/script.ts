/* eslint-disable no-extra-boolean-cast */
import type { SetIntersection } from "utility-types";
import { type KeysOfUnion, type Union, toRecord, require } from "../misc";
import { isCharacterName, type CharacterName, type LocationName, isLocationName } from "./characters";
import type { DefinitionRecord, Options, WithScriptSpecification } from "./core";
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

type roleToTragedySet<T extends keyof TragedySets> = 'Person' | getAdditionalRoles<TragedySets[T]>[never] | KeysOfUnion<Plots[TragedySets[T]['subPlots'][never]]['roles'] | Plots[TragedySets[T]['mainPlots'][never]]['roles']>;


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
        mainPlot: readonly WithScriptSpecification<'plot', TragedySets[k]['mainPlots'][number]>[],
        subPlots: readonly WithScriptSpecification<'plot', TragedySets[k]['subPlots'][number]>[],
        daysPerLoop: number,
        cast: DefinitionRecord<'character', 'role', CharacterName, roleToTragedySet<k>, true, getCastOptions<k>>,
        castOptions?: Options,

        incidents: readonly ScriptIncident<k>[],
        specialRules?: readonly string[],
        specifics: string,
        story: string,
        mastermindHints: string,
    }
}>


export type ScriptName = keyof Scripts;

export const scripts = toRecord([
    ...data.scripts.filter(x => isScript(x)),

    {
        title: 'Actually, I Am...',
        creator: 'translated by megakun',
        set: {
            name: 'Another Horizon',
            number: 1,
        },
        tragedySet: 'Another Horizon',
        mainPlot: ['Shadow Demon King'],
        subPlots: ['The World of Dollhouse', 'Threads of Fate'],
        difficultySets: [
            {
                difficulty: 1,
                numberOfLoops: 3,
            }
        ],
        daysPerLoop: 5,
        cast: {
            "Boy Student": 'Person',
            "Rich Man’s Daughter": 'Person',
            "Shrine Maiden": 'Person',
            "Doctor": 'Person',
            "Class Rep": 'Person',
            "Alien": 'Person',
            "Pop Idol": 'Person',
            "Journalist": 'Quidnunc',
            "Henchman": 'Twilight',
        },
        incidents: [
            {
                day: 1,
                incident: 'Confession',
                culprit: 'Rich Man’s Daughter',
            },
            {
                day: 2,
                incident: 'Confession',
                culprit: 'Pop Idol',
            },
            {
                day: 3,
                incident: 'Confession',
                culprit: 'Alien',
            },
            {
                day: 4,
                incident: 'Confession',
                culprit: 'Rich Man’s Daughter', // <-- TODO: this is not possible already day 1 culprit
            },
            {
                day: 5,
                incident: 'Confession',
                culprit: 'Shrine Maiden',
            },
        ],
        specifics: '',
        mastermindHints: '',
        story: '',
    },
    {
        title: 'I‘m A Normal Human',
        creator: 'translated by megakun',
        set: {
            name: 'Another Horizon',
            number: 2,
        },
        tragedySet: 'Another Horizon',
        mainPlot: ['Parallel World War'],
        subPlots: ['Threads of Fate', 'The World of Dollhouse'],
        difficultySets: [
            {
                difficulty: 1,
                numberOfLoops: 3,
            }
        ],
        daysPerLoop: 6,
        cast: {
            "Girl Student": 'Person',
            "Shrine Maiden": 'Person',
            "Informer": 'Person',
            "Doctor": 'Person',
            "Alien": 'Person',
            "Godly Being": ['Agent', { "enters on loop": 2 }],
            "Pop Idol": 'Person',
            "Boss": ['Quidnunc', { Turf: 'Hospital' }],
        },
        incidents: [
            {
                day: 1,
                incident: 'Confession',
                culprit: 'Alien',
            },
            {
                day: 2,
                incident: 'World Convergence',
                culprit: 'Godly Being',
            },
            {
                day: 3,
                incident: 'Confession',
                culprit: 'Girl Student',
            },
            {
                day: 4,
                incident: 'Confession',
                culprit: 'Alien', // <-- TODO: this is not possible already day 1 culprit
            },
            {
                day: 5,
                incident: 'Confession',
                culprit: 'Informer',
            },
            {
                day: 6,
                incident: 'Confession',
                culprit: 'Doctor',
            },
        ],
        specifics: '',
        mastermindHints: '',
        story: '',
    },
    {
        title: 'Packed Tragedy',
        creator: 'translated by megakun',
        set: {
            name: 'Another Horizon',
            number: 3,
        },
        tragedySet: 'Another Horizon',
        mainPlot: ['Lost Heart'],
        subPlots: ['Ego Wave', 'Moonside City'],
        difficultySets: [
            {
                difficulty: 1,
                numberOfLoops: 7,
            }
        ],
        daysPerLoop: 2,
        cast: {
            "Boy Student": 'Quidnunc',
            "Girl Student": 'Agitator',
            "Rich Man’s Daughter": 'Neurosis',
            "Police Officer": 'Agent',
            "Doctor": 'Person',
            "Patient": 'Brain',
            "Journalist": 'Person',
            "Henchman": ['Animus', { world: 'abnormal' }],
            "Illusion": 'Person',
        },
        incidents: [
            {
                day: 1,
                incident: 'Small Force',
                culprit: 'Alien',
            },
            {
                day: 2,
                incident: 'Hospital Incident',
                culprit: 'Rich Man’s Daughter',
            },

        ],
        specifics: '',
        mastermindHints: '',
        story: '',
    },
    {
        title: 'The Only One in the World',
        creator: 'translated by megakun',
        set: {
            name: 'Another Horizon',
            number: 4,
        },
        tragedySet: 'Another Horizon',
        mainPlot: ['Shadow Demon King'],
        subPlots: ['Ego Wave', 'Moonside City'],
        difficultySets: [
            {
                difficulty: 1,
                numberOfLoops: 5,
            }
        ],
        daysPerLoop: 6,
        cast: {
            "Boy Student": 'Person',
            "Rich Man’s Daughter": 'Quidnunc',
            "Office Worker": 'Person',
            "Patient": 'Neurosis',
            "Mystery Boy": 'Agent',
            "Pop Idol": "Twilight",
            "Journalist": 'Person',
            "Scientist": 'Agitator',
            "Illusion": ['Animus', { world: 'normal' }],
        },
        incidents: [
            {
                day: 1,
                incident: 'World End',
                culprit: 'Rich Man’s Daughter',
            },
            {
                day: 2,
                incident: 'World Convergence',
                culprit: 'Mystery Boy',
            },
            {
                day: 3,
                incident: 'Increasing Unease',
                culprit: 'Patient',
            },
            {
                day: 4,
                incident: 'Assassination',
                culprit: 'Journalist',
            },
            {
                day: 5,
                incident: 'Drifting to Another World',
                culprit: 'Illusion',
            },
            {
                day: 6,
                incident: 'Missing Person',
                culprit: 'Office Worker',
            },

        ],
        specifics: '',
        mastermindHints: '',
        story: '',
    },
    {
        title: 'Fictional Collapse',
        creator: 'translated by megakun',
        set: {
            name: 'Another Horizon',
            number: 5,
        },
        tragedySet: 'Another Horizon',
        mainPlot: ['Parallel World War'],
        subPlots: ['Fanatic Fox', 'Ego Wave'],
        difficultySets: [
            {
                difficulty: 1,
                numberOfLoops: 5,
            }
        ],
        daysPerLoop: 6,
        cast: {
            "Boy Student": 'Person',
            "Rich Man’s Daughter": 'Person',
            "Shrine Maiden": 'Person',
            "Office Worker": 'Person',
            "Informer": 'Agitator',
            "Doctor": ['Animus', { world: 'abnormal' }],
            "Class Rep": "Person",
            "Godly Being": ['Agent', { "enters on loop": 3 }],
            "Pop Idol": 'Agitator',
            "Illusion": ['Animus', { world: 'normal' }],
        },
        incidents: [
            {
                day: 3,
                incident: 'World Convergence',
                culprit: 'Doctor',
            },
            {
                day: 4,
                incident: 'World Convergence',
                culprit: 'Godly Being',
            },
            {
                day: 6,
                incident: 'World End',
                culprit: 'Illusion',
            },
        ],
        specifics: '',
        mastermindHints: '',
        story: '',
    },
    {
        title: 'Beyond Praying Stage',
        creator: 'translated by andrewshen123',
        set: {
            name: 'Another Horizon',
            number: 5,
        },
        tragedySet: 'Another Horizon',
        mainPlot: ['Parallel World War'],
        subPlots: ['Fanatic Fox', 'Ego Wave'],
        difficultySets: [
            {
                difficulty: 1,
                numberOfLoops: 5,
            }
        ],
        daysPerLoop: 6,
        cast: {
            "Boy Student": 'Person',
            "Rich Man’s Daughter": 'Person',
            "Shrine Maiden": 'Person',
            "Office Worker": 'Person',
            "Informer": 'Agitator',
            "Doctor": ['Animus', { world: 'abnormal' }],
            "Class Rep": "Person",
            "Godly Being": ['Agent', { "enters on loop": 3 }],
            "Pop Idol": 'Agitator',
            "Illusion": ['Animus', { world: 'normal' }],
        },
        incidents: [
            {
                day: 3,
                incident: 'World Convergence',
                culprit: 'Doctor',
            },
            {
                day: 4,
                incident: 'World Convergence',
                culprit: 'Godly Being',
            },
            {
                day: 6,
                incident: 'World End',
                culprit: 'Illusion',
            },
        ],
        specifics: '',
        mastermindHints: '',
        story: '',
    },
    {
        title: 'Unknown',
        creator: 'Hallycon translated by megakun',

        tragedySet: 'Another Horizon',
        mainPlot: ['Shadow Demon King'],
        subPlots: ['Fanatic Fox', 'Ego Wave'],
        difficultySets: [
            {
                difficulty: 1,
                numberOfLoops: 4,
            }
        ],
        daysPerLoop: 6,
        cast: {
            "Doctor": 'Person',
            "Patient": 'Person',
            "Police Officer": 'Person',
            "Office Worker": 'Fanatic',
            "Informer": ['Animus', { world: 'normal' }],
            "Girl Student": 'Person',
            "Rich Man’s Daughter": "Agitator",
            "Shrine Maiden": 'Twilight',
            "Class Rep": ['Animus', { world: 'abnormal' }],
        },
        incidents: [
            {
                day: 3,
                incident: 'Assassination',
                culprit: 'Class Rep',
            },
            {
                day: 4,
                incident: 'World End',
                culprit: 'Patient',
            },
            {
                day: 5,
                incident: 'Small Force',
                culprit: 'Rich Man’s Daughter',
            },
            {
                day: 6,
                incident: 'Insane Murder',
                culprit: 'Police Officer',
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

