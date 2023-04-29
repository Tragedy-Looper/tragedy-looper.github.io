import type { RequiredKeys } from "utility-types";
import type { ExactlyOne, RequireAtLeastOne, Union } from "../misc";
import type { CharacterName, Characters, CharactersMultipleStartLocations, CharactersSwitchingStartLocation, LocationName } from "./characters";
import type { IncidentName, Incidents } from "./incidents";
import type { PlotName, Plots } from "./plots";
import type { RoleName, Roles } from "./roles";


type SpecificationType = 'location' | 'incident' | 'role' | 'character' | 'plot' | 'number' | 'text' | readonly string[];

export type Option = {
    name: string;
    type: SpecificationType;
    optional?: true;
};

export type Options = readonly Option[];

export function isOption(params: unknown): params is Required<Option> {
    return params !== undefined && params !== null && typeof params == 'object' && 'name' in params && 'type' in params;
}
export type ScriptSpecified = { scriptSpecified?: Options };

export function isScriptSpecified<T>(params: T): params is T & Required<ScriptSpecified> {
    return (params as { scriptSpecified?: true })?.scriptSpecified ?? false;
}



export type DefinitionPlotRolesRecord<Plot extends PlotName, C extends CharacterName, AlwaysOptions extends Options = []> =
    {
        [r in keyof Plots[Plot]['roles']]:
        r extends RoleName
        ? Def2<r, Plot, C, AlwaysOptions>
        : never
    };

type Def2<Role extends RoleName, P extends PlotName, C extends CharacterName, AlwaysOptions extends Options = []> =
    hasValues<AdditonalParameter<'role', Role>> extends true
    ? ToSpecificationTuple2<C, P, AdditonalParameter<'role', Role> & (hasValues<ToSpecificationObject<AlwaysOptions>> extends true ? ToSpecificationObject<AlwaysOptions> : object)>
    : ToSpecificationTuple2<C, P, ToSpecificationObject<AlwaysOptions>> //WithScriptSpecification<Type, Key, AlwaysOptions>;
    ;


type ToSpecificationTuple2<C extends CharacterName, P extends PlotName, AdditionalArguments extends object> =
    //   T extends keyof InstancesDefinition<Type>
    // ? hasValues<AdditonalParameter<Type, T>> extends true
    // ?
    ExactlyOne<
        {
            [k in C]: P extends 
            ? AdditonalParameter<'character', k> & (hasValues<AdditionalArguments> extends false ? object : AdditionalArguments)
        }
    >
    // : never
    // : hasValues<AdditionalArguments> extends false ? T : { [k in T]: AdditionalArguments }
    // : "{}"
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
    : {}
    : {}
    ;



const xxxx: ToSpecificationTuple<'character', 'Godly Being' | 'Henchman' | 'Alien', { foo: string }> = {
    Henchman: {
        "Start Location": 'City',
        foo: 'ires'
    },
    "Godly Being": {
        'enters on loop': 3,
        foo: ''
    }

};


type xx<Type extends 'role' | 'character' | 'incident' | 'plot', T extends NameDefinition<Type>, AdditionalArguments extends object> =
    ExactlyOne<
        {
            [k in T]: AdditonalParameter<Type, k> & (hasValues<AdditionalArguments> extends false ? object : AdditionalArguments)

        }
    >

    ;
;
type NumberCharacters<R extends RoleName, P extends PlotName> =
    R extends keyof Plots[P]['roles']
    ? Plots[P]['roles'][R] extends number
    ? [Plots[P]['roles'][R], Plots[P]['roles'][R]]
    : Plots[P]['roles'][R] extends readonly [number, number]
    ? Plots[P]['roles'][R]
    : [0, 0]
    : [0, 0]
    ;


type ToSpecificationTuple<Type extends 'role' | 'character' | 'incident' | 'plot', T extends NameDefinition<Type>, AdditionalArguments extends object> =
    //   T extends keyof InstancesDefinition<Type>
    // ? hasValues<AdditonalParameter<Type, T>> extends true
    // ?
    ExactlyOne<
        {
            [k in T]: AdditonalParameter<Type, k> & (hasValues<AdditionalArguments> extends false ? object : AdditionalArguments)
        }
    >
    // : never
    // : hasValues<AdditionalArguments> extends false ? T : { [k in T]: AdditionalArguments }
    // : "{}"
    ;


type AdditonalParameter<Type extends 'role' | 'character' | 'incident' | 'plot', T> =
    (Type extends 'character'
        ? T extends CharactersMultipleStartLocations
        ? T extends CharactersSwitchingStartLocation
        ? { "Start Location": LocationName | 'Decide per Loop' }
        : { "Start Location": LocationName }

        : {}
        : {})
    & ToSpecification<Type, T>


    ;



type hasValues<T> = T extends Record<string, never> ? false : true;

type Def<Type extends 'role' | 'character' | 'incident' | 'plot', Key extends NameDefinition<Type>, OtherType extends 'role' | 'character' | 'incident' | 'plot', OtherKey extends NameDefinition<OtherType>, AlwaysOptions extends Options = []> =
    hasValues<AdditonalParameter<OtherType, OtherKey>> extends true
    ? ToSpecificationTuple<Type, Key, AdditonalParameter<OtherType, OtherKey> & (hasValues<ToSpecificationObject<AlwaysOptions>> extends true ? ToSpecificationObject<AlwaysOptions> : object)>
    : ToSpecificationTuple<Type, Key, ToSpecificationObject<AlwaysOptions>> //WithScriptSpecification<Type, Key, AlwaysOptions>;
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

