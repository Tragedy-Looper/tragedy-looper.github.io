import { browser } from "$app/environment";
import { isCharacterId } from "./data";
import { type CharacterName } from "./model/characters";
import { isScriptIncidentWithoutCulprit, type ScriptIncidentPlayer } from "./model/script";
import { isTragedySetName, type TragedySetName } from "./model/tragedySets";

export function parseSearchForPlayerAid(searchParams: URLSearchParams | undefined) {

    if (!searchParams || !browser) {
        return [undefined, undefined, undefined, undefined] as const;
    }

    const tragedySet = searchParams?.getAll('set').filter(isTragedySetName)[0];
    const cast = searchParams?.getAll('cast').filter(isCharacterId);
    const incidents = searchParams
        ?.getAll('incident')
        .map((x) => {
            try {
                return JSON.parse(x);
            } catch (e) {
                return {};
            }
        })
        .filter(isScriptIncidentWithoutCulprit);
    const specialRules = searchParams?.getAll('special');


    return [tragedySet, cast, incidents, specialRules] as const;

}
export function stringifySearchForPlayerAid(tragedySet: TragedySetName, cast: readonly CharacterName[], incidents: readonly ScriptIncidentPlayer[], specialRules: readonly string[]): URLSearchParams {

    const searchParams = new URLSearchParams();
    searchParams.append('set', tragedySet);
    cast.forEach(c => searchParams.append('cast', c))
    incidents.forEach(c => searchParams.append('incident', JSON.stringify(c)))
    specialRules.forEach(c => searchParams.append('special', c))

    return searchParams;
}
