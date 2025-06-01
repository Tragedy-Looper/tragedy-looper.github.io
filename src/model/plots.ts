import * as data from "../data";
import { toRecord } from "../misc";
import type { Plot } from "../plots.g";
import type { ScriptSpecified } from "./core";
import type { Abilitie, RoleName } from "./roles";

export type Plots = typeof plotsInternal;


export type PlotName = keyof Plots;




const plotsInternal = toRecord([
    ...data.plots,

    


] as const satisfies readonly Plot[], 'id');


export function isPlotName(name: string): name is PlotName {
    return name in plotsInternal;
}

export const plots = plotsInternal as Record<PlotName, Plot>;

