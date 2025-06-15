import type { IncidentName } from "../../../../../model/incidents";
import type { RoleNameSingle } from "../../../../../model/roles";
import type { PageLoad } from "./$types";


export const load: PageLoad = ({ params }) => {
    return {...params, id : params.id as IncidentName};
};