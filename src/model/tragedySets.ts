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
        mainPlots: [
            'The Forbidden Future',
            'Fairy-Tale Murderer',
            'Mother Goose Mystery',
            'Dimensional Merger',
            'Into Nothingness',

        ],
        subPlots: [
            'Jekyll and Hyde',
            'The Plaguebringer',
            'Puppeteer’s Strings',
            'Throguh the Looking-Glass',
            'Crossing World Lines',
            'Unspeakable Horrors',
            'Hysteria Virus',
        ],
        incidents: [
            'Crime of Passion',
            'Dimensional Distortion',
            'Dimensional Perversion',
            'Dimensional Fracture',
            'Left Behind',
            'Phantasmal Incident',
            'Hospital Incident',
            'Last Will',
            'The Singularity',
            'Seeping Daylight',
            'The Murk of Despair',
        ],
        numberOfMainPlots: 1,
        numberOfSubPlots: 2,
        extraRules: [
            {
                name: 'Extra Gauge',
                description: 'At the Start of each loop set the gauge to 0. While even the Players are in the Light World; while odd, the players are in the Dark World.'
            },
            {
                name: 'Warp',
                description: 'If a Warp is triggered on a day increase the Extra Gauge by 1. Increase happens before Mandatory effects on day End. Multiple Warps in one day only increase the Extra Gage by 1. The Mastermind may not say when a Warp happens, if the loop ends before the day end, nothing happens.'
            },
            {
                name: 'Abilities and Warping',
                description: 'In addition to effects that trigger a Warp, a Warp is automatically triggered after each time any player, Protagonist or Mastermind, uses a 1x∞ Goodwill ability.'
            },
            {
                name: 'Change of Heart',
                description: 'In the Dark World, Incidents are Triggered by Goodwill, and Goodwill abilitys need Paranoia.'
            },
            {
                name: 'Puppeted Goodwill Refusal',
                description: 'Puppeted Goodwill Refusal is a new form of Goodwill Refusal. In addition to providing the basic effect of Goodwill Refusal, the Mastermind may use the Goodwill abilities of a character with Puppeted Goodwill Refusal during the Mastermind abilities phase, provided that there are sufficient counters on that character. When they do, they must announce what ability is being used, and any targets that ability has, if applicable.'
            },
            {
                name: 'Dual Roles',
                description: 'Some Plots add a Dual Role such as “L: Obstinate / D: Key Person”. On the Mastermind’s script card, that Dual Role should be assigned in full to a single character. In this example, that character is an Obstinate while in the Light World, and a Key Person while in the Dark World. Both parts of a Dual Role must be correctly identified to count as successful for the Final Guess. Dual Roles ignore Role maxima and other restrictions on assigning Roles. For example, the Little Sister can be assigned “L: Key Person / D: Brain” despite the Brain having Goodwill Refusal.'
            },
        ]
    }
] as const satisfies readonly TragedySetInternal[], 'name');




export function isTragedySetName(name: string): name is TragedySetName {
    return name in tragedySets;
}
