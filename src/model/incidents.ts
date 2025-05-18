import * as data from "../data";
import { toRecord, type Union } from "../misc";
import type { ScriptSpecified } from "./core";
import type { AbilityTypeLose, OncePer } from "./roles";


// export type Incident = IncidentInternal & {
//     name: IncidentName,
// }

export type Incident = Union<IncidentsHelper['incidents']>;
export type Incidents = IncidentsHelper['incidents'];

export type DoseNotTriggerIncident = { doseNotTriggerIncidentEffect?: true }

export function isMobIncident(name: string): name is MobIncident {
    if (!isIncidentName(name)) {
        return false;
    }
    const incident = incidents[name];
    return 'mob' in incident && typeof incident.mob === 'number';
}

export function isFakeIncident(name: string): name is MobIncident {
    if (!isIncidentName(name)) {
        return false;
    }
    const incident = incidents[name];
    return 'faked' in incident && incident.faked === true;
}

export function isRepeatedCulpritIncident(name: string): name is MobIncident {
    if (!isIncidentName(name)) {
        return false;
    }
    const incident = incidents[name];
    return 'repeatedCulprit' in incident && incident.repeatedCulprit === true;
}

export function isIncident(obj: unknown): obj is Incident {

    if (typeof obj == 'object'
        && obj != null
        && 'name' in obj
        && typeof obj.name == 'string'

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


type IncidentInternal = OncePer<'game', void, {
    name: string,

    effect: readonly (
        {
            description: string,
            prerequisite?: string,
        } |
        {
            type: AbilityTypeLose,
            description?: string,
            prerequisite?: string,
        }
    )[],
    faked?: true,
    repeatedCulprit?: true,
    mob?: number,
} & ScriptSpecified>;

export type IncidentName = keyof IncidentsHelper['incidents'];

type MobIncidentHelper<T> = T extends { 'mob': number } ? T : never;
export type MobIncident = MobIncidentHelper<Incident>['name'];
type FakedIncidentHelper<T> = T extends { 'faked': true } ? T : never;
export type FakedIncident = FakedIncidentHelper<Incident>['name'];



class IncidentsHelper {
    public readonly incidents = toRecord([
        ...data.incidents,
        {
            name: 'Drifting to Another World',
            effect: [
                {
                    prerequisite: '1 Intrigue on the School',
                    description: 'Everyone in the School dies.'
                },
                {
                    type: "Mandatory Loss condition: Protagonists Death",
                    prerequisite: '2 Intrigue on the School',
                }
            ]
        },
        {
            name: 'Assassination',
            effect: [
                {
                    description: 'Kill any other character in this location or on the diagonally opposite location. When determining whether this incident occurs or not, count Intrigue instead of Paranoia.'
                }
            ]
        },
        {
            name: 'World End',
            effect: [
                {
                    type: 'Mandatory Loss condition: Protagonists Death',
                    prerequisite: 'In Normal world',
                    description: 'All characters die.'
                }
            ]
        },
        {
            name: 'World Convergence',
            effect: [
                {
                    description: 'Switch world to Normal world. The world cannot be switched for the remainder of this loop'
                }
            ]
        },
        {
            name: 'Small Force',
            effect: [
                {
                    description: 'The Protagonist Leader chooses any character and 1 Goodwill, or 1 Paranoia, or 1 Intrigue. Put one chosen counter on that character. When determining whether this incident occurs or not, the culprit is regarded as having Paranoia Limit -1.'
                }
            ]
        }
    ] as const satisfies readonly IncidentInternal[], 'name');
}

const i = new IncidentsHelper();

export function isIncidentName(name: string): name is IncidentName {
    return i.incidents[name as IncidentName] != undefined;
}

export const incidents = i.incidents;