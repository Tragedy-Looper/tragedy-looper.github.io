import type { RequiredKeys } from "utility-types";
import type { RequireAtLeastOne } from "../misc";
import type { CharacterName, Characters, LocationName } from "./characters";
import type { IncidentName, Incidents } from "./incidents";
import type { PlotName, Plots } from "./plots";
import type { RoleName, Roles } from "./roles";
import type { Plot } from "../plots.g";


type SpecificationType = 'location' | 'incident' | 'role in tragedy set' | 'role not in plot' | 'role in plot' | 'character' | 'plot' | 'number' | 'text' | readonly string[];

export type Option = Exclude<Plot['scriptSpecified'], undefined>[number];;

export type Options = readonly Option[];

export function isOption(params: unknown): params is Required<Option> {
    return params !== undefined && params !== null && typeof params == 'object' && 'id' in params && 'type' in params;
}
export type ScriptSpecified = { scriptSpecified?: Options };

export function isScriptSpecified<T>(params: T): params is T & Required<ScriptSpecified> {
    return (params as { scriptSpecified?: true })?.scriptSpecified ?? false;
}


export type WithScriptSpecification<Type extends 'role' | 'character' | 'incident' | 'plot', Key extends NameDefinition<Type> = NameDefinition<Type>, AlwaysOptions extends Options = []> =
    ToSpecificationTuple<Type, Extended<Type, Key>, ToSpecificationObject<AlwaysOptions>>
    | (RequiredKeys<ToSpecificationObject<AlwaysOptions>> extends never ? NotExtended<Type, Key> : never)
    | (ToSpecificationObject<AlwaysOptions> extends Record<string, never> ? never : ToSpecificationTuple<Type, NotExtended<Type, Key>, RequireAtLeastOne<ToSpecificationObject<AlwaysOptions>>>)
    ;
;


export type DefinitionRecord<Key extends 'role' | 'character' | 'incident' | 'plot', Value extends 'role' | 'character' | 'incident' | 'plot', KeysKeys extends NameDefinition<Key> = NameDefinition<Key>, ValueKeys extends NameDefinition<Value> = NameDefinition<Value>, optional extends boolean = true, AlwaysOptions extends Options = []> =
    optional extends true
    ? {
        [k in KeysKeys]?: Def<Value, ValueKeys, Key, k, AlwaysOptions>
    } : {
        [k in KeysKeys]: Def<Value, ValueKeys, Key, k, AlwaysOptions>
    };



type NameDefinition<Type extends 'role' | 'character' | 'incident' | 'plot' | void> =
    Type extends 'role'
    ? RoleName
    : Type extends 'character'
    ? CharacterName
    : Type extends 'incident'
    ? IncidentName
    : Type extends 'plot'
    ? PlotName
    : never
    ;

type InstancesDefinition<Type extends 'role' | 'character' | 'incident' | 'plot' | void> =
    Type extends 'role'
    ? Roles
    : Type extends 'character'
    ? Characters
    : Type extends 'incident'
    ? Incidents
    : Type extends 'plot'
    ? Plots
    : never
    ;


type NotExtended<Type extends 'role' | 'character' | 'incident' | 'plot', Keys extends NameDefinition<Type>> =

    Type extends 'role'
    ? Keys extends NameDefinition<'role'>
    ? Roles[Keys] extends Required<ScriptSpecified> ? never : Roles[Keys]['id']
    : never

    : Type extends 'character'
    ? Keys extends NameDefinition<'character'>
    ? Characters[Keys] extends Required<ScriptSpecified> ? never : Characters[Keys]['id']
    : never

    : Type extends 'incident'
    ? Keys extends NameDefinition<'incident'>
    ? Incidents[Keys] extends Required<ScriptSpecified> ? never : Incidents[Keys]['id']
    : never


    : Type extends 'plot'
    ? Keys extends NameDefinition<'plot'>
    ? Plots[Keys] extends Required<ScriptSpecified> ? never : Plots[Keys]['id']
    : never
    : never
    ;

type Extended<Type extends 'role' | 'character' | 'incident' | 'plot', Keys extends NameDefinition<Type>> =

    Type extends 'role'
    ? Keys extends NameDefinition<'role'>
    ? Roles[Keys] extends Required<ScriptSpecified> ? Roles[Keys]['id'] : never
    : never

    : Type extends 'character'
    ? Keys extends NameDefinition<'character'>
    ? Characters[Keys] extends Required<ScriptSpecified> ? Characters[Keys]['id'] : never
    : never

    : Type extends 'incident'
    ? Keys extends NameDefinition<'incident'>
    ? Incidents[Keys] extends Required<ScriptSpecified> ? Incidents[Keys]['id'] : never
    : never


    : Type extends 'plot'
    ? Keys extends NameDefinition<'plot'>
    ? Plots[Keys] extends Required<ScriptSpecified> ? Plots[Keys]['id'] : never
    : never
    : never
    ;



type typeLookup<x> =
    x extends 'location'
    ? LocationName
    : x extends 'incident'
    ? IncidentName
    : x extends 'role'
    ? RoleName
    : x extends 'character'
    ? CharacterName
    : x extends 'plot'
    ? PlotName
    : x extends 'number'
    ? number
    : x extends 'text'
    ? string
    : x extends readonly string[]
    ? x[number]
    : never;




type ToSpecification<Type extends 'role' | 'character' | 'incident' | 'plot', T> =
    T extends keyof InstancesDefinition<Type>
    ? InstancesDefinition<Type>[T] extends Required<ScriptSpecified>
    ? ToSpecificationObject<InstancesDefinition<Type>[T]['scriptSpecified'][number]>
    : never
    : never
    ;




type ToSpecificationTuple<Type extends 'role' | 'character' | 'incident' | 'plot', T, AdditionalArguments extends object> =
    T extends keyof InstancesDefinition<Type>
    ? InstancesDefinition<Type>[T] extends Required<ScriptSpecified>
    ? readonly [T, ToSpecificationObject<InstancesDefinition<Type>[T]['scriptSpecified'][number]> & (AdditionalArguments extends Record<string, never> ? object : AdditionalArguments)]
    : AdditionalArguments extends Record<string, never> ? never : readonly [T, AdditionalArguments]
    : never
    ;


type Def<Type extends 'role' | 'character' | 'incident' | 'plot', Key extends NameDefinition<Type>, OtherType extends 'role' | 'character' | 'incident' | 'plot', OtherKey extends NameDefinition<OtherType>, AlwaysOptions extends Options = []> =
    isSpecified<OtherType, OtherKey> extends true
    ? ToSpecificationTuple<Type, Key, ToSpecification<OtherType, OtherKey> & (ToSpecificationObject<AlwaysOptions> extends Record<string, never> ? object : ToSpecificationObject<AlwaysOptions>)>
    : WithScriptSpecification<Type, Key, AlwaysOptions>;
;

type ToSpecificationObject<T> =
    T extends readonly [] ? Record<string, never>
    : T extends readonly any[] ? ToSpecificationObject<T[number]>

    : T extends { name: infer TName, type: infer type, optional: true }
    ? TName extends string
    ? type extends SpecificationType
    // ? T extends { 'scriptSpecified': infer K } ? mapArray<K>
    ? { [z in TName]?: typeLookup<type> }
    : Record<string, never>
    : Record<string, never>


    : T extends { name: infer TName, type: infer type }
    ? TName extends string
    ? type extends SpecificationType
    // ? T extends { 'scriptSpecified': infer K } ? mapArray<K>
    ? { [z in TName]: typeLookup<type> }
    : Record<string, never>
    : Record<string, never>
    : Record<string, never>

    ;






type isSpecified<Type extends 'role' | 'character' | 'incident' | 'plot', Id extends NameDefinition<Type>> =
    Type extends 'character'
    ? Id extends NameDefinition<'character'>
    ? Characters[Id] extends { 'scriptSpecified': any }
    ? true

    : false
    : false
    : false
    ;

// const xx: isSpecifiedAny<[['character','Boy Student'], ['role', "Person"]]>
























// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Alien'> =
//         'Brain';
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Godly Being'> =
//         ['Brain', { "enters on loop": 3 }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Godly Being'> =
//         ['Boy Student', { "enters on loop": 3 }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boy Student'> =
//         ['Godly Being', { "enters on loop": 3 }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boss'> =
//         ['Godly Being', { "enters on loop": 3, 'Turf': 'City' }] as const;
//     xxx124.toString();
// }


// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Alien', [{ name: 'testName', type: 'location', optional: true }]> =
//         'Brain';
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Godly Being', [{ name: 'testName', type: 'location', optional: true }]> =
//         ['Brain', { "enters on loop": 3 }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Godly Being', [{ name: 'testName', type: 'location', optional: true }]> =
//         ['Boy Student', { "enters on loop": 3 }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boy Student', [{ name: 'testName', type: 'location', optional: true }]> =
//         ['Godly Being', { "enters on loop": 3 }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boss', [{ name: 'testName', type: 'location', optional: true }]> =
//         ['Godly Being', { "enters on loop": 3, 'Turf': 'City' }] as const;
//     xxx124.toString();
// }

// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Alien', [{ name: 'testName', type: 'location', optional: true }]> =
//         ['Brain', { testName: 'School' }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Godly Being', [{ name: 'testName', type: 'location', optional: true }]> =
//         ['Brain', { "enters on loop": 3, testName: 'School' }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Godly Being', [{ name: 'testName', type: 'location', optional: true }]> =
//         ['Boy Student', { "enters on loop": 3, testName: 'School' }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boy Student', [{ name: 'testName', type: 'location', optional: true }]> =
//         ['Godly Being', { "enters on loop": 3, testName: 'School' }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boss', [{ name: 'testName', type: 'location', optional: true }]> =
//         ['Godly Being', { "enters on loop": 3, 'Turf': 'City', testName: 'School' }] as const;
//     xxx124.toString();
// }

// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Alien', [{ name: 'testName', type: 'location' }]> =
//         ['Brain', { testName: 'School' }];
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Godly Being', [{ name: 'testName', type: 'location' }]> =
//         ['Brain', { "enters on loop": 3, testName: 'School' }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Godly Being', [{ name: 'testName', type: 'location' }]> =
//         ['Boy Student', { "enters on loop": 3, testName: 'School' }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boy Student', [{ name: 'testName', type: 'location' }]> =
//         ['Godly Being', { "enters on loop": 3, testName: 'School' }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boss', [{ name: 'testName', type: 'location' }]> =
//         ['Godly Being', { "enters on loop": 3, 'Turf': 'City', testName: 'School' }] as const;
//     xxx124.toString();
// }


// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Alien', [{ name: 'testName', type: 'location' }]> =
//         'Brain';
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'role', NameDefinition<'role'>, 'character', 'Godly Being', [{ name: 'testName', type: 'location' }]> =
//         ['Brain', { "enters on loop": 3 }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Godly Being', [{ name: 'testName', type: 'location' }]> =
//         ['Boy Student', { "enters on loop": 3 }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boy Student', [{ name: 'testName', type: 'location' }]> =
//         ['Godly Being', { "enters on loop": 3 }] as const;
//     xxx124.toString();
// }
// {
//     const xxx124: Def<'character', NameDefinition<'character'>, 'character', 'Boss', [{ name: 'testName', type: 'location' }]> =
//         ['Godly Being', { "enters on loop": 3, 'Turf': 'City' }] as const;
//     xxx124.toString();
// }

