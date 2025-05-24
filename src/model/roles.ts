import * as data from "../data";
import { toRecord, type RequireAtLeastOne } from "../misc";
import type { ScriptSpecified } from "./core";
import type { DoseNotTriggerIncident } from "./incidents";
import type { Role, Roles as RoleType } from '../roles.g'

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


// export type RoleInternal = {
//     name: string,
//     max?: number,
//     Immortal?: true,
//     afterDeath?: true,
//     goodwillOutburst?: true,
//     goodwillRefusel?: 'Optional' | 'Mandatory'|'Puppeted',
//     abilities: readonly Abilitie<{ 'Over all Roles'?: true }>[]
// } & ScriptSpecified & DoseNotTriggerIncident;




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




export const rolesInternal = toRecord([
    ...data.roles,
], 'name');

export type RoleName = keyof typeof rolesInternal | `${keyof typeof rolesInternal}|${keyof typeof rolesInternal}`;




export const roles = rolesInternal as Record<RoleName, Role & { name: RoleName }>;


export function isRoleName(name: string): name is RoleName {
    const spited = name.split('|');
    return spited.every(x => x in rolesInternal);
}


