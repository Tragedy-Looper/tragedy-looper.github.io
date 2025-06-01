import * as data from "../data";
import { distinct, keys, toRecord } from "../misc"
import type { Tragedy } from "../tragedys.g";
import { isOption, type Options } from "./core";
import type { IncidentName } from "./incidents"
import { type PlotName } from "./plots"
import { isRoleName, type RoleName } from "./roles";


export type TragedySetName = keyof typeof data.tragedysLookup;


export type CastOptions = { castOptions?: Options };

export interface AditionalRoles { aditionalRoles?: readonly RoleName[] }

export function hasCastOption<T>(obj: T): obj is T & Required<CastOptions> {
    if (obj == undefined || obj == null || typeof obj !== 'object') {
        return false;
    }
    if (!('castOptions' in obj)) {
        return false;
    }
    if (!Array.isArray(obj.castOptions)) {
        return false;
    }
    if (!obj.castOptions.every(isOption)) {
        return false;
    }
    return true;
}
export function hasAdditonalRoles<T>(obj: T): obj is T & { aditionalRoles: readonly RoleName[] } {
    if (obj == undefined || obj == null || typeof obj !== 'object') {
        return false;
    }
    if (!('aditionalRoles' in obj)) {
        return false;
    }
    if (!Array.isArray(obj.aditionalRoles)) {
        return false;
    }
    if (!obj.aditionalRoles.every(isRoleName)) {
        return false;
    }
    return true;
}


export function getTragedySetRoles(tg: Tragedy) {

    const plotRoles = [...tg.mainPlots, ...tg.subPlots].flatMap(x => keys(data.plotsLookup[x].roles));
    const additionalRoles = hasAdditonalRoles(tg) ? tg.aditionalRoles : [];

    return distinct([...plotRoles, ...additionalRoles]);
}






export function isTragedySetName(name: string): name is TragedySetName {
    return name in data.tragedysLookup;
}
