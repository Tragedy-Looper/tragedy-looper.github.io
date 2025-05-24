import { writable, type Readable, type Writable, derived, type Unsubscriber, type Subscriber, get } from "svelte/store";
import { tragedySets, type TragedySetName, type TragedySet, getTragedySetRoles, hasCastOption } from "./tragedySets";
import { keys, require } from "../misc";
import { plots, type PlotName } from "./plots";
import { roles, type RoleName, isRoleName } from "./roles";
import { characters, isCharacterPlotless, type CharacterName, locations, type LocationName, isCharacterName } from "./characters";
import { isScriptSpecified, type Option } from "./core";
import { incidents, type IncidentName, isFakeIncident, isMobIncident, isRepeatedCulpritIncident } from "./incidents";
import type { Script } from "./script";


const noop = () => { };


function generateIncidents<TCharacters extends CharacterName>(script: CustomScript, maxDays: Readable<number>, availableIncidents: Readable<readonly IncidentName[]>, availableCharacters: Readable<readonly TCharacters[]>): ICustomScriptIncidentSelectionGroup<TCharacters> {
    const result = new CustomScriptIncidentSelectionGroup(script, maxDays, availableIncidents, availableCharacters);
    result.Init()
    return result;
}


export interface ICustomScriptIncidentSelectionGroup<TCharacters extends CharacterName> {
    readonly selectedNumber: Writable<number>;
    readonly selectors: Readable<ICustomScriptIncidentSelection<TCharacters>[]>;
    readonly script: CustomScript;

}
class CustomScriptIncidentSelectionGroup<TCharacters extends CharacterName> implements ICustomScriptIncidentSelectionGroup<TCharacters> {

    public readonly script: CustomScript;
    public readonly selectedNumber: Writable<number>;
    public readonly selectors: Readable<CustomScriptIncidentSelection<TCharacters>[]>;


    constructor(script: CustomScript, maxDays: Readable<number>, availableIncidents: Readable<readonly IncidentName[]>, availableCharacters: Readable<readonly TCharacters[]>) {
        this.selectedNumber = writable(0);
        this.script = script;
        const currentList: CustomScriptIncidentSelection<TCharacters>[] = [];
        this.selectors = derived(this.selectedNumber, n => {
            n = Math.max(n, 0);
            currentList.splice(n);
            while (currentList.length < n) {
                const newIncident = new CustomScriptIncidentSelection(script, maxDays, availableIncidents, availableCharacters);
                currentList.push(newIncident);
            }
            this.Init();

            currentList.sort((a, b) => get(a.selectedDay) - get(b.selectedDay))

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
    readonly selectedDay: Writable<number>;
    readonly selectedIncident: Writable<IncidentName>;
    readonly availableCharacters: Readable<readonly TCharacters[]>;
    readonly availableDays: Readable<readonly number[]>;
    readonly options: Readable<readonly AdditionalOptions[]>;
}
class CustomScriptIncidentSelection<TCharacters extends CharacterName> implements ICustomScriptIncidentSelection<TCharacters> {

    public readonly script: CustomScript;
    public readonly selectedCharacter: Writable<TCharacters>;
    public readonly selectedDay: Writable<number>;
    public readonly selectedIncident: Writable<IncidentName>;
    public readonly availableCharacters: Readable<readonly TCharacters[]>;
    public readonly availableDays: Readable<readonly number[]>;
    public readonly options: Readable<readonly AdditionalOptions[]>;

    private readonly allCharacters: Readable<readonly TCharacters[]>
    private readonly _availableCharacters: Writable<Readable<readonly TCharacters[]>>;
    private readonly _availableDays: Writable<Readable<readonly number[]>>;
    private readonly maxDays: Readable<number>;

    /**
     *
     */
    constructor(script: CustomScript, maxDays: Readable<number>, availableIncidents: Readable<readonly IncidentName[]>, availableCharacters: Readable<readonly TCharacters[]>) {
        this.maxDays = maxDays;
        this.allCharacters = availableCharacters;
        this.script = script;
        // will be set by init
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.selectedCharacter = writable(undefined!);
        this.selectedIncident = writable(get(availableIncidents)[0]);
        this.selectedDay = writable(0);
        this._availableCharacters = writable(writable([]));
        this._availableDays = writable(writable([]));
        this.availableCharacters = storeStore(this._availableCharacters);
        this.availableDays = storeStore(this._availableDays);

        let lastOptions: AdditionalOptions[] = [];
        this.options = derived(this.selectedIncident, p => {
            const incident = incidents[p];

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

                const result = allCharacters.filter(x => otherSelections.length == 0 || !otherSelections.filter(([, inc]) => !repeat || inc != selectedIncident).map(([char]) => char).includes(x));
                return result;
            }
        });
        const currentChar = get(derivideChars);
        this._availableCharacters.set(derivideChars);
        if (get(this.selectedCharacter) == undefined) {
            this.selectedCharacter.set(currentChar[0]);
        }

        const derivideDays = derived([this.maxDays, storeStores(others, x => x.selectedDay, x => x !== this)], ([maxDays, otherSelections]) => {
            const available = Array.from({ length: maxDays }).map((_, i) => i + 1);

            const result = available.filter(x => otherSelections.length == 0 || !otherSelections.includes(x));
            return result;
        });
        const currentDays = get(derivideDays);
        this._availableDays.set(derivideDays);
        if (get(this.selectedDay) == 0) {
            this.selectedDay.set(currentDays[0]);
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



function generateRoleSelection<TCharacters extends CharacterName>(script: CustomScript, allRols: Partial<Record<RoleName, readonly [number, number]>>, characters: readonly TCharacters[]): ICustomScriptRoleExclusiveSelectionGroup<TCharacters>[] {

    const additionalPersons = characters.length - (Object.values(allRols).map(x => x[0])).reduce((p, c) => p + c, 0);
    allRols.Person = [0, additionalPersons];

    const groups = keys(allRols).map(key => [key, allRols[key] ?? [0, 0]] as const).map(([key, [min, max]]) => {
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
                const newRole = new CustomScriptRoleExclusiveSelection(script, role, allCharacters.filter(x => role == 'Person' || !isCharacterPlotless(x)));
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
            const char = characters[p];

            const role = roles[roleName];


            const tg = get(script.tragedySet);


            const newOptions = [
                ...(isScriptSpecified(char) ? char.scriptSpecified.map((s) => new AdditionalOptions(script, s)) : []),
                ...(isCharacterPlotless(char) ? [new AdditionalOptions(script, { name: 'Role', type: char.plotLessRole == 'all' ? 'role in tragedy set' : char.plotLessRole == 'not in plots' ? 'role not in plot' : 'role in plot' })] : []),
                ...(isScriptSpecified(role) ? role.scriptSpecified.map((s) => new AdditionalOptions(script, s)) : []),
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
        const current = get(dervid);
        this._availableCharacters.set(dervid);
        const currentSelection = get(this.selectedCharacter);
        if (currentSelection == undefined) {
            this.selectedCharacter.set(current[0]);
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
        this.selectedPlot = writable(allPlotNames[0]);
        this._availablePlots = writable(writable([]));
        this.availablePlots = storeStore(this._availablePlots);

        let lastOptions: AdditionalOptions[] = [];

        this.options = derived(this.selectedPlot, p => {
            const plot = plots[p];
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

        if (get(this.selectedPlot) == undefined)
            this.selectedPlot.set(get(dervid)[0])


    }
}


export class CustomScript {

    public readonly title: Writable<string>
    public readonly creator: Writable<string>
    public readonly set: Writable<{ name: string, number: number } | undefined>
    public readonly difficultySets: Writable<readonly { numberOfLoops: number, difficulty: number, }[]>
    public readonly specialRules: Writable<string>
    public readonly specifics: Writable<string>
    public readonly story: Writable<string>
    public readonly mastermindHints: Writable<string>


    public readonly daysPerLoop: Writable<number>
    public readonly tragedySetName: Writable<TragedySetName>
    public readonly tragedySet: Readable<TragedySet>

    public readonly mainPlots: Readable<readonly ICustomScriptPlotMutalExclusiveSelection<PlotName>[]>
    public readonly subPlots: Readable<readonly ICustomScriptPlotMutalExclusiveSelection<PlotName>[]>
    public readonly selectedPlots: Readable<readonly PlotName[]>;

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
        this.specifics = writable('');
        this.story = writable('');
        this.mastermindHints = writable('');


        this.locations = locations;
        this.tragedySetName = writable(keys(tragedySets)[0]);
        this.daysPerLoop = writable(4);
        this.tragedySet = derived(this.tragedySetName, tgn => {
            return tragedySets[tgn];
        });
        this.mainPlots = derived(this.tragedySet, tg => generatePlotSelection(this, tg.mainPlots, tg.numberOfMainPlots));
        this.subPlots = derived(this.tragedySet, tg => generatePlotSelection(this, tg.subPlots, tg.numberOfSubPlots));
        this.incidents = derived(this.tragedySet, tg => tg.incidents);

        const selectodMainPlots = storeStores(this.mainPlots, x => x.selectedPlot)
        const selectodSubplots = storeStores(this.subPlots, x => x.selectedPlot)

        this.selectedPlots = derived([selectodMainPlots, selectodSubplots], ([mainPlots, subPlots]) => [...mainPlots, ...subPlots]);
        this.unusedRoles = derived([this.tragedySet, this.selectedPlots], ([tg, ...selectedPlots]) => {
            const allRoles = getTragedySetRoles(tg);
            const used = selectedPlots.flatMap(x => x.flatMap(y => keys(plots[y].roles)));
            return allRoles.filter(x => !used.includes(x as any));
        });
        this.allRoles = derived([this.tragedySet, this.selectedPlots], ([tg, ...selectedPlots]) => {
            const allRoles = getTragedySetRoles(tg);
            return allRoles;
        });
        this.usedRoles = derived([this.tragedySet, this.selectedPlots], ([tg, ...selectedPlots]) => {
            const used = selectedPlots.flatMap(x => x.flatMap(y => keys(plots[y].roles)));
            return used;
        });
        this.roles = derived([this.selectedPlots], ([...selectiedPlots]) => generateRoleSelection(this, sumGroups(...selectiedPlots.flatMap(x => x.map(y => plots[y].roles))), keys(characters).filter(x => {
            const char = characters[x];
            return !('nonSelectableCharacter' in char && char.nonSelectableCharacter);
        })));


        this.usedCharacters = storeStores(derived(storeStores(this.roles, x => x.selectors), r => r.flat().map(x => x.selectedCharacter)), x => x);

        this.incidentGroup = generateIncidents(this, this.daysPerLoop, this.incidents, this.usedCharacters);

    }

    /**
     * import
     */
    public import(script: Script) {
        this.title.set(script.title);
        this.creator.set(script.creator);
        this.difficultySets.subscribe(x =>
            console.log('d', x));
        this.difficultySets.set(script.difficultySets);
        this.tragedySetName.set(script.tragedySet);

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
        this.daysPerLoop.set(script.daysPerLoop);

        Object.entries(Object.entries<CharacterName, RoleName | readonly [RoleName, Record<string, any>]>(script.cast as any).reduce((p, [key, value]) => {
            if (isCharacterName(key))

                if (require(characters[key]).plotLessRole) {
                    const name = 'Person'; // Plotless characters are sorted under Persons and there role is in options
                    p[name].push([key, { 'Role': value }]);
                } else {
                    if (typeof value == 'string' && isRoleName(value)) {
                        const name = value;
                        if (name in p) {
                            p[name].push(key);
                        } else {
                            p[name] = [];
                            p[name].push(key);
                        }
                    } else if (isRoleName(value[0])) {
                        const name = value[0]
                        if (name in p) {
                            p[name].push([key, value[1]]);
                        } else {
                            p[name] = [];
                            p[name].push([key, value[1]]);
                        }
                    }
                }

            return p;
        }, {} as Record<RoleName, (CharacterName | readonly [CharacterName, Record<string, any>])[]>)).map(([key, value]) => {
            const roleWraper = get(this.roles).filter(x => x.role == key)[0];
            if (roleWraper === undefined) {
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

        this.incidentGroup.selectedNumber.set(script.incidents.length);

        const incidents = get(this.incidentGroup.selectors)

        script.incidents.forEach((ince, i) => {
            incidents[i].selectedDay.set(ince.day);
            incidents[i].selectedCharacter.set(ince.culprit as any); // Its not correct typed for mob incidents…

            if (typeof ince.incident == 'string') {
                const name = ince.incident;
                incidents[i].selectedIncident.set(name);
            } else {
                const name = ince.incident[0];
                incidents[i].selectedIncident.set(name);

                const opt = get(incidents[i].options);
                opt.forEach(o => {
                    if (o.option.name == 'Faked as') {
                        o.value.set(ince.incident[1]);
                    }
                });

            }




        });


        this.specialRules.set(require(script).specialRules?.join('\n\n') ?? '');
        this.specifics.set(script.specifics);
        this.story.set(script.story);
        this.mastermindHints.set(script.mastermindHints);


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

            incidents: get(this.incidentGroup.selectors).map(x => {

                const incidentName = get(x.selectedIncident);

                return {
                    day: get(x.selectedDay),
                    incident: isFakeIncident(incidentName) ? [incidentName, get(get(x.options).filter(x => x.option.name == 'Faked as')[0].value)] as const : incidentName,
                    culprit: get(x.selectedCharacter)
                };
            }),
            specialRules: [get(this.specialRules)],
            specifics: get(this.specifics),
            story: get(this.story),
            mastermindHints: get(this.mastermindHints),

        } as unknown as Script;

        return result;

    }


}