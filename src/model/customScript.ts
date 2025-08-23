import { writable, type Readable, type Writable, derived, type Unsubscriber, type Subscriber, get } from "svelte/store";
import { type TragedySetName, getTragedySetRoles, hasCastOption } from "./tragedySets";
import { keys, require } from "../misc";
import { type PlotName } from "./plots";
import { type RoleName, type RoleNameSingle, isRoleName, singleRolenames } from "./roles";
import { isCharacterPlotless, type CharacterName, locations, type LocationName } from "./characters";
import { isScriptSpecified, type Option } from "./core";
import { type IncidentName, isFakeIncident, isMobIncident, isRepeatedCulpritIncident } from "./incidents";
import type { Script } from "../scripts.g";
import { charactersLookup, incidentsLookup, isCharacterId, plotsLookup, rolesLookup, tragedysLookup } from "../data";
import type { Tragedy } from "../tragedys.g";


const noop = () => { };


function generateIncidents<TCharacters extends CharacterName>(script: CustomScript, maxDays: Readable<number>, availableIncidents: Readable<readonly IncidentName[]>, availableCharacters: Readable<readonly TCharacters[]>): ICustomScriptIncidentSelectionGroup<TCharacters> {
    const result = new CustomScriptIncidentSelectionGroup(script, maxDays, availableIncidents, availableCharacters);
    result.Init()
    return result;
}


export interface ICustomScriptIncidentSelectionGroup<TCharacters extends CharacterName> {
    readonly selectors: Readable<ICustomScriptIncidentSelection<TCharacters>[]>;
    readonly script: CustomScript;

}
class CustomScriptIncidentSelectionGroup<TCharacters extends CharacterName> implements ICustomScriptIncidentSelectionGroup<TCharacters> {

    public readonly script: CustomScript;
    public readonly selectors: Readable<CustomScriptIncidentSelection<TCharacters>[]>;


    constructor(script: CustomScript, maxDays: Readable<number>, availableIncidents: Readable<readonly IncidentName[]>, availableCharacters: Readable<readonly TCharacters[]>) {
        this.script = script;
        const currentList: CustomScriptIncidentSelection<TCharacters>[] = [];
        this.selectors = derived(maxDays, n => {
            n = Math.max(n, 0);
            currentList.splice(n);
            while (currentList.length < n) {
                const newIncident = new CustomScriptIncidentSelection(script, currentList.length + 1, availableIncidents, availableCharacters);
                currentList.push(newIncident);
            }
            this.Init();

            currentList.sort((a, b) => a.currentDay - b.currentDay)

            return currentList;
        });

        this.selectors.subscribe(() => this.Init());

    }

    public Init() {
        const all = this.selectors;
        get(this.selectors)?.forEach(x => x.Init(all));
    }
}

export interface ICustomScriptIncidentSelection<TCharacters extends CharacterName> {
    readonly script: CustomScript;
    readonly selectedCharacter: Writable<TCharacters>;
    readonly currentDay: number;
    // readonly notInTragedy: Writable<boolean>;
    readonly inTragedy: Writable<boolean>;
    readonly selectedIncident: Writable<IncidentName | undefined>;
    readonly availableCharacters: Readable<readonly TCharacters[]>;
    readonly options: Readable<readonly AdditionalOptions[]>;
}
class CustomScriptIncidentSelection<TCharacters extends CharacterName> implements ICustomScriptIncidentSelection<TCharacters> {

    public readonly script: CustomScript;
    public readonly selectedCharacter: Writable<TCharacters>;
    public readonly currentDay: number;
    // public readonly notInTragedy: Writable<boolean>;
    public readonly inTragedy: Writable<boolean>;
    public readonly selectedIncident: Writable<IncidentName | undefined>;
    public readonly availableCharacters: Readable<readonly TCharacters[]>;
    public readonly options: Readable<readonly AdditionalOptions[]>;

    private readonly allCharacters: Readable<readonly TCharacters[]>
    private readonly _availableCharacters: Writable<Readable<readonly TCharacters[]>>;

    /**
     *
     */
    constructor(script: CustomScript, currentDay: number, availableIncidents: Readable<readonly IncidentName[]>, availableCharacters: Readable<readonly TCharacters[]>) {
        this.currentDay = currentDay;
        this.allCharacters = availableCharacters;
        this.script = script;
        // will be set by init
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.selectedCharacter = writable(undefined!);
        this.selectedIncident = writable(undefined);
        this.inTragedy = writable(true);
        this._availableCharacters = writable(writable([]));
        this.availableCharacters = storeStore(this._availableCharacters);

        let lastOptions: AdditionalOptions[] = [];
        this.options = derived(this.selectedIncident, p => {
            const incident = p ? incidentsLookup[p] : undefined;

            const newOptions = [
                ...(isScriptSpecified(incident) ? incident.scriptSpecified.map((s) => new AdditionalOptions(script, s)) : []),
                ...(isFakeIncident(p) ? [new AdditionalOptions(script, { name: 'Faked as', type: 'incident' })] : []),
            ];
            lastOptions.forEach(e => {
                const target = newOptions.filter(x => x.option.name == e.option.name && x.option.type == e.option.type)[0];
                if (target) {
                    target.value.set(get(e.value));
                }
            });

            lastOptions = newOptions;
            return newOptions;

        })
    }


    /**
     * Init
     */
    public Init(others: Readable<CustomScriptIncidentSelection<TCharacters>[]>) {
        const derivideChars = derived([this.allCharacters, this.selectedIncident, storeStoresTuple(others, x => [x.selectedCharacter, x.selectedIncident] as const, x => x !== this)], ([allCharacters, selectedIncident, otherSelections]) => {

            const mob = isMobIncident(selectedIncident)
            const repeat = isRepeatedCulpritIncident(selectedIncident)
            if (mob) {

                const result = (locations as unknown as TCharacters[]).filter(x => otherSelections.length == 0 || !otherSelections.filter(([, inc]) => !repeat || inc != selectedIncident).map(([char]) => char).includes(x));
                return result;
            } else {

                const result = allCharacters.filter(x => x && x.length > 0 && (otherSelections.length == 0 || !otherSelections.filter(([, inc]) => !repeat || inc != selectedIncident).map(([char]) => char).includes(x)));
                return result;
            }
        });
        const currentChar = get(derivideChars);
        this._availableCharacters.set(derivideChars);
        if (get(this.selectedCharacter) == undefined) {
            this.selectedCharacter.set(currentChar[0]);
        }


    }
}

function generatePlotSelection<T extends PlotName>(script: CustomScript, allPlotNames: readonly T[], amount: number): ICustomScriptPlotMutalExclusiveSelection<T>[] {
    const result = Array.from({ length: amount }).map(() => new CustomScriptPlotMutalExclusiveSelection(script, allPlotNames));
    result.forEach(x => x.Init(result))
    return result;
}


function sumGroups<T extends string>(
    ...params: readonly Partial<Record<T, number | readonly [number, number]>>[]
): Partial<Record<T, readonly [number, number]>> {
    return params.reduce<Partial<Record<T, readonly [number, number]>>>((p, c) => {
        for (const key of keys(c)) {
            const value = c[key];
            const current = p[key] ?? [0, 0];

            if (typeof value == 'number') {
                p[key] = [current[0] + value, current[1] + value];
            } else if (value !== undefined) {
                p[key] = [current[0] + value[0], current[1] + value[1]];
            }
        }
        return p;
    }, {} as Partial<Record<T, readonly [number, number]>>);
}


type mapStores<T extends readonly any[]> =
    { [k in keyof T]: Readable<T[k]> }
    ;



function storeStoresTuple<T extends readonly any[], U>(target: Readable<readonly U[]>, selector: (store: U) => mapStores<T>, filter?: (store: U, index: number) => boolean): Readable<readonly T[]> {
    const lastSubscription: Unsubscriber[][] = [];
    const currentValue: T[] = [];
    const subscriptions: Subscriber<T[]>[] = [];
    target.subscribe(a => {
        a.filter((r, i) => filter === undefined || filter(r, i)).forEach((r, i) => {

            const selected = selector(r);
            const currentTuple: any[] = selected.map(() => undefined) as any;


            for (let j = 0; j < selected.length; j++) {
                const element = selected[j];
                lastSubscription[i]?.[j] && lastSubscription[i][j]();
                if (!Array.isArray(lastSubscription[i])) {
                    lastSubscription[i] = [];
                }
                lastSubscription[i][j] = element.subscribe(run => {
                    currentTuple[j] = run;
                    subscriptions.forEach(x => x(currentValue));
                });
            }
            currentValue[i] = currentTuple as any;
        });
    });
    const subscribe = (run: Subscriber<T[]>) => {

        run(currentValue);
        subscriptions.push(run);
        return () => {
            const at = subscriptions.findIndex(x => x == run);
            subscriptions.splice(at, 1);
        };
    };
    return {
        subscribe
    }

}
function storeStores<T, U>(target: Readable<readonly U[]>, selector: (store: U) => Readable<T>, filter?: (store: U, index: number) => boolean): Readable<readonly T[]> {
    const lastSubscription: Unsubscriber[] = [];
    const currentValue: T[] = [];
    const subscriptions: Subscriber<T[]>[] = [];
    target.subscribe(a => {
        const filtered = a.filter((r, i) => filter === undefined || filter(r, i));

        currentValue.splice(filtered.length);

        filtered.forEach((r, i) => {

            lastSubscription[i] && lastSubscription[i]();
            lastSubscription[i] = selector(r).subscribe(run => {
                currentValue[i] = run;
                subscriptions.forEach(x => x(currentValue.filter((_, i) => i < filtered.length)));
            });
        });
    });
    const subscribe = (run: Subscriber<T[]>) => {

        run(currentValue);
        subscriptions.push(run);
        return () => {
            const at = subscriptions.findIndex(x => x == run);
            subscriptions.splice(at, 1);
        };
    };
    return {
        subscribe
    }

}

function storeStore<T>(target: Readable<Readable<T>>): Readable<T> {
    let lastSubscription: Unsubscriber = noop;
    let currentValue: T;
    const subscriptions: Subscriber<T>[] = [];
    target.subscribe(r => {
        lastSubscription();
        lastSubscription = r.subscribe(run => {
            currentValue = run;
            subscriptions.forEach(x => x(run));
        });
    });
    const subscribe = (run: Subscriber<T>) => {

        run(currentValue);
        subscriptions.push(run);
        return () => {
            const at = subscriptions.findIndex(x => x == run);
            subscriptions.splice(at, 1);
        };
    };
    return {
        subscribe
    }

}



function generateRoleSelection<TCharacters extends CharacterName>(script: CustomScript, tragedySet:Tragedy,allRols: Partial<Record<RoleName, readonly [number, number]>>, characters: readonly TCharacters[]): ICustomScriptRoleExclusiveSelectionGroup<TCharacters>[] {

    const additionalPersons = characters.length - (Object.values(allRols).map(x => x[0])).reduce((p, c) => p + c, 0);
    allRols.person = [0, additionalPersons];

    const groups = keys(allRols).map(key => [key, allRols[key] ?? [0, 0]] as const)
        .map(([key, [min, max]]) => {
            // we may have a combined Role name, then it will not have a role maximum
            const roleMaximum = rolesLookup[key as unknown as RoleNameSingle]?.max ?? Number.MAX_SAFE_INTEGER;
            const setMax = tragedySet.maximumRoles?.[key as unknown as RoleNameSingle]?? Number.MAX_SAFE_INTEGER;
            return [key, [Math.min(Math.min(Math.max(0, min), roleMaximum),setMax), Math.min(Math.min(max, roleMaximum), setMax)]] as const;
        })
        .map(([key, [min, max]]) => {
            return new CustomScriptRoleExclusiveSelectionGroup(script, key, min, max, characters)
        });

    const reInit = () => {

        groups.forEach(g => {
            g.Init(groups);
        })
    };

    groups.forEach(g => {
        g.selectors.subscribe(() => {
            reInit();
        });
    });

    return groups;
}


export interface ICustomScriptRoleExclusiveSelectionGroup<TCharacters extends CharacterName> {
    readonly selectedNumber: Writable<number>;
    readonly min: number;
    readonly max: number;
    readonly role: RoleName;
    readonly selectors: Readable<ICustomScriptRoleExclusiveSelection<TCharacters>[]>;

}


class CustomScriptRoleExclusiveSelectionGroup<TCharacters extends CharacterName> implements ICustomScriptRoleExclusiveSelectionGroup<TCharacters> {

    public readonly selectedNumber: Writable<number>;
    public readonly min: number;
    public readonly max: number;
    public readonly role: RoleName;
    public readonly selectors: Readable<CustomScriptRoleExclusiveSelection<TCharacters>[]>;


    constructor(script: CustomScript, role: RoleName, min: number, max: number, allCharacters: readonly TCharacters[]) {
        this.min = min;
        this.max = max;
        this.role = role;
        this.selectedNumber = writable(min);


        const roles: CustomScriptRoleExclusiveSelection<TCharacters>[] = [];

        this.selectors = derived(this.selectedNumber, n => {
            n = Math.min(max, Math.max(n, min));

            roles.splice(n);
            while (roles.length < n) {
                const newRole = new CustomScriptRoleExclusiveSelection(script, role, allCharacters.filter(x => role == 'person' || !isCharacterPlotless(x)));
                roles.push(newRole);
            }
            return roles;

        });

    }

    public Init(others: CustomScriptRoleExclusiveSelectionGroup<TCharacters>[]) {
        const all = derived(others.filter(x => x !== this).concat(this).map(x => x.selectors), ([...data]) => {
            return data.flat();
        });
        get(this.selectors).forEach(x => x.Init(all));
    }
}
export interface ICustomScriptRoleExclusiveSelection<T extends CharacterName> {
    readonly selectedCharacter: Writable<T>;
    readonly availableCharacters: Readable<readonly T[]>;
    readonly options: Readable<readonly AdditionalOptions[]>;


}
class CustomScriptRoleExclusiveSelection<T extends CharacterName> implements CustomScriptRoleExclusiveSelection<T> {

    public readonly script: CustomScript;
    public readonly selectedCharacter: Writable<T>;
    public readonly availableCharacters: Readable<readonly T[]>;
    public readonly options: Readable<readonly AdditionalOptions[]>;

    private readonly allCharacters: readonly T[]
    private readonly _availableCharacters: Writable<Readable<readonly T[]>>;



    /**
     *
     */
    constructor(script: CustomScript, roleName: RoleName, allCharacters: readonly T[]) {
        this.allCharacters = allCharacters;
        this.script = script;
        // will be set on init
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.selectedCharacter = writable(undefined!);
        this._availableCharacters = writable(writable([]));
        this.availableCharacters = storeStore(this._availableCharacters);

        let lastOptions: AdditionalOptions[] = [];

        this.options = derived(this.selectedCharacter, p => {
            const char = charactersLookup[p];

            const roles = singleRolenames(roleName).map(x => rolesLookup[x]);


            const tg = get(script.tragedySet);


            const newOptions = [
                ...(isScriptSpecified(char) ? char.scriptSpecified.map((s) => new AdditionalOptions(script, s)) : []),
                ...(isCharacterPlotless(char) ? [new AdditionalOptions(script, { name: 'Role', type: char.plotLessRole == 'all' ? 'role in tragedy set' : char.plotLessRole == 'not in plots' ? 'role not in plot' : 'role in plot' })] : []),
                ...roles.flatMap(role => (isScriptSpecified(role) ? role.scriptSpecified.map((s) => new AdditionalOptions(script, s)) : [])),
                ...(hasCastOption(tg) ? tg.castOptions.map((s) => new AdditionalOptions(script, s)) : []),
            ];

            lastOptions.forEach(e => {
                const target = newOptions.filter(x => x.option.name == e.option.name && x.option.type == e.option.type)[0];
                if (target) {
                    target.value.set(get(e.value));
                }
            });

            lastOptions = newOptions;
            return newOptions;

        })
    }


    /**
     * Init
     */
    public Init(others: Readable<CustomScriptRoleExclusiveSelection<T>[]>) {
        const dervid = derived(storeStores(others, x => x.selectedCharacter, x => x !== this), ([...otherSelections]) => {
            const result = this.allCharacters.filter(x => otherSelections.length == 0 || !otherSelections.includes(x));
            return result;
        });
        const current = get(dervid).toSorted((a, b) => {
            return a.localeCompare(b);
        });
        this._availableCharacters.set(dervid);
        const currentSelection = get(this.selectedCharacter);
        if (currentSelection == undefined) {
            // this.selectedCharacter.set(current[0]);
        }
    }
}


export interface ICustomScriptPlotMutalExclusiveSelection<T extends string> {

    readonly script: CustomScript;
    readonly selectedPlot: Writable<T>;
    readonly availablePlots: Readable<readonly T[]>;
    readonly options: Readable<readonly AdditionalOptions[]>;
}

export class AdditionalOptions {
    public readonly script: CustomScript;
    public readonly option: Option;
    public readonly value: Writable<any>;

    /**
     *
     */
    constructor(script: CustomScript, option: Option) {
        this.option = option;
        this.script = script;
        this.value = writable(undefined);
    }
}

class CustomScriptPlotMutalExclusiveSelection<T extends PlotName> implements ICustomScriptPlotMutalExclusiveSelection<T> {


    public readonly script: CustomScript;
    public readonly selectedPlot: Writable<T>;
    public readonly availablePlots: Readable<readonly T[]>;
    public readonly options: Readable<readonly AdditionalOptions[]>;


    private readonly allPlotNames: readonly T[]
    private readonly _availablePlots: Writable<Readable<readonly T[]>>;


    /**
     *
     */
    constructor(script: CustomScript, allPlotNames: readonly T[]) {
        this.script = script
        this.allPlotNames = allPlotNames;
        this.selectedPlot = writable(undefined!);
        this._availablePlots = writable(writable([]));
        this.availablePlots = storeStore(this._availablePlots);

        let lastOptions: AdditionalOptions[] = [];

        this.options = derived(this.selectedPlot, p => {
            const plot = plotsLookup[p];
            if (isScriptSpecified(plot)) {
                const newOptions = plot.scriptSpecified.map((s) => new AdditionalOptions(script, s));
                lastOptions.forEach(e => {
                    const target = newOptions.filter(x => x.option.name == e.option.name && x.option.type == e.option.type)[0];
                    if (target) {
                        target.value.set(get(e.value));
                    }
                });

                lastOptions = newOptions;
                return newOptions;
            }
            return [];
        })

    }


    /**
     * Init
     */
    public Init(others: CustomScriptPlotMutalExclusiveSelection<T>[]) {
        const dervid = derived([...others.filter(x => x !== this).map(x => x.selectedPlot)], ([...otherSelections]) => {
            const result = this.allPlotNames.filter(x => otherSelections.length == 0 || !otherSelections.includes(x));
            return result;
        });
        this._availablePlots.set(dervid);

        // if (get(this.selectedPlot) == undefined)
        // this.selectedPlot.set(get(dervid)[0])


    }
}


export class CustomScript {

    public readonly title: Writable<string>
    public readonly creator: Writable<string>
    public readonly set: Writable<{ name: string, number: number } | undefined>
    public readonly difficultySets: Writable<readonly { numberOfLoops: number, difficulty: number, }[]>
    public readonly specialRules: Writable<string>
    public readonly victoryConditions: Writable<string>
    public readonly story: Writable<string>
    public readonly mastermindHints: Writable<string>
    public readonly description: Writable<string>


    public readonly daysPerLoop: Writable<number>
    public readonly tragedySetName: Writable<TragedySetName>
    public readonly tragedySet: Readable<Tragedy>

    public readonly mainPlots: Readable<readonly ICustomScriptPlotMutalExclusiveSelection<PlotName>[]>
    public readonly subPlots: Readable<readonly ICustomScriptPlotMutalExclusiveSelection<PlotName>[]>
    public readonly selectedPlots: Readable<readonly {
        id: PlotName, options: {
            settings: Option,
            value: any
        }[]
    }[]>;

    public readonly roles: Readable<readonly ICustomScriptRoleExclusiveSelectionGroup<CharacterName>[]>
    public readonly unusedRoles: Readable<readonly RoleName[]>;
    public readonly usedRoles: Readable<readonly RoleName[]>;
    public readonly allRoles: Readable<readonly RoleName[]>;

    public readonly usedCharacters: Readable<readonly CharacterName[]>
    public readonly locations: readonly LocationName[]
    public readonly incidents: Readable<readonly IncidentName[]>

    public readonly incidentGroup: ICustomScriptIncidentSelectionGroup<CharacterName>


    constructor() {

        this.title = writable('');
        this.creator = writable('');
        this.set = writable(undefined);
        this.difficultySets = writable([]);
        this.specialRules = writable('');
        this.victoryConditions = writable('');
        this.story = writable('');
        this.mastermindHints = writable('');
        this.description = writable('');


        this.locations = locations;
        this.tragedySetName = writable(keys(tragedysLookup)[0]);
        this.daysPerLoop = writable(4);
        this.tragedySet = derived(this.tragedySetName, tgn => {
            return tragedysLookup[tgn];
        });
        this.mainPlots = derived(this.tragedySet, tg => generatePlotSelection(this, tg.mainPlots, tg.numberOfMainPlots ?? 1));
        this.subPlots = derived(this.tragedySet, tg => generatePlotSelection(this, tg.subPlots, tg.numberOfSubPlots ?? 2));
        this.incidents = derived(this.tragedySet, tg => tg.incidents);

        const mapPlotStores = (plots: typeof this.mainPlots | typeof this.subPlots) =>
            storeStores(storeStores(plots, x => derived([x.selectedPlot, x.options], ([selectedPlot, options]) => {
                return {
                    id: selectedPlot,
                    options: options.map(x => derived(x.value, value => {
                        return {
                            settings: x.option,
                            value: value
                        }
                    }))
                }
            })), x => derived([...x.options], ([...options]) => {
                return {
                    id: x.id,
                    options: options.map(o => ({
                        settings: o.settings,
                        value: o.value
                    }))
                }
            }));

        const selectodMainPlots = mapPlotStores(this.mainPlots)
        const selectodSubplots = mapPlotStores(this.subPlots);

        this.selectedPlots = derived([selectodMainPlots, selectodSubplots], ([mainPlots, subPlots]) => [...mainPlots, ...subPlots]);
        this.allRoles = derived([this.tragedySet], ([tg]) => {
            const allRoles = [...getTragedySetRoles(tg), 'person'] as const;
            return allRoles;
        });


        this.roles = derived([this.tragedySet,this.selectedPlots], ([tragedySet,...selectiedPlots]) => {
            const roleData = [...selectiedPlots.flatMap(x => x.map(y => plotsLookup[y.id]?.roles ?? {})),

            ...selectiedPlots.flatMap(x => x.flatMap(y => y.options).filter(x => x.settings.type == 'plot' && x.settings.addRolesForPlot).map(x => plotsLookup[x.value as PlotName]?.roles ?? {}))
            ];
            return generateRoleSelection(this,tragedySet, sumGroups(...roleData), keys(charactersLookup).filter(x => {
                const char = charactersLookup[x];
                return !(char.nonSelectableCharacter);
            }))
        });

        const numberOfPersons = derived(storeStores(this.roles, x => derived(x.selectedNumber, n => ({ role: x.role, count: n }))), selected => {
            return selected.filter(x => x.role == 'person').map(x => x.count)[0] ?? 0;
        })

        const actuallySelectedRolesPart1 = storeStores(storeStores(derived(storeStores(this.roles, roles => derived(roles.selectors, selectors => ({ roles: roles.role, seleced: selectors }))), x => x.flatMap(x => x.seleced.map(y => derived([y.selectedCharacter, y.options], ([selectedCharacter, options]) => ({
            role: x.roles,
            selectedCharacter: selectedCharacter,
            options:
                options.map(x => derived(x.value, value => ({ value, option: x.option })))

        }))))), x => derived(x, x => {
            return {
                role: x.role,
                selectedCharacter: x.selectedCharacter,
                options: derived(x.options, x => x)
            }
        }
        )),
            x => derived(x.options, options => ({
                role: x.role,
                selectedCharacter: x.selectedCharacter,
                options: options.map(o => ({
                    settings: o.option,
                    value: o.value
                }))
            })))

            ;


        this.usedRoles = derived([numberOfPersons, actuallySelectedRolesPart1, this.selectedPlots], ([numberOfPersons, actuallySelectedRoles, ...selectedPlots]) => {


            const acualRoles = (actuallySelectedRoles.flatMap(x => {
                const roleDatas = singleRolenames(x.role).map(x => rolesLookup[x]);
                const character = charactersLookup[x.selectedCharacter]
                if (isCharacterPlotless(character)) {
                    const roles = x.options.filter(x => x.settings.type == 'role in plot' || x.settings.type == 'role not in plot' || x.settings.type == 'role in tragedy set').map(x => x.value as RoleName)
                    return roles;
                }
                return [x.role];
            })).filter(isRoleName)

            const used = selectedPlots.flatMap(x => x.flatMap(y => keys(plotsLookup[y.id]?.roles ?? [])));
            const plotlist = selectedPlots.flatMap(x => x.flatMap(y => y));
            selectedPlots.flatMap(x => x).map(x => {
                const plot = plotsLookup[x.id];
                if (!plot) {
                    console.warn(`Plot ${x.id} not found in plotsLookup`);
                    return [];
                }
                plot.scriptSpecified?.map(x => x.type)
            })

            const personRoles = (numberOfPersons > 0)
                ? ['person'] as const
                : [];
            const additionalPlots = plotlist.map(x => plotsLookup[x.id]).filter(x => x).flatMap(plot => plot.scriptSpecified?.filter(x => x.type == 'plot' && x.addRolesForPlot).flatMap(additionalPlot => keys(plotsLookup[additionalPlot.name as PlotName]?.roles ?? {}) ?? []) ?? [])
            return [...new Set([...used, ...additionalPlots, ...acualRoles])];
        });

        this.unusedRoles = derived([this.allRoles, this.usedRoles], ([allRoles, usedRoles]) => {
            return allRoles.filter(x => !usedRoles.includes(x as any));
        });


        this.usedCharacters = storeStores(derived(storeStores(this.roles, x => x.selectors), r => r.flat().map(x => x.selectedCharacter)), x => x);


        this.incidentGroup = generateIncidents(this, this.daysPerLoop, this.incidents, this.usedCharacters);

    }

    /**
     * import
     */
    public import(script: Script) {
        this.title.set(script.title);
        this.creator.set(script.creator ?? '');
        this.description.set(script.description ?? '');
        this.difficultySets.set(script.difficultySets ?? []);
        this.tragedySetName.set(script.tragedySet!);//TODO: check if it is a known tragedySet is set

        get(this.mainPlots).forEach((p, i) => {
            const sp = script.mainPlot[i];
            if (Array.isArray(sp)) {
                const name = sp[0];
                const opt = sp[1];
                p.selectedPlot.set(name);
                const optionsToSet = get(p.options);
                optionsToSet.forEach(os => {
                    const value = opt[os.option.name];
                    if (value) {
                        os.value.set(value);
                    }
                });
            } else {
                p.selectedPlot.set(sp as unknown as any);
            }
        });
        get(this.subPlots).forEach((p, i) => {
            const sp = script.subPlots[i];
            if (Array.isArray(sp)) {
                const name = sp[0];
                const opt = sp[1];
                if (typeof name !== 'string') {
                    throw new Error(`Plot name is not a string: ${name}`);
                }
                if (typeof opt !== 'object' || Array.isArray(opt)) {
                    throw new Error(`Plot options is not an object: ${opt}`);
                }
                p.selectedPlot.set(name as PlotName);
                const optionsToSet = get(p.options);
                optionsToSet.forEach(os => {
                    const value = opt[os.option.name];
                    if (value) {
                        os.value.set(value);
                    }
                });
            } else {
                p.selectedPlot.set(sp as unknown as any);
            }
        });
        this.daysPerLoop.set(script.daysPerLoop ?? 1);

        Object.entries(Object.entries<CharacterName, RoleName | readonly [RoleName, Record<string, any>]>(script.cast as any).reduce((p, [key, value]) => {
            if (isCharacterId(key))

                if ((charactersLookup[key]).plotLessRole) {
                    const name = 'person'; // Plotless characters are sorted under Persons and there role is in options

                    if (name in p && Array.isArray(p[name])) {
                        p[name].push([key, { 'Role': value }]);
                    } else {
                        p[name] = [];
                        p[name].push([key, { 'Role': value }]);
                    }
                } else {
                    if (typeof value == 'string' && isRoleName(value)) {
                        const name = value;
                        if (name in p && Array.isArray(p[name])) {
                            p[name].push(key);
                        } else {
                            p[name] = [];
                            p[name].push(key);
                        }
                    } else if (isRoleName(value[0])) {
                        const name = value[0]
                        if (name in p && Array.isArray(p[name])) {
                            p[name].push([key, value[1]]);
                        } else {
                            p[name] = [];
                            p[name].push([key, value[1]]);
                        }
                    }
                }

            return p;
        }, {} as Partial<Record<RoleName, (CharacterName | readonly [CharacterName, Record<string, any>])[]>>)).map(([key, value]) => {
            const roleWraper = get(this.roles).filter(x => x.role == key)[0];
            if (roleWraper === undefined || value == undefined) {
                return;
            }
            roleWraper.selectedNumber.set(value.length);

            const selectors = get(roleWraper.selectors);
            value.forEach((v, i) => {
                if (typeof v == 'string') {
                    selectors[i].selectedCharacter.set(v);
                } else {
                    selectors[i].selectedCharacter.set(v[0]);
                    const optToSet = v[1];
                    const opt = get(selectors[i].options);
                    opt.forEach(o => {
                        if (o.option.name in optToSet) {
                            o.value.set(optToSet[o.option.name]);
                        }
                    });
                }
            });
        });

        // this.incidentGroup.selectedNumber.set(script.daysPerLoop ?? 1);

        const incidents = get(this.incidentGroup.selectors)

        script.incidents.forEach((ince) => {
            const index = ince.day - 1;
            incidents[index];
            incidents[index].selectedCharacter.set(ince.culprit as any); // Its not correct typed for mob incidents…
            incidents[index].inTragedy.set(!('notTragedySpecified' in ince) || !ince.notTragedySpecified);
            if (typeof ince.incident == 'string') {
                const name = ince.incident;
                incidents[index].selectedIncident.set(name);
            } else {
                const name = ince.incident[0];
                incidents[index].selectedIncident.set(name);

                const opt = get(incidents[index].options);
                opt.forEach(o => {
                    if (o.option.name == 'Faked as') {
                        o.value.set(ince.incident[1]);
                    }
                });

            }




        });


        this.specialRules.set((script).specialRules?.join('\n\n') ?? '');
        this.victoryConditions.set(script["victory-conditions"] ?? '');
        this.story.set(script.story ?? '');
        this.mastermindHints.set(script.mastermindHints ?? '');


    }

    /**
     * export
    */
    public export(): Script {

        const result = {

            title: get(this.title),
            creator: get(this.creator),
            set: get(this.set),
            difficultySets: get(this.difficultySets),
            tragedySet: get(this.tragedySetName),
            mainPlot: get(this.mainPlots).map(x => {
                const opt = get(x.options).filter(x => x.value !== undefined || x.option.optional !== true).map(x => [x.option.name, get(x.value)] as const);
                const plot = get(x.selectedPlot);
                return opt.length > 0
                    ? [plot, Object.fromEntries(opt)] as const
                    : plot;
            }),
            subPlots: get(this.subPlots).map(x => {
                const opt = get(x.options).filter(x => x.value !== undefined || x.option.optional !== true).map(x => [x.option.name, get(x.value)] as const);
                const plot = get(x.selectedPlot);

                return opt.length > 0
                    ? [plot, Object.fromEntries(opt)] as const
                    : plot;
            }),
            daysPerLoop: get(this.daysPerLoop),
            cast: get(this.roles).reduce((p, rGroups) => {
                const chars = get(rGroups.selectors).map(x => [get(x.selectedCharacter), get(x.options).filter(x => get(x.value) !== undefined || x.option.optional !== true).map(x => [x.option.name, get(x.value)] as const)] as const)
                chars.forEach(([c, opt]) => {
                    console.log('export')
                    if (opt.length > 0) {
                        const rol = opt.filter(([x]) => x === 'Role')[0];
                        if (rol) {
                            if (opt.length === 1) {
                                p[c] = rol[1];
                            } else {
                                p[c] = [rGroups.role, Object.fromEntries(opt.filter(([x]) => x !== 'Role'))] as const;
                            }

                        } else {
                            p[c] = [rGroups.role, Object.fromEntries(opt)] as const;
                        }

                    } else {
                        p[c] = rGroups.role;
                    }
                })
                return p;
            }, {} as Record<CharacterName, RoleName | readonly [RoleName, Record<string, any>]>)

            ,
            // castOptions?: Options,

            incidents: get(this.incidentGroup.selectors).filter(x => get(x.selectedIncident) != undefined && (get(x.selectedIncident)?.length ?? 0) > 0).map(x => {

                const incidentName = get(x.selectedIncident);

                return {
                    day: x.currentDay,
                    notTragedySpecified: !get(x.inTragedy) ? true : undefined,

                    incident: isFakeIncident(incidentName) ? [incidentName, get(get(x.options).filter(x => x.option.name == 'Faked as')[0].value)] as const : incidentName,
                    culprit: get(x.selectedCharacter)
                };
            }),
            description: get(this.description),
            specialRules: [get(this.specialRules)],
            'victory-conditions': get(this.victoryConditions),
            story: get(this.story),
            mastermindHints: get(this.mastermindHints),

        } as unknown as Script;

        return result;

    }


}