import type { keywordsLookup} from "../../../../../data";
import type { TragedySetName } from "../../../../../model/tragedySets";
import type { PageLoad } from "./$types";


export const load: PageLoad = ({ params }) => {
    return {...params, id : params.id as TragedySetName };
};