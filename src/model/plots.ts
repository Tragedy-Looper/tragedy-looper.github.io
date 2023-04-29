import * as data from "../data";
import { toRecord } from "../misc";
import type { ScriptSpecified } from "./core";
import type { Abilitie, RoleName } from "./roles";

export type Plot = Plots[PlotName];
export type Plots = typeof plotsInternal;
type PlotInternal = {
    name: string,
    roles: Readonly<Partial<Record<RoleName, number | readonly [number, number]>> & { conditonal?: readonly (Readonly<Partial<Record<RoleName, string>>>)[] }>,
    rules: readonly Abilitie[]
} & ScriptSpecified;


export type PlotName = keyof Plots;




const plotsInternal = toRecord([
    ...data.plots,

    {
        name: 'The Forbidden Future',
        rules: [
            {
                type: 'Loss condition: Tragedy',
                timing: ['Loop End'],
                prerequisite: 'Be in the Light World',
            },
        ],
        roles: {
            conditonal: [
                {
                    Obstinate: 'In The Light World',
                    "Key Person": 'In The Dark World',
                }
            ],
            Marionette: 1,
            Storyteller: 1,
        }
    },
    {
        name: 'Fairy-Tale Murderer',
        rules: [
        ],
        roles: {
            "Key Person": 1,
            Lullaby: 1,
            Brain: 1,
        }
    },
    {
        name: 'Mother Goose Mystery',
        rules: [
            {
                type: 'Loss condition: Tragedy',
                timing: ['Loop End'],
                prerequisite: 'There are X+ corpses. (X is the current loop number, max: 3)',
            },
        ],
        roles: {
            "Marionette": 1,
            Storyteller: 1,
        }
    },
    {
        name: 'Dimensional Merger',
        rules: [
            {
                type: 'Loss condition: Tragedy',
                timing: ['Loop End'],
                prerequisite: 'Last Will or Left Behind triggered this loop',
            },
        ],
        roles: {
            Storyteller: 1,
            "Shifter": 1,
            "Fragment": 1,
        }
    },
    {
        name: 'Into Nothingness',
        rules: [
            {
                type: 'Loss condition: Tragedy',
                timing: ['Loop End'],
                prerequisite: '3+ total Extra Gauge and Intrigue on this Plot’s (living or dead) Obstinate',
            },
        ],
        roles: {
            Obstinate: 1,
            "Marionette": 1,
            "Brain": 1,
        }
    },

    {
        name: 'Jekyll and Hyde',
        rules: [
        ],
        roles: {
            conditonal: [
                {
                    "Key Person": "In The Light World",
                    "Brain": "In The Dark World",
                }
            ],
            "Marionette": 1,
        }
    },
    {
        name: 'The Plaguebringer',
        rules: [
        ],
        roles: {
            conditonal: [
                {
                    "Pied Piper": "In The Light World",
                    "Gossip": "In The Dark World",
                }
            ],
        }
    },
    {
        name: 'Puppeteer’s Strings',
        rules: [
            {
                type: 'Mandatory',
                timing: ['Always'],
                description: 'All Goodwill Refusal becomes Puppeted Goodwill Refusal.'
            },
        ],
        roles: {
            conditonal: [
                {
                    "Serial Killer": "In The Dark World",
                }
            ],
            "Fragment": 1,
            "Alice": 1,
        }
    },
    {
        name: 'Throguh the Looking-Glass',
        rules: [
            {
                type: 'Script creation',
                description: 'Alice must be a Girl.'
            },
        ],
        roles: {
            conditonal: [
                {
                    "Conspiracy Theorist": "In The Light World",
                    "Serial Killer": "In The Dark World",
                }
            ],
            "Alice": 1,
        }
    },
    {
        name: 'Crossing World Lines',
        rules: [
            {
                type: 'Mandatory',
                timing: ['Loop Start'],
                prerequisite: 'even numbered loops',
                description: 'Mastermind gains Despair +1.'
            },
            {
                type: 'Mandatory',
                timing: ['Loop Start', 'Last Day'],
                description: 'Protagonists gain Hope +1.'
            },
        ],
        roles: {
            "Conspiracy Theorist": 1,
        }
    },
    {
        name: 'Unspeakable Horrors',
        rules: [
            {
                type: 'Optional Loss condition: Character Death',
                timing: ['Day End'],
                prerequisite: 'Extra Gauge is 3+',
            },
        ],
        roles: {
            conditonal: [
                {
                    "Conspiracy Theorist": "In The Light World",
                    "Obstinate": "In The Dark World",
                }
            ],
            "Gossip": 1,
        }
    },
    {
        name: 'Hysteria Virus',
        rules: [
            {
                type: 'Mandatory',
                timing: ['Always'],
                prerequisite: 'In the Dark World',
                description: 'Persons/Fragments with 2+ kinds of counters become Serial Killers.'
            },
        ],
        roles: {
            "Fragment": 1,
            "Conspiracy Theorist": 1,
            "Gossip": 1,
        }
    },

] as const satisfies readonly PlotInternal[], 'name');


export function isPlotName(name: string): name is PlotName {
    return name in plotsInternal;
}

export const plots = plotsInternal as Record<PlotName, Plot & { rules: readonly Required<Abilitie>[] }>;

