import { browser } from "$app/environment";
import { type ScriptName, isScript, scripts } from "./model/script";
import type { Script } from "./scripts.g";
import { getStringForLanguage } from "./translations";



export function getLocalisatio(lang: string) {
    if (!browser) {
        throw new Error('We need to run in Browser');
    }
    const data = window.localStorage.getItem(`localisation:${lang}`);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            return undefined;
        }
    }
    return undefined;
}

export function addTranslation(key: string, translation: string, lang: string): void {
    if (!key || !translation || !lang) {
        return;
    }
    const localisation = getLocalisatio(lang) ?? {};
    localisation[key] = translation;
    console.log(`Adding translation for ${key} in ${lang}: ${translation}`);
    setLocalisatio(lang, localisation);
}

export function setLocalisatio(lang: string, data: Record<string, string>) {
    if (!browser) {
        throw new Error('We need to run in Browser');
    }

    window.localStorage.setItem(`localisation:${lang}`, JSON.stringify(Object.fromEntries(Object.entries(data).filter(([key, value]) => getStringForLanguage(key, lang) !== value && (value?.length ?? 0 > 0)))));

}

// IndexedDB helper functions
function openScriptDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open("tragedylooper-scripts", 2); // Version erhöht für neue Indizes
        request.onupgradeneeded = (event) => {
            const db = request.result;
            let store: IDBObjectStore;
            if (!db.objectStoreNames.contains("scripts")) {
                store = db.createObjectStore("scripts", { keyPath: "id" });
            } else {
                store = request.transaction!.objectStore("scripts");
            }
            if (!store.indexNames.contains("creator")) {
                store.createIndex("creator", "creator", { unique: false });
            }
            if (!store.indexNames.contains("title")) {
                store.createIndex("title", "title", { unique: false });
            }

        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function scriptKey(script: Script) {
    return `${script.creator}:${script.title}`;
}

export async function saveScript(script: Script) {
    if (!browser) {
        throw new Error('We need to run in Browser');
    }
    const db = await openScriptDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction("scripts", "readwrite");
        const store = tx.objectStore("scripts");
        store.put({ ...script, id: scriptKey(script) });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

function fromJson(str: string | undefined | null): Script | null {
    if (!str || str.length == 0) {
        return null;
    }
    try {
        const parsed = JSON.parse(str);
        if (!isScript(parsed)) {
            return null;
        }
        return parsed;
    } catch (error) {
        return null;
    }
}

export async function loadAllScripts(): Promise<(Script & { local: true | undefined })[]> {
    const local = await loadAllLocalScripts();
    return [...local, ...Object.values(scripts).map(x => ({ ...x, local: undefined }))];
}

export async function loadAllLocalScripts() {
    if (!browser) {
        throw new Error('We need to run in Browser');
    }
    const db = await openScriptDB();
    return new Promise<(Script & { local: true | undefined })[]>((resolve, reject) => {
        const tx = db.transaction("scripts", "readonly");
        const store = tx.objectStore("scripts");
        const req = store.getAll();
        req.onsuccess = () => {
            const result = (req.result || []).map((script: Script) => ({ ...script, local: true }));
            resolve(result);
        };
        req.onerror = () => reject(req.error);
    });
}

// set ist ein einzelnes Objekt, aber das Script kann ein Array von Sets haben
async function queryScripts({ title, author, set }: { title?: string | null; author?: string | null; set?: { name: string; number: number; } | null; }) {
    const db = await openScriptDB();
    return new Promise<Script[]>((resolve, reject) => {
        const tx = db.transaction("scripts", "readonly");
        const store = tx.objectStore("scripts");
        let req: IDBRequest;
        if (title && author) {
            // Primärschlüssel-Abfrage
            req = store.get(`${author}:${title}`);
            req.onsuccess = () => {
                const result = req.result ? [{ ...req.result }] : [];
                resolve(result);
            };
            req.onerror = () => reject(req.error);
            return;
        } else if (author) {
            const index = store.index("creator");
            req = index.getAll(author);
        } else if (title) {
            const index = store.index("title");
            req = index.getAll(title);
        } else {
            req = store.getAll();
        }
        req.onsuccess = () => {
            let result = req.result || [];
            // Nachfilterung falls set angegeben ist
            if (set) {
                result = result.filter((x: any) => Array.isArray(x.set) && x.set.some((s: any) => set && s.name === set.name && s.number === set.number));
            }
            resolve(result);
        };
        req.onerror = () => reject(req.error);
    });
}

// set ist ein einzelnes Objekt, aber das Script kann ein Array von Sets haben
export async function loadScript(params: { title?: string | null; author?: string | null; set?: { name: string; number: number; } | null; } = {}) {
    if (!browser) {
        throw new Error('We need to run in Browser');
    }
    const { title, author, set } = params;
    if (!title && !author && !set) {
        return undefined;
    }
    const localResults = await queryScripts({ title, author, set });
    // Auch die globalen Scripts durchsuchen (aus dem importierten scripts-Objekt)
    const filter: ((x: Script | null) => x is Script) = (x: any): x is Script => x !== null
        && (!title || x.title == title)
        && (!author || x.creator == author)
        && (!set || (Array.isArray(x.set)
            ? x.set.some((s: any) => set && s.name === set.name && s.number === set.number)
            : false));
    const globalResults = Object.values(scripts).filter(filter).map((x: any) => ({ ...x, local: undefined }));
    return [...localResults.map((x: any) => ({ ...x, local: true })), ...globalResults];
}

export async function deleteLocalScript(script: Script) {
    if (!browser) {
        throw new Error('We need to run in Browser');
    }
    const db = await openScriptDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction("scripts", "readwrite");
        const store = tx.objectStore("scripts");
        store.delete(scriptKey(script));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}