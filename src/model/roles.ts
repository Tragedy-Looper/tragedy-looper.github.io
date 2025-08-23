import * as data from "../data";
import { toRecord, type RequireAtLeastOne } from "../misc";
import type { ScriptSpecified } from "./core";
import type { DoseNotTriggerIncident } from "./incidents";
import type { Role, Roles as RoleType } from '../roles.g'
import type { Character } from "../characters.g";
import type { timing as TimingType } from '../../scripts/generateTragedysSchema'

export type AbilityType = Abilitie['type'];

export const loseTypes = [
    'Mandatory Loss condition: Protagonists Death',
    'Mandatory Loss condition: Protagonists Death',
    'Optional Loss condition: Protagonists Death',
    'Delayed Loss condition: Protagonists Death',
    'Loss condition: Tragedy'
] as const;

export type timing = typeof TimingType[number];


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

export type Abilitie = Exclude<Character['abilities'], undefined>[number]
    | Exclude<Role['abilities'], undefined>[number];
// export type Abilitie<Constraints extends object | void = void> = OncePer<'Loop' | 'day', Constraints, {
//     description: string,
//     prerequisite?: string,
//     type: AbilityTypeDefault,
//     // timesPerLoop?: Constraints extends void ? number : number | readonly [number, RequireAtLeastOne<Constraints>],
//     // timesPerDay?: Constraints extends void ? number : number | readonly [number, RequireAtLeastOne<Constraints>],
//     timing: readonly (timing)[]
// } | {
//     description?: string,
//     prerequisite: string,
//     type: AbilityTypeLose,
//     // timesPerLoop?: Constraints extends void ? number : number | readonly [number, RequireAtLeastOne<Constraints>],
//     // timesPerDay?: Constraints extends void ? number : number | readonly [number, RequireAtLeastOne<Constraints>],
//     timing: readonly (timing)[]
// }> | {
//     description: string,
//     type: AbilityTypeCreation,
// }




export type RoleNameSingle = keyof typeof data.rolesLookup;
export type RoleNameDouble = `${RoleNameSingle}|${RoleNameSingle}`;

export type RoleName = RoleNameSingle | RoleNameDouble;



export function singleRolenames(role: RoleName | undefined): RoleNameSingle[] {
    if (undefined === role) {
        return [];
    }
    const spited = role.split('|');
    if (spited.length === 1) {
        return [role as RoleNameSingle];
    } else if (spited.length === 2) {
        return spited as RoleNameSingle[];
    } else {
        throw new Error(`Invalid role name: ${role}`);
    }
}


export function isRoleName(name: unknown): name is RoleName {
    if (typeof name !== 'string' || name.length === 0) {
        return false;
    }
    const spited = name.split('|');
    return spited.length <= 2 && spited.every(x => x in data.rolesLookup);
}


