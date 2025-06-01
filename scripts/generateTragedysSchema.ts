import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { compile, JSONSchema } from 'json-schema-to-typescript'
import { toPascalCase } from './../src/misc';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const staticDir = path.join(__dirname, '../static');
const srcDir = path.join(__dirname, '../src');

const targetSchemaLocations = [dataDir, staticDir, srcDir];
const targetTypeScriptDefinitionLocations = [srcDir, __dirname];


const names = {
    tags: collectNamesFromJsonFiles('tags'),
    keywords: collectIdsFromJsonFiles('keywords'),
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





const SpecificationType = ['location', 'incident', 'role', 'character', 'plot', 'number', 'text'] as const;


const AbilityTypeCreation = ['Script creation'] as const;
const AbilityTypeDefault = ['Optional', 'Mandatory'] as const;

const AbilityTypeLose = [
    'Mandatory Loss condition: Protagonists Death',
    'Optional Loss condition: Protagonists Death',
    'Delayed Loss condition: Protagonists Death',
    'Loss condition: Tragedy',
    'Optional Loss condition: Tragedy'
] as const;
const AbilityType = [...AbilityTypeLose, ...AbilityTypeCreation, ...AbilityTypeDefault] as const;

const timing = ['Always', 'Day Start', 'Day End', 'Mastermind Ability', 'Card resolve', 'Loop End', 'Loop Start'
    , 'Last Day', 'First Day', 'Incident step', 'Incident trigger', 'On character death', 'When this role is to be reveald'
    , 'Mastermind Action step', 'Goodwill ablility step', 'After Goodwill Ability used'] as const;

const scriptSpecified = {
    "scriptSpecified": {
        "type": "array",
        "items": {
            oneOf: [{
                "type": "object",
                "additionalProperties": false,
                "properties": {
                    "name": {
                        "type": "string",
                    },
                    "type": {
                        "type": "string",
                        "enum": SpecificationType.filter(x => x != 'plot')
                    },
                    "optional": {
                        "type": "boolean"
                    },
                },
                "required": ["name", "type"],
            }, {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                    "name": {
                        "type": "string",
                    },
                    "type": {
                        "type": "string",
                        "enum": SpecificationType.filter(x => x == 'plot')
                    },
                    "addRolesForPlot": {
                        "type": "boolean"
                    },
                    "optional": {
                        "type": "boolean"
                    },
                },
                "required": ["name", "type", "addRolesForPlot"],
            },
            ]
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
                            ],
                            "minItems": 2,
                            "maxItems": 2,

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
                            ],
                            "minItems": 2,
                            "maxItems": 2,

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
WriteSchema(generateKeywordsSchema(names), 'keywords');
WriteSchema(generateTagssSchema(names), 'tags');
WriteSchema(generatePlotsSchema(names), 'plots');
WriteSchema(generateIncidentsSchema(names), 'incidents');
WriteSchema(generateRolesSchema(names), 'roles');
WriteSchema(generateCharactersSchema(names), 'characters');
WriteSchema(generateScriptsSchema(names), 'scripts');
WriteSchema(generateTragedySetsSchema(names), 'tragedys');

// Hilfsfunktion: Alle Dateien mit bestimmtem Namen rekursiv in einem Verzeichnis finden
function findAllJsonFiles(dir: string, ...filename: string[]): string[] {

    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findAllJsonFiles(filePath, ...filename));
        } else if (filename.includes(file)) {
            results.push(filePath);
        }
    }
    return results;
}

export function transformJsoncToJSON(text: string): string {

    // run over the text for the first occurence of a //, but skip any that are inside a string
    let inString = false;
    let inComment = false;
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        // Handle string start/end (ignore escaped quotes)
        if (!inComment && char === '"' && (i === 0 || text[i - 1] !== '\\')) {
            inString = !inString;
            result += char;
        }
        // Handle single-line comment //
        else if (!inString && char === '/' && nextChar === '/') {
            inComment = true;
            i++; // skip next character
        }
        // Handle multi-line comment /*
        else if (!inString && char === '/' && nextChar === '*') {
            inComment = true;
            let endIdx = text.indexOf('*/', i + 2);
            if (endIdx === -1) {
                // Unterminated comment, skip rest
                break;
            }
            i = endIdx + 1; // skip to end of comment
        }
        // End single-line comment at newline
        else if (inComment && char === '\n') {
            inComment = false;
            result += char;
        }
        // Not in comment, add char
        else if (!inComment) {
            result += char;
        }
        // If in comment, skip char (except for newline above)
    }

    // remove trailing commas
    result = result.replace(/,\s*([\]}])/g, '$1');
    return result;
}

function collectIdsFromJsonFiles(type: string): Set<string> {
    const files = findAllJsonFiles(dataDir, `${type}.json`, `${type}.jsonc`);
    const names = new Set<string>();
    for (const file of files) {
        const text = fs.readFileSync(file, 'utf-8');

        // Remove comments if it's a JSONC file that is not in a string
        const jsonText = transformJsoncToJSON(text);
        const data = JSON.parse(jsonText);
        if (Array.isArray(data)) {
            for (const entry of data) {
                if (typeof entry.id === 'string') {
                    names.add(entry.id);
                }
            }
        } else if (typeof data == 'object' && type in data && Array.isArray(data[type])) {
            for (const entry of data[type]) {
                if (typeof entry.id === 'string') {
                    names.add(entry.id);
                }
            }
        } else {
            console.log('Error: ', file, 'is not an array or object');
        }
    }
    return names;
}
function collectNamesFromJsonFiles(type: string): Set<string> {
    const files = findAllJsonFiles(dataDir, `${type}.json`, `${type}.jsonc`);
    const names = new Set<string>();
    for (const file of files) {
        const text = fs.readFileSync(file, 'utf-8');

        // Remove comments if it's a JSONC file that is not in a string
        const jsonText = transformJsoncToJSON(text);
        const data = JSON.parse(jsonText);
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
    const files = findAllJsonFiles(dataDir, `${type}.json`, `${type}.jsonc`);
    return files.flatMap((file) => {
        const data = JSON.parse(transformJsoncToJSON(fs.readFileSync(file, 'utf-8')));
        if (Array.isArray(data)) {
            return data;
        } else if (typeof data == 'object' && type in data && Array.isArray(data[type])) {
            return data[type];
        } else {
            console.log('Error: ', file, 'is not an array or object');
        }
    });
}

function generateTagssSchema({ roleNames }: Names) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Tags",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "$schema": { "type": "string" },
            "tags": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "name": { "type": "string" },
                        "description": { "type": "string" },
                        "showInGmScreen": { "type": "boolean" },
                        "hideInPlayerScreen": { "type": "boolean" },
                    },
                    "required": ["name"],
                }
            }
        }
    } as const;
}

function generateKeywordsSchema({ roleNames }: Names) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "keywords",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "$schema": { "type": "string" },
            "keywords": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "id": { "type": "string" },
                        "name": { "type": "string" },
                    },
                    "required": ["name", "id"],
                }
            }
        }
    } as const;
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
                                                ],
                                                "minItems": 2,
                                                "maxItems": 2,
                                            }
                                        ]
                                    }] as const)),
                            }
                        },
                        ...scriptSpecified,
                        "rules": {
                            "type": "array",
                            "items": {
                                ...Abilitie

                            }
                        }


                    },
                    "required": ["name", "roles", "rules"],

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
function generateRolesSchema({ tags }: Names) {
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
                        "tags": {
                            "type": "array",
                            "items": { "type": "string", "enum": [...tags] }
                        },
                        "max": { "type": "number" },
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
function generateCharactersSchema({ keywords }: Names) {
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
                        "edition": { "type": "string" },
                        "paranoiaLimit": { "type": "number", "minimum": 0, "maximum": 4 },
                        "tags": {
                            "type": "array",
                            "items": { "type": "string", "enum": [...keywords] }
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
                                        "additionalProperties": false,
                                        properties: {
                                            "type": { "type": "string", enum: ["passive"] },
                                            "description": { "type": "string" },
                                        },
                                        required: ["description", "type"],
                                    },
                                    {
                                        type: "object",
                                        "additionalProperties": false,
                                        properties: {
                                            "type": { "type": "string", enum: ["active"] },
                                            "goodwillRank": { "type": "number" },
                                            "immuneToGoodwillRefusel": { "type": "boolean" },
                                            "timesPerLoop": { "type": "number" },
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
                    "required": ["name", "tags", "startLocation"],

                }
            }
        }
    } as const;
}

// 5. Scripts Schema (Boilerplate, Details je nach Struktur)
function generateScriptsSchema({ tragedySetNames, plotNames, CharacterData, RolaData, PlotData, incidentNames, IncidentData, roleNames: allRoles, characterNames, namesPerTragedySet }: Names) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Scripts",
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

                            const incidentsInTragedy = {
                                incidentsWithoutFake: Array.from(namesPerTragedySet[tragedySet].incidentNames).filter((name) => !IncidentData[name].faked),
                                incidentsWithFake: Array.from(namesPerTragedySet[tragedySet].incidentNames).filter((name) => IncidentData[name].faked)
                            };

                            const incidentsNotInTragedySet = {
                                incidentsWithFake: Array.from(incidentNames).filter((name) => !namesPerTragedySet[tragedySet].incidentNames.has(name) && IncidentData[name].faked),
                                incidentsWithoutFake: Array.from(incidentNames).filter((name) => !namesPerTragedySet[tragedySet].incidentNames.has(name) && !IncidentData[name].faked),
                            }

                            const plotsWithScriptSpecified = new Set(Object.values(PlotData).filter(x => x.scriptSpecified?.length > 0).map(x => x.name));
                            const plotsWithoutScriptSpecified = new Set(Object.values(PlotData).filter(x => (x.scriptSpecified?.length ?? 0) == 0).map(x => x.name));


                            return ({
                                "type": "object",
                                "additionalProperties": false,
                                "properties": {
                                    "title": { "type": "string" },
                                    "creator": { "type": "string" },
                                    "description": { "type": "string" },
                                    "rating": {
                                        "type": "number",
                                        "minimum": 1,
                                        "maximum": 10
                                    },
                                    "set": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "additionalProperties": false,
                                            "properties": {
                                                "name": { "type": "string" },
                                                "number": { "type": "number" },
                                            }
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
                                            },
                                            "required": [
                                                "numberOfLoops",
                                                "difficulty",
                                            ]
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
                                                        "minItems": 2,
                                                        "maxItems": 2,
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
                                                        "minItems": 2,
                                                        "maxItems": 2,
                                                    } as const
                                                }),



                                            ]
                                        }
                                    },



                                    "incidents": {
                                        "type": "array", "items": {
                                            "oneOf": [
                                                ...[incidentsInTragedy, incidentsNotInTragedySet].flatMap(({ incidentsWithoutFake, incidentsWithFake }, index) => ([
                                                    ...[{
                                                        "type": "object",
                                                        "additionalProperties": false,
                                                        "properties": {
                                                            "day": { "type": "number" },
                                                            ...Object.fromEntries([["notTragedySpecified", {
                                                                "type": "boolean",
                                                                "enum": [true]
                                                            }]].filter(() => index === 1)),
                                                            "incident":
                                                            {
                                                                "type": "string",
                                                                "enum": incidentsWithoutFake.filter((name) => !names.mobIncidentNames.has(name))
                                                            },
                                                            "culprit": { "type": "string", "enum": Array.from(characterNames) }
                                                        },
                                                        "required": index === 0 ? ["incident", "culprit", 'day'] : ["incident", "culprit", 'day', 'notTragedySpecified'],
                                                    } as const].filter(() => incidentsWithoutFake.filter((name) => !names.mobIncidentNames.has(name)).length > 0),
                                                    ...[{
                                                        "type": "object",
                                                        "additionalProperties": false,
                                                        "properties": {
                                                            "day": { "type": "number" },
                                                            ...Object.fromEntries([["notTragedySpecified", {

                                                                "type": "boolean",
                                                                "enum": [true]

                                                            }]].filter(() => index === 1)),
                                                            "incident":
                                                            {
                                                                "type": "string",
                                                                "enum": incidentsWithoutFake.filter((name) => names.mobIncidentNames.has(name))
                                                            },
                                                            "culprit": { "type": "string", "enum": locations }
                                                        },
                                                        "required": index === 0 ? ["incident", "culprit", 'day'] : ["incident", "culprit", 'day', 'notTragedySpecified'],
                                                    } as const].filter(() => incidentsWithoutFake.filter((name) => names.mobIncidentNames.has(name)).length > 0),


                                                    ...[{
                                                        "type": "object",
                                                        "additionalProperties": false,
                                                        "properties": {
                                                            "day": { "type": "number" },
                                                            ...Object.fromEntries([["notTragedySpecified", {
                                                                "type": "boolean",
                                                                "enum": [true]
                                                            }]].filter(() => index === 1)),
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
                                                                    }],
                                                                "minItems": 2,
                                                                "maxItems": 2,
                                                            },
                                                            "culprit": { "type": "string", "enum": Array.from(characterNames) }
                                                        },
                                                        "required": index === 0 ? ["incident", "culprit", 'day'] : ["incident", "culprit", 'day', 'notTragedySpecified'],
                                                    } as const].filter(() => incidentsWithFake.filter((name) => !names.mobIncidentNames.has(name)).length > 0),
                                                    ...[{
                                                        "type": "object",
                                                        "additionalProperties": false,
                                                        "properties": {
                                                            "day": { "type": "number" },
                                                            ...Object.fromEntries([["notTragedySpecified", {
                                                                "type": "boolean",
                                                                "enum": [true]
                                                            }]].filter(() => index === 1)),
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
                                                                    }],
                                                                "minItems": 2,
                                                                "maxItems": 2,
                                                            },
                                                            "culprit": { "type": "string", "enum": locations }
                                                        },
                                                        "required": index === 0 ? ["incident", "culprit", 'day'] : ["incident", "culprit", 'day', 'notTragedySpecified'],
                                                    } as const].filter(() => incidentsWithFake.filter((name) => names.mobIncidentNames.has(name)).length > 0)

                                                ] as const))


                                            ]
                                        }
                                    },
                                    "cast": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "properties": {
                                            ...Object.fromEntries(Array.from(characterNames).map((character) => {

                                                const rolesWithScriptSpecified = Object.values(RolaData).filter(x => x.scriptSpecified?.length > 0).map(x => x.name);

                                                const characterAlwaysScpecyfiedExtra = (CharacterData[character].scriptSpecified?.length ?? 0) > 0;


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

                                                                            // This would add start location setting to the character if it has more then one to choose
                                                                            // ...Object.fromEntries([['Start Location', {
                                                                            //     "type": "string",
                                                                            //     "enum": CharacterData[character].startLocation
                                                                            // }] as const].filter(() => CharacterData[character].startLocation.length > 1)),

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
                                                                    }],
                                                                "minItems": 2,
                                                                "maxItems": 2,
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
                                                                    ],
                                                                    "minItems": 2,
                                                                    "maxItems": 2,
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
                                    "victory-conditions": { "type": "string" },
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
        "title": "Tragedy Sets",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "$schema": { "type": "string" },
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
    const outPath = targetSchemaLocations.map(dir => path.join(dir, `${type}.schema.json`));
    outPath.forEach((outPath) => {
        console.log('Schema geschrieben nach', outPath);
        fs.writeFileSync(outPath, JSON.stringify(schema, null, 2), 'utf-8');
    });
    // hack, we only use anyOf in one place and that prevents the schema from being transformed to typescript type
    compile(flterObject(schema, (key, value) => key !== 'anyOf') as JSONSchema, type).then((result) => {

        const typeName = `${toPascalCase(type).replace(/s$/, '')}`;

        targetTypeScriptDefinitionLocations.map(dir => {
            const srcDir = path.join(dir, `${type}.g.ts`);

            console.log('TypeScript Definition geschrieben nach', srcDir);
            fs.writeFileSync(srcDir, `
export type ${typeName} = Exclude<(${toPascalCase(type)})['${type}'], undefined>[number]; 

${result}`, { encoding: 'utf-8' });
        });
    });
}



function flterObject<T>(obj: T, f: (key: unknown, value: unknown) => boolean): T {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map(x => flterObject(x, f)) as T;
    }
    const keys = Object.keys(obj) as (keyof T)[];
    const filteredKeys = keys.filter(key => f(key, obj[key]));
    const filteredObj = {} as T;
    filteredKeys.forEach(key => {
        filteredObj[key] = flterObject(obj[key], f);
    });
    return filteredObj;
}