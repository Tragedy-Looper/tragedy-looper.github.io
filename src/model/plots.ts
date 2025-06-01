import * as data from "../data";
import { toRecord } from "../misc";
import type { Plot } from "../plots.g";
import type { ScriptSpecified } from "./core";
import type { Abilitie, RoleName } from "./roles";



export type PlotName = keyof typeof data.plotsLookup;




export function isPlotName(name: unknown): name is PlotName {
    return typeof name === 'string' && name in data.plotsLookup;
}


