import { zip, unzip } from "gzip-js";


const zipParameterName = 'zip';


export function generateUrl(url: string, params: Record<string, unknown>): string {
    const zipData = generateZipParameter(params);
    const rawData = generateRawParameter(params);
    return `${url}${zipData.length < rawData.length ? zipData : rawData}`;
}

function generateZipParameter(params: Record<string, unknown>): string {
    const data = JSON.stringify(params);
    const zipped = zip(new TextEncoder().encode(data));
    const binaryString = String.fromCharCode(...zipped);
    return `?${zipParameterName}=${encodeURIComponent(btoa(binaryString))}`;
}
function generateRawParameter(params: Record<string, unknown>): string {
    const entries = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`);
    return `?${entries.join('&')}`;
}


export function getParams(params: URLSearchParams): Record<string, unknown> {
    const zipData = params.get(zipParameterName);
    if (zipData) {
        return getParamsFromZip(zipData);
    } else {
        return getParamsFromRaw(params);
    }

}


function getParamsFromZip(zipData: string): Record<string, unknown> {
    const decoded = atob(decodeURIComponent(zipData));
    const uarray = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
    const unziped = unzip(uarray);
    const jsonData = new TextDecoder('utf-8').decode(new Uint8Array(unziped));
    return JSON.parse(jsonData);
}

function getParamsFromRaw(params: URLSearchParams): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of params.entries()) {
        try {
            result[key] = JSON.parse(decodeURIComponent(value));
        } catch (e) {
            result[key] = decodeURIComponent(value);
        }
    }
    return result;
}



