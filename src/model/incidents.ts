import * as data from "../data";
import type { Incident } from "../incidents.g";
import { toRecord, type Union } from "../misc";



// export type Incident = IncidentInternal & {
//     name: IncidentName,
// }

export type Incidents = IncidentsHelper['incidents'];

export type DoseNotTriggerIncident = { doseNotTriggerIncidentEffect?: true }

export function isMobIncident(name: unknown): name is MobIncident {
    if (typeof name !== 'string' || !isIncidentName(name)) {
        return false;
    }
    const incident = data.incidentsLookup[name];
    return typeof incident.mob === 'number';
}

export function isFakeIncident(name: unknown): name is FakedIncident {
    if (typeof name != 'string' || !isIncidentName(name)) {
        return false;
    }
    const incident = data.incidentsLookup[name];
    return incident.faked === true;
}

export function isRepeatedCulpritIncident(name: unknown): name is MobIncident {
    if (typeof name !== 'string' || !isIncidentName(name)) {
        return false;
    }
    const incident = data.incidentsLookup[name];
    return incident.repeatedCulprit === true;
}

export function isIncident(obj: unknown): obj is Incident {

    if (typeof obj == 'object'
        && obj != null
        && 'id' in obj
        && typeof obj.id == 'string'

        && (!('faked' in obj)
            || (typeof obj.faked == 'boolean'
                && obj.faked === true)
        )
        && (!('repeatedCulprit' in obj)
            || (typeof obj.repeatedCulprit == 'boolean'
                && obj.repeatedCulprit === true)
        )
        && (!('mob' in obj)
            || (typeof obj.mob == 'number'
                && obj.mob >= 0)
        )
    ) {
        return true;
    }
    return false;
}



export type IncidentName = keyof typeof data.incidentsLookup;

type MobIncidentHelper<T> = T extends { 'mob': number } ? T : never;
export type MobIncident = MobIncidentHelper<Incident>['id'];
type FakedIncidentHelper<T> = T extends { 'faked': true } ? T : never;
export type FakedIncident = FakedIncidentHelper<Incident>['id'];



class IncidentsHelper {
    public readonly incidents = toRecord([
        ...data.incidents as unknown as readonly Incident[],

    ], 'id');
}

const i = new IncidentsHelper();

export function isIncidentName(name: unknown): name is IncidentName {
    return typeof name === 'string' && i.incidents[name as IncidentName] != undefined;
}


