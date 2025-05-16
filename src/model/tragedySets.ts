import * as data from "../data";
import { distinct, keys, toRecord } from "../misc"
import { isOption, type Options } from "./core";
import type { IncidentName } from "./incidents"
import { plots, type PlotName } from "./plots"
import { isRoleName, type RoleName } from "./roles";

export type TragedySet = TragedySets[keyof TragedySets];
export type TragedySets = typeof tragedySets;
type TragedySetInternal = {
    name: string,
    mainPlots: readonly PlotName[]
    subPlots: readonly PlotName[]
    aditionalRoles?: readonly RoleName[],
    numberOfMainPlots: number,
    numberOfSubPlots: number,
    incidents: readonly IncidentName[],
    extraRules: readonly {
        name: string,
        description: string
    }[],
} & CastOptions

export type TragedySetName = TragedySet['name'];


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


export function getTragedySetRoles(tg: TragedySet) {

    const plotRoles = [...tg.mainPlots, ...tg.subPlots].flatMap(x => keys(plots[x].roles));
    const additionalRoles = hasAdditonalRoles(tg) ? tg.aditionalRoles : [];

    return distinct([...plotRoles, ...additionalRoles]);

}



export const tragedySets = toRecord([

    ...data.tragedys,
    {
        name: 'Another Horizon',
        mainPlots: ['Lost Heart', 'Shadow Demon King', 'The Devil’s Will', 'Parallel World War', 'Alien Erosion','Into Nothingness','Jekyll and Hyde','Through the Looking-Glass',],
        subPlots: ['The World of Dollhouse', 'Ego Wave', 'The Closed Door', 'Threads of Fate', 'Moonside City', 'Fanatic Fox', 'Somthing to invite'],
        incidents: [
            'Insane Murder',
            'Increasing Unease',
            'Missing Person',
            'Hospital Incident',
            'Drifting to Another World',
            'Assassination',
            'World End',
            'World Convergence',
            'Small Force',
            'Breakthrough',
            'Confession',
        ],
        aditionalRoles: ['Shadow'],
        numberOfMainPlots: 1,
        numberOfSubPlots: 2,
        extraRules: [
            {
                name: 'World Switch',
                description: 'Protagonist Leader may request to switch the world during the Day Start'
            },
            {
                name: 'Extra Gauge',
                description: 'Indicate World, 1: Normal and intial World, 2: Abnormal World.'
            },
            {
                name: 'Abnormal World',
                description: 'The numbers of Goodwill counter need to reach Paranoia Limit to trigger the incident. Also sufficient numbers of Paranoia needed to activate the character’s Goodwill ability.'
            },
            {
                name: 'Goodwill Outburst',
                description: 'Mastermind able to use the character’s Goodwill abilities whose role has Goodwill Outburst.'
            },
        ]
    }
] as const satisfies readonly TragedySetInternal[], 'name');




export function isTragedySetName(name: string): name is TragedySetName {
    return name in tragedySets;
}
