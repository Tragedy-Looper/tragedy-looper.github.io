import * as data from "../data";
import { toRecord, type RequireAtLeastOne } from "../misc";
import type { ScriptSpecified } from "./core";
import type { DoseNotTriggerIncident } from "./incidents";

export type AbilityType = AbilityTypeLose | AbilityTypeCreation | AbilityTypeDefault;
export type AbilityTypeLose = typeof loseTypes[number];
export type AbilityTypeCreation = 'Script creation';
export type AbilityTypeDefault = 'Optional' | 'Mandatory';

export const loseTypes = [
    'Mandatory Loss condition: Character Death',
    'Mandatory Loss condition: Character Death',
    'Optional Loss condition: Character Death',
    'Delayed Loss condition: Character Death',
    'Loss condition: Tragedy'
] as const;

export type timing = 'Always' | 'Day Start' | 'Day End' | 'Mastermind Ability' | 'Card resolve' | 'Loop End' | 'Loop Start'
    | 'Last Day' | 'First Day' | 'Last Loop' | 'First Loop' | 'Incident step' | 'Incident trigger' | 'On character death' | 'When this role is to be reveald'
    | 'Mastermind Action step' | 'Goodwill ablility step' | 'After Goodwill Ability used';


type RoleInternal = {
    name: string,
    max?: number,
    unkillable?: true,
    afterDeath?: true,
    goodwillRefusel?: 'Optional' | 'Mandatory' | 'Puppeted',
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
        name: 'Marionette',
        goodwillRefusel: 'Puppeted',
        abilities: [
            {
                type: 'Mandatory',
                timing: ['After Goodwill Ability used'],
                prerequisite: '2 or more kinds of counters',
                description: 'This Character Dies, and triggers Warp'
            }
        ]
    },

    {
        name: 'Storyteller',
        unkillable: true,

        abilities: [
            {
                type: 'Optional',
                timing: ['Mastermind Ability'],
                prerequisite: 'Extar Gauge 1+',
                description: 'Move a counter between two other characters at this location.'
            },
            {
                type: 'Mandatory',
                timing: ['Loop Start'],
                prerequisite: 'Extar Gauge was 3+ at the end of last loop',
                description: 'Protagonists gain +1 Hope.'
            },
        ]
    },
    {
        name: 'Lullaby',
        goodwillRefusel: 'Puppeted',
        abilities: [
            {
                type: 'Mandatory',
                timing: ['After Goodwill Ability used'],
                description: 'The Target(s) of that abilty Dies.'
            },
            {
                type: 'Optional',
                timing: ['Mastermind Ability'],
                timesPerLoop: 1,
                description: 'Place 1 Paranoia or 1 Goodwill on character at same location.'
            },
            {
                type: 'Optional Loss condition: Character Death',
                timing: ['Day End'],
                prerequisite: '4+ kinds of counter on this Character',
            },
        ]
    },
    {
        name: 'Shifter',
        unkillable: true,
        abilities: [
            {
                type: 'Mandatory',
                timing: ['Card resolve'],
                description: 'Ignore Forbid Goodwill on this Character.'
            },
            {
                type: 'Optional Loss condition: Character Death',
                timing: ['Day End', 'Last Day'],
                prerequisite: '+2 Kinds of counters on this character'
            },
        ]
    },
    {
        name: 'Fragment',

        abilities: [
            {
                type: 'Mandatory',
                timing: ['Loop Start'],
                prerequisite: 'This Character was dead at the end of last loop',
                description: 'Mastermind gets +1 Despair.'
            },
            {
                type: 'Mandatory',
                timing: ['Loop Start'],
                prerequisite: 'This Character was alive and head +2 Goodwill',
                description: 'Proagonists gets +1 Hope.'
            },
        ]
    },
    {
        name: 'Pied Piper',
        goodwillRefusel: 'Optional',
        abilities: [
            {
                type: 'Mandatory',
                timing: ['Day End'],
                timesPerLoop: 1,
                prerequisite: 'The Extra Gauge is 2+',
                description: 'A Character at the same Location dies.'
            },
            {
                type: 'Optional',
                timing: ['Day End'],
                prerequisite: 'Extra Gauge is 2+',
                description: 'Place 1 Intrgue on a corpse at same location.'
            },
            {
                type: 'Mandatory Loss condition: Character Death',
                timing: ['Day End'],
                prerequisite: 'When previobus Ability was used and 3+ total intrigue on all corpses',
            },
        ]
    },
    {
        name: 'Gossip',
        max: 1,
        abilities: [
            {
                type: 'Optional',
                timing: ['Mastermind Ability'],
                description: 'Place 1 Goodwil on character at same location.'
            },
            {
                type: 'Mandatory',
                timing: ['On character death'],
                description: 'Place 1 Despair on character at same location. You may trigger Warp.'
            },
        ]
    },
    {
        name: 'Alice',
        abilities: [
            {
                type: 'Loss condition: Tragedy',
                timing: ['Loop End'],
                prerequisite: 'This character is dead'
            },
            {
                type: 'Mandatory',
                timing: ['After Goodwill Ability used'],
                timesPerLoop: 1,
                prerequisite: 'Extra Gauge is 1+',
                description: 'Place 1 Hope on each other character at same location.'
            },
        ]
    },


] as const satisfies readonly RoleInternal[], 'name');

export const roles = rolesInternal as Record<RoleName, RoleInternal & { name: RoleName }>;


export function isRoleName(name: string): name is RoleName {
    return name in rolesInternal;
}


