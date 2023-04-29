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

    effect: readonly (OncePer<'game', void,
        {
            special?: string,
            description: string,
            prerequisite?: string,
        } |
        {
            type: AbilityTypeLose,
            special?: string,
            description?: string,
            prerequisite?: string,
        }
    >)[],
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
        ...data.incedents,

        {
            name: 'Crime of Passion',
            effect: [
                {
                    special: 'Paranoia Limit -1',
                    description: 'One ether character at the culprit’s location dies.'
                }
            ]
        },
        {
            name: 'Dimensional Distortion',
            effect: [
                {
                    special: 'Always triggers if culprit is alive',
                    description: 'Trigger a Warp.'
                }
            ]
        },
        {
            name: 'Dimensional Perversion',
            effect: [
                {
                    description: 'You may Trigger a warp. Place 2 Paranoia on any character, and 2 Goodwill an any other character.'
                }
            ]
        },
        {
            name: 'Dimensional Fracture',
            effect: [
                {
                    description: 'You may Trigger a warp. 3+ kinds of counters on the culprit.'
                },
                {
                    type: 'Mandatory Loss condition: Character Death',
                    prerequisite: '3+ kinds of counters on the culprit'
                }
            ]
        },
        {
            name: 'Left Behind',
            effect: [
                {
                    description: 'Place 1 Intrigue on a character at the culprit’s location, then move the culprit to any location.'
                },
            ]
        },
        {
            name: 'Phantasmal Incident',
            effect: [
                {
                    special: 'Triggers with Intrigue',
                    description: 'Reslove the effect of Crime of Passion, Dimensional Perverson or Left Behind.'
                },
            ]
        },
        {
            name: 'Last Will',
            effect: [
                {
                    description: 'The culprit dies. Protagonists gain Hope +1 at the start of next loop.'
                },
            ]
        },
        {
            name: 'The Singularity',
            effect: [
                {

                    prerequisite: 'In the Light World',
                    description: 'Trigger a Warp'
                },
                {
                    type: 'Mandatory Loss condition: Character Death',
                    timesPerGame: 1,
                    prerequisite: 'In the Light World',
                },
                {
                    type: 'Mandatory Loss condition: Character Death',
                    prerequisite: 'In the Dark World, and 1+ Intrigue on culprit’s starting location',
                },
            ]
        },

        {
            name: 'Seeping Daylight',
            effect: [
                {
                    description: 'The leader chooses a character. Place 1 Hope on that character.',

                },
            ]
        },

        {
            name: 'The Murk of Despair',
            effect: [
                {
                    description: 'Place 1 Despair on any character.',
                },
            ]
        },


    ] as const satisfies readonly IncidentInternal[], 'name');
}

const i = new IncidentsHelper();

export function isIncidentName(name: string): name is IncidentName {
    return i.incidents[name as IncidentName] != undefined;
}

export const incidents = i.incidents;