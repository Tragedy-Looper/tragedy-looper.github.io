import type { keywordsLookup} from "../../../../../data";
import type { PageLoad } from "./$types";


export const load: PageLoad = ({ params }) => {
    return {...params, id : params.id as keyof typeof keywordsLookup };
};