import * as data from "../data";
import { toRecord, type RequireAtLeastOne } from "../misc";
import type { ScriptSpecified } from "./core";
import type { DoseNotTriggerIncident } from "./incidents";

export type AbilityType = AbilityTypeLose | AbilityTypeCreation | AbilityTypeDefault;
export type AbilityTypeLose = typeof loseTypes[number];
export type AbilityTypeCreation = 'Script creation';
export type AbilityTypeDefault = 'Optional' | 'Mandatory';

export const loseTypes = [
    'Mandatory Loss condition: Protagonists Death',
    'Mandatory Loss condition: Protagonists Death',
    'Optional Loss condition: Protagonists Death',
    'Delayed Loss condition: Protagonists Death',
    'Loss condition: Tragedy'
] as const;

export type timing = 'Always' | 'Day Start' | 'Day End' | 'Mastermind Ability' | 'Card resolve' | 'Loop End' | 'Loop Start'
    | 'Last Day' | 'First Day' | 'Incident step' | 'Incident trigger' | 'On character death' | 'When this role is to be reveald'
    | 'Mastermind Action step' | 'Goodwill ablility step' | 'After Goodwill Ability used';


type RoleInternal = {
    name: string,
    max?: number,
    unkillable?: true,
    afterDeath?: true,
    goodwillOutburst?: true,
    goodwillRefusel?: 'Optional' | 'Mandatory',
    abilities: readonly Abilitie<{ 'Over all Roles'?: true }>[]
} & ScriptSpecified & DoseNotTriggerIncident;

export type OncePer<Text extends string, Constraints extends object | void = void, T = object> = T &
    {
        [k in `timesPer${Capitalize<Text>}`]?: Constraints extends void ? number : number | readonly [number, RequireAtLeastOne<Constraints>]
    };

export type Abilitie<Constraints extends object | void = void> = OncePer<'Loop' | 'day', Constraints, {
    description: string,
    prerequisite?: string,
    type: AbilityTypeDefault,
    // timesPerLoop?: Constraints extends void ? number : number | readonly [number, RequireAtLeastOne<Constraints>],
    // timesPerDay?: Constraints extends void ? number : number | readonly [number, RequireAtLeastOne<Constraints>],
    timing: readonly (timing)[]
} | {
    description?: string,
    prerequisite: string,
    type: AbilityTypeLose,
    // timesPerLoop?: Constraints extends void ? number : number | readonly [number, RequireAtLeastOne<Constraints>],
    // timesPerDay?: Constraints extends void ? number : number | readonly [number, RequireAtLeastOne<Constraints>],
    timing: readonly (timing)[]
}> | {
    description: string,
    type: AbilityTypeCreation,
}

export type Role = Roles[keyof Roles];
export type Roles = typeof rolesInternal;
export type RoleName = Role['name'];



export const rolesInternal = toRecord([

    ...data.roles,

    {
        name: 'Agent',
        abilities: [
            {
                type: 'Loss condition: Tragedy',
                timing: ['On character death'],
                prerequisite: ''
            },
            {
                type: 'Mandatory',
                timing: ['After Goodwill Ability used'],
                description: 'Remove 1 Intrigue in this Location or on any character in this Location'
            },
        ]
    },
    {
        name: 'Invader',
        goodwillRefusel: 'Optional',
        abilities: [
            {
                type: 'Optional',
                timing: ['Mastermind Ability'],
                description: 'If there are at least 2 Intrigue in this location: Switch the world.'
            },
        ]
    },
    {
        name: 'Twilight',
        goodwillRefusel: 'Optional',
        goodwillOutburst: true,
        unkillable: true,
        abilities: [
            {
                type: 'Mandatory',
                timing: ['Always'],
                description: 'If there are at least 2 Intrigue in this location: Switch the world.'
            },
        ]
    },
    {
        name: 'Hider',
        goodwillRefusel: 'Mandatory',
        scriptSpecified: [
            {
                name: 'world',
                type: ['abnormal', 'normal'],
            }
        ],
        abilities: [
            {
                type: 'Loss condition: Tragedy',
                timing: ['Loop End'],
                prerequisite: 'This character has at least 1 Intrigue'
            },
        ]
    },
    {
        name: 'Quidnunc',
        abilities: [
            {
                type: 'Optional',
                timing: ['Mastermind Ability'],
                description: 'You may place 1 Goodwill on any character in this location.'
            },
        ]
    },
    {
        name: 'Fanatic',
        goodwillOutburst: true,
        abilities: [
            {
                type: 'Mandatory',
                timing: ['After Goodwill Ability used'],
                description: 'Choose any character in this location and kill it.'
            },
        ]
    },
    {
        name: 'Animus',
        scriptSpecified: [
            {
                name: 'world',
                type: ['abnormal', 'normal'],
            }
        ],
        abilities: [
            {
                type: 'Mandatory',
                timing: ['Always'],
                description: 'The sex of this character is reversed.'
            },
            {
                type: 'Mandatory',
                timing: ['Incident step'],
                description: 'This character always triggers its incidents (if alive), regardless the amount of Paranoia on it. After resolving the Incident, the Mastermind declared that “Animus abilities were used.”.'
            },
        ]
    },
    {
        name: 'Neurosis',
        goodwillRefusel: 'Mandatory',
        abilities: [
            {
                type: 'Mandatory',
                timing: ['Incident step'],
                description: 'When determining whether an Incident, for which this character is the culprit, will occur or not, this character is regarded as having Paranoia Limit -1.'
            },
        ]
    },
    {
        name: 'Agitator',
        abilities: [
            {
                type: 'Optional',
                timing: ['Incident trigger'],
                prerequisite: 'This Character resolved an incident',
                description: 'Put 1 Goodwill, or 1 Paranoia, or 1 Intrigue on any character in this location.'
            },
        ]
    },
    {
        name: 'Enchanter',
        goodwillOutburst: true,
        abilities: [
            {
                type: 'Optional',
                timing: ['After Goodwill Ability used'],
                description: 'The Mastermind may declare that “Enchanter‘s abilities were used.” If you do, the next day Leader are prohibited from switching the world and setting action cards.'
            },
        ]
    },
    {
        name: 'Marionette',
        goodwillOutburst: true,
        abilities: [
            {
                type: 'Delayed Loss condition: Protagonists Death',
                timing: ['After Goodwill Ability used'],
                prerequisite: '',
                description: '(optional) The protagonists die during the Day end.'
            },
        ]
    },
    {
        name: 'Shadow',
        goodwillRefusel: "Mandatory",
        abilities: [
            {
                type: 'Delayed Loss condition: Protagonists Death',
                timing: ['Incident trigger'],
                prerequisite: 'This Character resolves an incident',
                description: '(optional) The protagonists die during the Day end.'
            },
        ]
    },

] as const satisfies readonly RoleInternal[], 'name');

export const roles = rolesInternal as Record<RoleName, RoleInternal & { name: RoleName }>;


export function isRoleName(name: string): name is RoleName {
    return name in rolesInternal;
}


