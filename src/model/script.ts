/* eslint-disable no-extra-boolean-cast */
import { type KeysOfUnion, type Union, toRecord, require } from "../misc";
import { isCharacterName, type CharacterName, type LocationName, isLocationName } from "./characters";
import type { DefinitionRecord, Options, WithScriptSpecification } from "./core";
import { isIncidentName, type IncidentName, type FakedIncident, type MobIncident, isIncident } from "./incidents";
import { isPlotName } from "./plots";
import { isRoleName, type RoleName } from "./roles";
import { isTragedySetName, type CastOptions, } from "./tragedySets";



import * as data from "../data";
import type { Script } from "../scripts.g";
import { validateScript } from "./validation";
import type { Incident } from "../incidents.g";

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


export type ScriptIncident = Script['incidents'][number];


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
        currentIncident = data.incidentsLookup[name];
    } else if (Array.isArray(obj.incident) && obj.incident.length == 2) {
        if (!isIncidentName(obj.incident[0]) || !isIncidentName(obj.incident[1])) {
            console.error('not an incident name', obj.incident)
            return false;
        }
        currentIncident = data.incidentsLookup[obj.incident[0]];
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
}






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

