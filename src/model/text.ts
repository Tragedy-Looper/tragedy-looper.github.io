import type { LocationName } from "./characters";
import type { RoleName } from "./roles";



export type Text = string;

type PlaceholderType = 'location' | 'token' | 'number' | '';
type Amount = number | readonly [number, number];
type Where = LocationName | 'this location' | 'neigboring location' | 'diagonal location'
    ;


type Target = TargetSingel
    | readonly ['All', ...(readonly TargetSingel[])]
    | readonly ['OneOf', ...(readonly TargetSingel[])]

    ;
type TargetCharacte = RoleName
    | 'this Character'
    | 'paniced Character'
    | readonly ['Character at', Where]
    ;
type TargetSingel = Where
    | TargetCharacte;

type TokenType = 'Parnoia' | 'Intrigde' | 'Goodwill'

    ;

type Action = readonly ['Place Token', TokenType, Amount, Target]
    | readonly ['Kill', TokenType, Amount, Target]

    ;

type placeHolder = readonly [string, ...(readonly PlaceholderType[])]