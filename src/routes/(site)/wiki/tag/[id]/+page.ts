import type { tagsLookup, tragedysLookup } from "../../../../../data";
import type { RoleNameSingle } from "../../../../../model/roles";
import type { PageLoad } from "./$types";


export const load: PageLoad = ({ params }) => {
    return {...params, id : params.id as keyof typeof tagsLookup };
};