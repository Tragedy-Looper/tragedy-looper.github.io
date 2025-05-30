/* eslint-disable no-extra-boolean-cast */
import type { SetIntersection } from "utility-types";
import { type KeysOfUnion, type Union, toRecord, require } from "../misc";
import { isCharacterName, type CharacterName, type LocationName, isLocationName } from "./characters";
import type { DefinitionRecord, Options, WithScriptSpecification } from "./core";
import { isIncidentName, type IncidentName, type FakedIncident, type MobIncident, isIncident, incidents, type Incident } from "./incidents";
import { isPlotName, type Plots } from "./plots";
import { isRoleName, type RoleName } from "./roles";
import { isTragedySetName, tragedySets, type CastOptions, type TragedySets } from "./tragedySets";

import Ajv from 'ajv';
import { betterAjvErrors, type ValidationError } from '@apideck/better-ajv-errors';

import scriptSchema from './../scripts.schema.json' with { type: 'json' };


import * as data from "../data";
import type { Script } from "../scripts.g";

export const ratingMap = [
    'No rating',
    'Appalling',
    'Horrible',
    'Very Bad',
    'Bad',
    'Average',
    'Fine',
    'Good',
    'Very Good',
    'Great',
    'Masterpiece'
] as const;


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

            if ((currentIncident).mob !== undefined) {
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

export type Scripts = typeof scripts;


export function validateScript(obj: unknown): { valid: true, script: Script } | { valid: false, errors: ValidationError[] } {
    // const validation = validate(obj, scriptSchema.properties.scripts.items);

    if (typeof obj == 'string') {
        // we asume thats the script in json format in string representation
        try {
            obj = JSON.parse(obj);
        } catch (error) {
            return {
                valid: false,
                errors: [{
                    context: {
                        errorType: 'format',
                    },
                    message: `Invalid JSON format: ${error}`,
                    path: '{base}',
                }]
            };
        }
    }


    if (obj === null || typeof obj !== 'object') {
        return {
            valid: false,
            errors: [{
                context: {
                    errorType: 'type',
                },
                path: '{base}',
                message: 'must be object'
            }]
        };
    }
    if (!('tragedySet' in obj)) {
        return {
            valid: false,
            errors: [{
                context: {
                    errorType: 'required',
                }, path: '/tragedySet',
                message: 'must have required property "tragedySet"'
            }]
        };
    }
    const usedTragedySet = obj.tragedySet;
    if (typeof usedTragedySet !== 'string' || !isTragedySetName(usedTragedySet)) {
        return {
            valid: false,
            errors: [{
                context: {
                    errorType: 'enum',
                    allowedValues: Object.keys(tragedySets),
                },
                path: '/tragedySet',
                message: `must be one of the enum values: ${Object.keys(tragedySets).join(', ')}`
            }]
        };
    }

    const schema = scriptSchema.properties.scripts.items.oneOf.filter(x => x.properties.tragedySet.enum.includes(usedTragedySet))[0];
    if (!schema) {
        return {
            valid: false,
            errors: [{
                context: {
                    errorType: 'enum',
                    allowedValues: Object.keys(tragedySets),
                },
                message: `No schema found for tragedySet "${usedTragedySet}"`,
                path: '/tragedySet'
            }]
        };
    }

    // store possible additonal propertsys that are not in the schema, but may be in the object
    // wich is ok
    const additionalProps = ['id', 'local'];
    const data = Object.entries(obj).filter(([key]) => additionalProps.includes(key));
    // remove the additional properties from the object
    for (const [key] of data) {
        delete (obj as Record<string, unknown>)[key];
    }


    const ajv = new Ajv({ allErrors: true, strict: true });
    const validate = ajv.compile(schema);
    const valid = validate(obj);
    if (valid) {
        return {
            valid: true,
            script: { ...Object.fromEntries(data), ...obj } as Script,
        } as const;
    } else {
        const errors = betterAjvErrors({ schema: schema as unknown as any, data, errors: validate.errors });

        return {
            valid: false,
            errors
        } as const;
    }

}

export function isScript(obj: unknown): obj is Script {

    const validation = validateScript(obj);
    if (validation.valid) {
        return true;
    }
    if (validation.errors.length > 0) {
        console.error("Script validation failed", validation.errors);
    } else {
        console.error("Script validation failed, no errors found");
    }
    return false;

    // if (typeof obj !== 'object') return false;
    // if (obj === null) return false;
    // if (!(!Array.isArray(obj))) { console.error("faild test !Array.isArray(obj), obj"); return false; }
    // if (!('title' in obj)) { console.error("faild test 'title' in obj", obj); return false; }
    // if (!(typeof obj.title == 'string')) { console.error("faild test typeof obj.title == 'string'", obj); return false; }
    // if (!('creator' in obj)) { console.error("faild test 'creator' in obj", obj); return false; }
    // if (!(typeof obj.creator == 'string')) { console.error("faild test typeof obj.creator == 'string'", obj); return false; }
    // if (!(!('set' in obj)
    //     || (typeof obj.set == 'object'
    //         && obj.set !== null
    //         && 'name' in obj.set && typeof obj.set.name == 'string'
    //         && 'number' in obj.set && typeof obj.set.number == 'number')
    // )) { console.error("faild test set", obj); return false; }
    // if (!('difficultySets' in obj)) { console.error("faild test 'difficultySets' in obj", obj); return false; }
    // if (!(Array.isArray(obj.difficultySets))) { console.error("faild test Array.isArray(obj.difficultySets), obj"); return false; }
    // if (!(obj.difficultySets.every((e: object) => typeof e == 'object'
    //     && e !== null
    //     && 'numberOfLoops' in e
    //     && typeof e.numberOfLoops == 'number'
    //     && 'difficulty' in e
    //     && typeof e.difficulty == 'number'
    // ))) { console.error("faild test difficulty"); return false; }
    // if (!('tragedySet' in obj)) { console.error("faild test 'tragedySet' in obj"); return false; }
    // if (!(typeof obj.tragedySet == 'string')) { console.error("faild test typeof obj.tragedySet == 'string'"); return false; }
    // if (!(isTragedySetName(obj.tragedySet))) { console.error("faild test isTragedySetName(obj.tragedySet)"); return false; }
    // if (!('mainPlot' in obj)) { console.error("faild test 'mainPlot' in obj"); return false; }
    // if (!(Array.isArray(obj.mainPlot))) { console.error("faild test Array.isArray(obj.mainPlot)", obj.mainPlot); return false; }
    // if (!(obj.mainPlot.every(isPlotName))) { console.error("faild test obj.mainPlot.every(isPlotName)", obj.mainPlot); return false; }
    // if (!('subPlots' in obj)) { console.error("faild test 'subPlots' in obj"); return false; }
    // if (!(Array.isArray(obj.subPlots))) { console.error("faild test Array.isArray(obj.subPlots)", obj.subPlots); return false; }
    // if (!(obj.subPlots.every(x => {
    //     if (typeof x == 'string') {
    //         return isPlotName(x);
    //     } else if (Array.isArray(x)) {
    //         return isPlotName(x[0]);
    //     } else {
    //         return false;
    //     }
    // }))) { console.error("faild test obj.subPlots.every(isPlotName)", obj.subPlots); return false; }
    // if (!('daysPerLoop' in obj)) { console.error("faild test 'daysPerLoop' in obj"); return false; }
    // if (!('cast' in obj)) { console.error("faild test 'cast' in obj"); return false; }
    // if (!(typeof obj.cast == 'object')) { console.error("faild test typeof obj.cast == 'object'"); return false; }
    // if (!(obj.cast !== null)) { console.error("faild test obj.cast !== null"); return false; }
    // if (!(Object.keys(obj.cast).every(isCharacterName))) { console.error("faild test Object.keys(obj.cast).every(isCharacterName)"); return false; }
    // if (!(Object.values(obj.cast).every((value: unknown) => {
    //     if (typeof value == 'string') {
    //         const isName = value.split('|').every(isRoleName);
    //         if (!isName) {
    //             console.error("faild test isRoleName(value)", value);
    //         }
    //         return isName;
    //     } else if (Array.isArray(value) && typeof value[0] == 'string') {
    //         if (!isRoleName(value[0])) {
    //             console.error("faild test isRoleName(value[0])", value);
    //         }
    //         return isRoleName(value[0]) && typeof value[1] == 'object' && value[1] !== null && Object.keys(value[1]).every(x => typeof x == 'string');
    //     }
    // }))) { console.error("faild test cast"); return false; }
    // if (!('incidents' in obj)) { console.error("faild test 'incidents' in obj"); return false; }
    // if (!(Array.isArray(obj.incidents))) { console.error("faild test Array.isArray(obj.incidents)"); return false; }
    // if (!(obj.incidents.every(x => isScriptIncident(x)))) { console.error("faild test obj.incidents.every(x => isScriptIncident(x))", obj.incidents); return false; }
    // if (!(!('specialRules' in obj)
    //     || (typeof obj.specialRules == 'object'
    //         && Array.isArray(obj.specialRules)
    //         && obj.specialRules.every(x => typeof x == 'string')
    //     )
    // )) {

    //     if (!obj.specialRules) {
    //         console.error("faild test obj.specialRules");
    //         return false;
    //     }
    //     if (typeof obj.specialRules !== 'object') {
    //         console.error("faild test typeof obj.specialRules == 'object'");
    //         return false;
    //     }
    //     if (!Array.isArray(obj.specialRules)) {
    //         console.error("faild test Array.isArray(obj.specialRules)");
    //         return false;
    //     }
    //     if (!obj.specialRules.every(x => typeof x == 'string')) {
    //         console.error(`faild test obj.specialRules.every(x => typeof x == 'string')`, obj.specialRules);
    //     }

    //     console.error("faild test spectial rules", obj.title);

    //     return false;
    // }
    // if (('victory-condition' in obj)) {
    //     if (!(typeof obj["victory-condition"] == 'string')) { console.error("faild test typeof obj.victory-condition == 'string'"); return false; }
    // }
    // if (!('story' in obj)) { console.error("faild test 'story' in obj"); return false; }
    // if (!(typeof obj.story == 'string')) { console.error("faild test typeof obj.story == 'string'"); return false; }
    // if (!('mastermindHints' in obj)) { console.error("faild test 'mastermindHints' in obj"); return false; }
    // if (!(typeof obj.mastermindHints == 'string')) { console.error("faild test typeof obj.mastermindHints == 'string'"); return false; }
    // {

    //     return true;
    // }
    // return false;

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
        'victory-conditions': string,
        story: string,
        mastermindHints: string,
    }
}>


export type ScriptName = keyof Scripts;

export const scripts = toRecord([
    ...data.scripts as unknown as readonly Script[],
    // .filter(x => isScript(x)), // we filter at bild time in the prepare script
] as const satisfies readonly Script[], 'title');


export function isScriptName(name: string | undefined | null): name is ScriptName {
    if (!name) {
        return false;
    }
    return name in scripts;
}

