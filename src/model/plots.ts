import * as data from "../data";
import { toRecord } from "../misc";
import type { ScriptSpecified } from "./core";
import type { Abilitie, RoleName } from "./roles";

export type Plot = Plots[PlotName];
export type Plots = typeof plotsInternal;
type PlotInternal = {
    name: string,
    roles: Readonly<Partial<Record<RoleName, number | readonly [number, number]>>>,
    rules: readonly Abilitie[]
} & ScriptSpecified;


export type PlotName = keyof Plots;




const plotsInternal = toRecord([
    ...data.plots,

    


] as const satisfies readonly PlotInternal[], 'name');


export function isPlotName(name: string): name is PlotName {
    return name in plotsInternal;
}

export const plots = plotsInternal as Record<PlotName, Plot & { rules: readonly Required<Abilitie>[] }>;

