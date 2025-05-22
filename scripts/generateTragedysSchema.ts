import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { compile, JSONSchema } from 'json-schema-to-typescript'

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const staticDir = path.join(__dirname, '../static');
const srcDir = path.join(__dirname, '../src');

const names = {
    plotNames: collectNamesFromJsonFiles('plots'),
    incidentNames: collectNamesFromJsonFiles('incidents'),
    roleNames: collectNamesFromJsonFiles('roles'),
    characterNames: collectNamesFromJsonFiles('characters'),
    tragedySetNames: collectNamesFromJsonFiles('tragedys'),
    namesPerTragedySet: Object.fromEntries(collectDataFromJsonFiles('tragedys').map((data) => {
        const plotData = collectDataFromJsonFiles('plots');
        const allPlots = new Set([...data.mainPlots, ...data.subPlots]);
        return [data.name, {
            plotNames: allPlots,
            mainPlotNames: new Set(data.mainPlots),
            subPlotNames: new Set(data.subPlots),
            incidentNames: new Set(data.incidents),
            roles: new Set<string>([...plotData.filter(p => allPlots.has(p.name)).flatMap(p => Object.keys(p.roles).map(r => r)),
            ...(data.aditionalRoles ?? []),
            ...['Person']
            ]),
        }] as const;
    })) as Record<string, {
        plotNames: Set<string>,
        mainPlotNames: Set<string>,
        subPlotNames: Set<string>,
        incidentNames: Set<string>,
        roles: Set<string>,
    }>,
    RolaData: Object.fromEntries(collectDataFromJsonFiles('roles').map((data) => {
        return [data.name, data] as const;
    })) as Record<string, { name: string, scriptSpecified: { name: string, type: "number" | "plot" | "location" | "string" }[] }>,

    PlotData: Object.fromEntries(collectDataFromJsonFiles('plots').map((data) => {
        return [data.name, data] as const;
    })) as Record<string, { name: string, roles: Record<string, number | [number, number]>, scriptSpecified: { name: string, type: "number" | "plot" | "location" | "string" }[] }>,

    IncidentData: Object.fromEntries(collectDataFromJsonFiles('incidents').map((data) => {
        return [data.name, data] as const;
    })) as Record<string, { name: string, faked: boolean, }>,

    CharacterData: Object.fromEntries(collectDataFromJsonFiles('characters').map((data) => {
        return [data.name, data] as const;
    })) as Record<string, { name: string, comesInLater: boolean, plotLessRole: boolean, startLocation: (typeof locations)[], scriptSpecified: { name: string, type: "number" | "plot" | "location" | "string" }[] }>,
    mobIncidentNames: new Set<string>(collectDataFromJsonFiles('incidents').filter(x => x.mob !== undefined).map(x => x.name)),
} as const;


const locations = ['Hospital', 'Shrine', 'City', 'School'] as const;
const tags = ['boy', 'girl', 'student', "man", "woman", "adult", 'construct', 'animal', 'tree', 'little sister'];





const SpecificationType = ['location', 'incident', 'role', 'character', 'plot', 'number', 'text'] as const;


const AbilityTypeCreation = ['Script creation'] as const;
const AbilityTypeDefault = ['Optional', 'Mandatory'] as const;

const AbilityTypeLose = [
    'Mandatory Loss condition: Protagonists Death',
    'Optional Loss condition: Protagonists Death',
    'Delayed Loss condition: Protagonists Death',
    'Loss condition: Tragedy'
] as const;
const AbilityType = [...AbilityTypeLose, ...AbilityTypeCreation, ...AbilityTypeDefault] as const;

const timing = ['Always', 'Day Start', 'Day End', 'Mastermind Ability', 'Card resolve', 'Loop End', 'Loop Start'
    , 'Last Day', 'First Day', 'Incident step', 'Incident trigger', 'On character death', 'When this role is to be reveald'
    , 'Mastermind Action step', 'Goodwill ablility step', 'After Goodwill Ability used'] as const;

const scriptSpecified = {
    "scriptSpecified": {
        "type": "array",
        "items": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string",
                },
                "type": {
                    "type": "string",
                    "enum": SpecificationType
                },
                "optional": {
                    "type": "boolean"
                },
            },
            "required": ["name", "type"],
        }
    },
} as const;

const doseNotTriggerIncidentEffect = {
    "doseNotTriggerIncidentEffect": { "type": "boolean" },
} as const;

const Abilitie = {
    type: "object",



    "oneOf": [
        {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "description": { "type": "string" },
                "prerequisite": { "type": "string" },
                "type": { "type": "string", enum: AbilityTypeDefault },
                "timesPerLoop": {
                    "oneOf": [
                        { type: 'number' },
                        {
                            "type": "array",
                            "items": [
                                { type: 'number' },
                                {
                                    "type": "object",
                                    "additionalProperties": false,
                                    "properties": {
                                        "Over all Roles": { "type": "boolean" }
                                    },
                                }
                            ]

                        }
                    ]
                },
                "timesPerDay": {
                    "oneOf": [
                        { type: 'number' },
                        {
                            "type": "array",
                            "items": [
                                { type: 'number' },
                                {
                                    "type": "object",
                                    "additionalProperties": false,
                                    "properties": {
                                        "Over all Roles": { "type": "boolean" }
                                    },
                                }
                            ]

                        }
                    ]
                },
                "timing": {
                    "type": "array", "items": {
                        "type": "string", "enum": timing
                    }
                }
            },
            "required": ["description", "type", "timing"],
        },
        {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "description": { "type": "string" },
                "prerequisite": { "type": "string" },
                "type": { "type": "string", enum: AbilityTypeLose },
                "timesPerLoop": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "Over all Roles": { "type": "boolean" }
                    },
                    "required": ["timesPerLoop"],
                },
                "timesPerDay": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "Over all Roles": { "type": "boolean" }
                    },
                    "required": ["timesPerLoop"],
                },
                "timing": {
                    "type": "array", "items": {
                        "type": "string", "enum": timing
                    }
                }
            },
            "required": ["prerequisite", "type", "timing"],
        },
        {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "description": { "type": "string" },
                "type": { "type": "string", enum: AbilityTypeCreation },
            },
            "required": ["description", "type"],
        },
    ]

} as const;


type Names = typeof names;



// --- SCHEMA GENERATION ---
WriteSchema(generatePlotsSchema(names), 'plots');
WriteSchema(generateIncidentsSchema(names), 'incidents');
WriteSchema(generateRolesSchema(names), 'roles');
WriteSchema(generateCharactersSchema(names), 'characters');
WriteSchema(generateScriptsSchema(names), 'scripts');
WriteSchema(generateTragedySetsSchema(names), 'tragedys');

// Hilfsfunktion: Alle Dateien mit bestimmtem Namen rekursiv in einem Verzeichnis finden
function findAllJsonFiles(dir: string, filename: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findAllJsonFiles(filePath, filename));
        } else if (file === filename) {
            results.push(filePath);
        }
    }
    return results;
}


function collectNamesFromJsonFiles(type: string): Set<string> {
    const files = findAllJsonFiles(dataDir, `${type}.json`);
    const names = new Set<string>();
    for (const file of files) {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (Array.isArray(data)) {
            for (const entry of data) {
                if (typeof entry.name === 'string') {
                    names.add(entry.name);
                }
            }
        } else if (typeof data == 'object' && type in data && Array.isArray(data[type])) {
            for (const entry of data[type]) {
                if (typeof entry.name === 'string') {
                    names.add(entry.name);
                }
            }
        } else {
            console.log('Error: ', file, 'is not an array or object');
        }
    }
    return names;
}

function collectDataFromJsonFiles(type: string): any[] {
    const files = findAllJsonFiles(dataDir, `${type}.json`);
    return files.flatMap((file) => {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (Array.isArray(data)) {
            return data;
        } else if (typeof data == 'object' && type in data && Array.isArray(data[type])) {
            return data[type];
        } else {
            console.log('Error: ', file, 'is not an array or object');
        }
    });
}

// --- SCHEMA GENERATION BOILERPLATE ---
// 1. Plots Schema
function generatePlotsSchema({ roleNames }: Names) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Plots",
        type: "object",
        "additionalProperties": false,
        "properties": {
            "$schema": { "type": "string" },
            "plots": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "name": { "type": "string" },
                        "roles": {
                            "type": "object",
                            "additionalProperties": false,
                            "properties": {
                                ...Object.fromEntries(Array.from(roleNames).flatMap(r1 => Array.from(roleNames).map(r2 => r1 != r2 ? `${r1}|${r2}` : r1)).map((role) => [role,
                                    {
                                        "oneOf": [
                                            { "type": "number" },
                                            {
                                                "type": "array",
                                                "items": [
                                                    { type: 'number' },
                                                    { type: 'number' },
                                                ]
                                            }
                                        ]
                                    }] as const)),
                            }
                        },
                        "rules": {
                            "type": "array",
                            "items": {
                                ...Abilitie

                            }
                        }


                    },
                    "required": ["name"],

                }
            }
        }
    } as const;
}

// 2. Incidents Schema
function generateIncidentsSchema({ incidentNames }: Names) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Incidents",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "$schema": { "type": "string" },
            "incidents": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "name": { "type": "string", },
                        "faked": { "type": "boolean" },
                        "repeatedCulprit": { "type": "boolean" },
                        "mob": { "type": "number" },
                        ...scriptSpecified,
                        "type": {
                            "type": "string",
                            "enum": SpecificationType
                        },
                        "optional": {
                            "type": "boolean"
                        },
                        "effect": {
                            "type": "array",
                            "items":
                            {
                                "type": "object",
                                "additionalProperties": false,
                                "properties": {
                                    "description": { "type": "string" },
                                    "prerequisite": { "type": "string" },
                                    "type": { "type": "string", enum: AbilityType }
                                },
                                "anyOf": [
                                    {
                                        "required": ["description"],
                                    }, {
                                        "required": ["type"],
                                    }]
                            },
                        }
                    },
                    "required": ["name", "effect"],
                }
            }
        },
    } as const;
}

// 3. Roles Schema
function generateRolesSchema({ roleNames }: Names) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Roles",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "$schema": { "type": "string" },
            "roles": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "name": { "type": "string" },
                        "goodwillRefusel": { "type": "string", "enum": ['Optional', 'Mandatory', 'Puppeted'] },
                        "goodwillOutburst": { "type": "boolean" },
                        "unkillable": { "type": "boolean" },
                        "max": { "type": "number" },
                        "afterDeath": { "type": "boolean" },
                        ...scriptSpecified,
                        ...doseNotTriggerIncidentEffect,
                        "abilities": {
                            type: "array",
                            "items": Abilitie
                        }
                    },
                    "required": ["name"],
                }
            }
        }
    } as const;
}

// 4. Characters Schema
function generateCharactersSchema({ characterNames }: Names) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Characters",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "$schema": { "type": "string" },
            "characters": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "name": { "type": "string" },
                        "paranoiaLimit": { "type": "number", "minimum": 0, "maximum": 4 },
                        "tags": {
                            "type": "array",
                            "items": { "type": "string", "enum": tags }
                        },
                        "startLocation": {
                            "type": "array",
                            "items": { "type": "string", "enum": locations }
                        },
                        "forbiddenLocation": {
                            "type": "array",
                            "items": { "type": "string", "enum": locations }
                        },
                        "comesInLater": { "type": "boolean" },
                        "plotLessRole": { "type": "string", "enum": ['all', 'not in plots', 'plot duplicate'] },
                        "nonSelectableCharacter": { "type": "boolean" },
                        ...scriptSpecified,
                        ...doseNotTriggerIncidentEffect,
                        "abilities": {
                            type: "array",
                            "items": {
                                type: "object",
                                "oneOf": [
                                    {
                                        type: "object",
                                        properties: {
                                            "type": { "type": "string", enum: ["passive"] },
                                            "description": { "type": "string" },
                                        },
                                        required: ["description", "type"],
                                    },
                                    {
                                        type: "object",
                                        properties: {
                                            "type": { "type": "string", enum: ["active"] },
                                            "goodwillRank": { "type": "number" },
                                            "immuneToGoodwillRefusel": { "type": "boolean" },
                                            "restrictedToLocation": {
                                                type: "array",
                                                items: { type: "string", enum: locations }
                                            },
                                            "description": { "type": "string" }
                                        },
                                        required: ["description", "type", "goodwillRank"],
                                    }
                                ]
                            }
                        },

                        // ...weitere properties nach Bedarf...
                    },
                    "required": ["name"],

                }
            }
        }
    } as const;
}

// 5. Scripts Schema (Boilerplate, Details je nach Struktur)
function generateScriptsSchema({ tragedySetNames, plotNames, CharacterData, RolaData, PlotData, IncidentData, roleNames: allRoles, characterNames, namesPerTragedySet }: Names) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Script",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "$schema": { "type": "string" },
            "scripts": {
                "type": "array",
                "items": {
                    "oneOf": [
                        ...[...tragedySetNames].map((tragedySet) => {
                            const roleNamesInSet = namesPerTragedySet[tragedySet].roles;

                            const incidentsWithoutFake = Array.from(namesPerTragedySet[tragedySet].incidentNames).filter((name) => !IncidentData[name].faked);
                            const incidentsWithFake = Array.from(namesPerTragedySet[tragedySet].incidentNames).filter((name) => IncidentData[name].faked);

                            const plotsWithScriptSpecified = new Set(Object.values(PlotData).filter(x => x.scriptSpecified?.length > 0).map(x => x.name));
                            const plotsWithoutScriptSpecified = new Set(Object.values(PlotData).filter(x => (x.scriptSpecified?.length ?? 0) == 0).map(x => x.name));


                            return ({
                                "type": "object",
                                "additionalProperties": false,
                                "properties": {
                                    "title": { "type": "string" },
                                    "creator": { "type": "string" },
                                    "set": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "properties": {
                                            "name": { "type": "string" },
                                            "number": { "type": "number" },
                                        }
                                    },
                                    "tragedySet": { "type": "string", "enum": [tragedySet] },
                                    "daysPerLoop": { "type": "number" },
                                    "difficultySets": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "additionalProperties": false,
                                            "properties": {
                                                "numberOfLoops": { "type": "number" },
                                                "difficulty": { "type": "number" },
                                            }
                                        }
                                    },

                                    "mainPlot": {
                                        "type": "array",
                                        "items": {
                                            "oneOf": [
                                                {
                                                    "type": "string",
                                                    "enum": Array.from(namesPerTragedySet[tragedySet].mainPlotNames).filter((name) => !plotsWithScriptSpecified.has(name))
                                                },

                                                ...Array.from(namesPerTragedySet[tragedySet].mainPlotNames).filter(name => plotsWithScriptSpecified.has(name)).map((plotName) => {
                                                    return {
                                                        type: "array",
                                                        items: [
                                                            {
                                                                "type": "string",
                                                                "enum": [plotName]
                                                            }, {
                                                                type: "object",
                                                                "additionalProperties": false,
                                                                "properties": {
                                                                    ...Object.fromEntries(PlotData[plotName].scriptSpecified?.map(x => {
                                                                        return [x.name, x.type === "number"
                                                                            ? { "type": "number" }
                                                                            : x.type == 'location'
                                                                                ? { "type": "string", "enum": locations }
                                                                                : x.type == "plot"
                                                                                    ? { "type": "string", "enum": Array.from(namesPerTragedySet[tragedySet].plotNames) }
                                                                                    : { type: "string" }
                                                                        ] as const;
                                                                    }) ?? [])
                                                                }
                                                            }
                                                        ],
                                                    } as const
                                                }),



                                            ]
                                        }
                                    },

                                    "subPlots": {
                                        "type": "array",
                                        "items": {
                                            "oneOf": [
                                                {
                                                    "type": "string",
                                                    "enum": Array.from(namesPerTragedySet[tragedySet].subPlotNames).filter((name) => !plotsWithScriptSpecified.has(name))
                                                },

                                                ...Array.from(namesPerTragedySet[tragedySet].subPlotNames).filter(name => plotsWithScriptSpecified.has(name)).map((plotName) => {
                                                    return {
                                                        type: "array",
                                                        items: [
                                                            {
                                                                "type": "string",
                                                                "enum": [plotName]
                                                            }, {
                                                                type: "object",
                                                                "additionalProperties": false,
                                                                "properties": {
                                                                    ...Object.fromEntries(PlotData[plotName].scriptSpecified?.map(x => {
                                                                        return [x.name, x.type === "number"
                                                                            ? { "type": "number" }
                                                                            : x.type == 'location'
                                                                                ? { "type": "string", "enum": locations }
                                                                                : x.type == "plot"
                                                                                    ? { "type": "string", "enum": Array.from(namesPerTragedySet[tragedySet].plotNames) }
                                                                                    : { type: "string" }
                                                                        ] as const;
                                                                    }) ?? [])
                                                                }
                                                            }
                                                        ],
                                                    } as const
                                                }),



                                            ]
                                        }
                                    },



                                    "incidents": {
                                        "type": "array", "items": {
                                            "oneOf": [
                                                ...[{
                                                    "type": "object",
                                                    "additionalProperties": false,
                                                    "properties": {
                                                        "day": { "type": "number" },
                                                        "incident":
                                                        {
                                                            "type": "string",
                                                            "enum": incidentsWithoutFake.filter((name) => !names.mobIncidentNames.has(name))
                                                        },
                                                        "culprit": { "type": "string", "enum": Array.from(characterNames) }
                                                    },
                                                    "required": ["incident", "culprit", 'day'],
                                                } as const].filter(() => incidentsWithoutFake.filter((name) => !names.mobIncidentNames.has(name)).length > 0),
                                                ...[{
                                                    "type": "object",
                                                    "additionalProperties": false,
                                                    "properties": {
                                                        "day": { "type": "number" },
                                                        "incident":
                                                        {
                                                            "type": "string",
                                                            "enum": incidentsWithoutFake.filter((name) => names.mobIncidentNames.has(name))
                                                        },
                                                        "culprit": { "type": "string", "enum": locations }
                                                    },
                                                    "required": ["incident", "culprit", "day"],
                                                } as const].filter(() => incidentsWithoutFake.filter((name) => names.mobIncidentNames.has(name)).length > 0),


                                                ...[{
                                                    "type": "object",
                                                    "additionalProperties": false,
                                                    "properties": {
                                                        "day": { "type": "number" },
                                                        "incident":
                                                        {
                                                            type: "array",
                                                            "items": [
                                                                {
                                                                    "type": "string",
                                                                    "enum": incidentsWithFake.filter((name) => !names.mobIncidentNames.has(name))
                                                                }, {
                                                                    "type": "string",
                                                                    "enum": incidentsWithoutFake.filter((name) => !names.mobIncidentNames.has(name))
                                                                }]
                                                        },
                                                        "culprit": { "type": "string", "enum": Array.from(characterNames) }
                                                    },
                                                    "required": ["incident", "culprit", 'day'],
                                                } as const].filter(() => incidentsWithFake.filter((name) => !names.mobIncidentNames.has(name)).length > 0),
                                                ...[{
                                                    "type": "object",
                                                    "additionalProperties": false,
                                                    "properties": {
                                                        "day": { "type": "number" },
                                                        "incident":
                                                        {
                                                            type: "array",
                                                            "items": [
                                                                {
                                                                    "type": "string",
                                                                    "enum": incidentsWithFake.filter((name) => !names.mobIncidentNames.has(name))
                                                                }, {
                                                                    "type": "string",
                                                                    "enum": incidentsWithoutFake.filter((name) => !names.mobIncidentNames.has(name))
                                                                }]
                                                        },
                                                        "culprit": { "type": "string", "enum": locations }
                                                    },
                                                    "required": ["incident", "culprit", "day"],
                                                } as const].filter(() => incidentsWithFake.filter((name) => names.mobIncidentNames.has(name)).length > 0)


                                            ]
                                        }
                                    },
                                    "cast": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "properties": {
                                            ...Object.fromEntries(Array.from(characterNames).map((character) => {

                                                const rolesWithScriptSpecified = Object.values(RolaData).filter(x => x.scriptSpecified?.length > 0).map(x => x.name);

                                                const characterAlwaysScpecyfiedExtra = (CharacterData[character].scriptSpecified?.length ?? 0) > 0 || CharacterData[character].startLocation.length > 1;


                                                const roleNames = roleNamesInSet;
                                                return [character, {
                                                    "oneOf": [
                                                        ...[
                                                            {
                                                                "type": "string",
                                                                "enum": Array.from(roleNames).filter(r => !rolesWithScriptSpecified.includes(r))
                                                            } as const].filter(() => (!characterAlwaysScpecyfiedExtra && Array.from(roleNames).filter(r => !rolesWithScriptSpecified.includes(r)).length > 0)),
                                                        ...[
                                                            {
                                                                "type": "array",
                                                                "items": [
                                                                    {
                                                                        "type": "string",
                                                                        "enum": Array.from(roleNames).filter(r => !rolesWithScriptSpecified.includes(r))
                                                                    },
                                                                    {
                                                                        "type": "object",

                                                                        "additionalProperties": false,
                                                                        "properties": {

                                                                            ...Object.fromEntries([['Start Location', {
                                                                                "type": "string",
                                                                                "enum": CharacterData[character].startLocation
                                                                            }] as const].filter(() => CharacterData[character].startLocation.length > 1)),

                                                                            ...Object.fromEntries(CharacterData[character].scriptSpecified?.map(x => {
                                                                                return [x.name, x.type === "number"
                                                                                    ? { "type": "number" }
                                                                                    : x.type == 'location'
                                                                                        ? { "type": "string", "enum": locations }
                                                                                        : x.type == "plot"
                                                                                            ? { "type": "string", "enum": Array.from(namesPerTragedySet[tragedySet].plotNames) }
                                                                                            : { type: "string" }
                                                                                ] as const;
                                                                            }) ?? [])
                                                                        }
                                                                    }]
                                                            } as const
                                                        ].filter(() => characterAlwaysScpecyfiedExtra && Array.from(roleNames).filter(r => !rolesWithScriptSpecified.includes(r)).length > 0),

                                                        ...rolesWithScriptSpecified
                                                            .filter((role) => RolaData[role].scriptSpecified?.length > 0)
                                                            .map((role) => {
                                                                return {
                                                                    "type": "array",
                                                                    "items": [
                                                                        {
                                                                            type: 'string',
                                                                            "enum": [role]
                                                                        },
                                                                        {
                                                                            "type": "object",
                                                                            "additionalProperties": false,
                                                                            "properties": {
                                                                                ...Object.fromEntries(CharacterData[character].scriptSpecified?.map(x => {
                                                                                    return [x.name, x.type === "number"
                                                                                        ? { "type": "number" }
                                                                                        : x.type == 'location'
                                                                                            ? { "type": "string", "enum": locations }
                                                                                            : x.type == "plot"
                                                                                                ? { "type": "string", "enum": Array.from(namesPerTragedySet[tragedySet].plotNames) }
                                                                                                : { type: "string" }
                                                                                    ] as const;
                                                                                }) ?? []),
                                                                                ...Object.fromEntries(RolaData[role].scriptSpecified?.map(x => {
                                                                                    return [x.name, x.type === "number"
                                                                                        ? { "type": "number" }
                                                                                        : x.type == 'location'
                                                                                            ? { "type": "string", "enum": locations }
                                                                                            : x.type == "plot"
                                                                                                ? { "type": "string", "enum": Array.from(namesPerTragedySet[tragedySet].plotNames) }
                                                                                                : { type: "string" }
                                                                                    ] as const;
                                                                                }) ?? [])
                                                                            }
                                                                        } as const
                                                                    ]
                                                                } as const
                                                            })


                                                    ]
                                                }] as const;





                                            })),
                                        }
                                    },
                                    "specialRules": {
                                        "type": "array",
                                        "items": { "type": "string" }
                                    },
                                    "specifics": { "type": "string" },
                                    "story": { "type": "string" },
                                    "mastermindHints": { "type": "string" },

                                },
                                "required": ["title", "mainPlot", "subPlots", "incidents", "cast"],

                            } as const)
                        })
                    ]
                }
            }
        }
    } as const;
}

function generateTragedySetsSchema({ plotNames, incidentNames }: Names) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Tragedy Set",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "tragedys": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "name": { "type": "string" },
                        "numberOfMainPlots": { "type": "integer" },
                        "numberOfSubPlots": { "type": "integer" },
                        "mainPlots": {
                            "type": "array",
                            "items": { "type": "string", "enum": Array.from(plotNames) }
                        },
                        "subPlots": {
                            "type": "array",
                            "items": { "type": "string", "enum": Array.from(plotNames) }
                        },
                        "incidents": {
                            "type": "array",
                            "items": { "type": "string", "enum": Array.from(incidentNames) }
                        },
                        "aditionalRoles": {
                            "type": "array",
                            "items": { "type": "string", "enum": Array.from(names.roleNames) }
                        },
                        "extraRules": {
                            "type": "array", "items": {
                                "type": "object",
                                "additionalProperties": false,
                                "properties": {
                                    "name": {
                                        type: "string"
                                    },
                                    "description": {
                                        type: "string"
                                    }
                                }

                            }
                        }
                    },

                    "required": ["name", "mainPlots", "subPlots", "incidents"],

                }
            }
        }
    } as const;
}

// helper function to make TYpe all arrays readonly recursively
type ReadonlyArrayTransform<T> = T extends readonly (infer U)[]
    ? readonly ReadonlyArrayTransform<U>[]
    : T extends object ? {
        readonly [K in keyof T]: ReadonlyArrayTransform<T[K]> }
    : T;

function WriteSchema(schema: ReadonlyArrayTransform<JSONSchema>, type: string) {
    const outPath = [dataDir, staticDir].map(dir => path.join(dir, `${type}.schema.json`));
    outPath.forEach((outPath) => {
        console.log('Schema geschrieben nach', outPath);
        fs.writeFileSync(outPath, JSON.stringify(schema, null, 2), 'utf-8');
    });
    compile(schema as JSONSchema, type).then((result) => {
        fs.writeFileSync(path.join(srcDir, `${type}.g.ts`), result, { encoding: 'utf-8' });
    });


}

