import fs from 'fs';
import path from 'path';
import { parse as parseJsonc } from 'jsonc-parser';
import Ajv from 'ajv';
// __dirname-Ersatz für ES Modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');

function findDataFiles(dir: string): string[] {
    let files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(findDataFiles(fullPath));
        } else if ((entry.name.endsWith('.json') || entry.name.endsWith('.jsonc')) && !entry.name.endsWith('schema.json')) {
            files.push(fullPath);
        }
    }
    return files;
}

function getSchemaPath(obj: any, filePath: string): string | undefined {
    if (obj && obj.$schema) {
        if (obj.$schema.startsWith('http')) return obj.$schema;
        // relative Pfade auflösen
        return path.resolve(path.dirname(filePath), obj.$schema);
    }
    return undefined;
}

async function validateFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;
    try {
        data = filePath.endsWith('.jsonc') ? parseJsonc(content) : JSON.parse(content);
    } catch (e) {
        console.error(`❌ Fehler beim Parsen von ${filePath}:`, e.message);
        return false;
    }
    const schemaPath = getSchemaPath(data, filePath);
    if (!schemaPath) {
        console.warn(`⚠️  Keine $schema-Angabe in ${filePath}`);
        return true;
    }
    let schema;
    try {
        if (schemaPath.startsWith('http')) {
            const res = await fetch(schemaPath);
            schema = await res.json();
        } else {
            schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        }
    } catch (e) {
        console.error(`❌ Fehler beim Laden des Schemas für ${filePath}:`, e.message);
        return false;
    }
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        // Spezialfall: translations.schema.json propertyNames/enum
        const isTranslationSchema = filePath.includes('translations.schema.json') || (schemaPath && schemaPath.toString().includes('translations.schema.json'));
        let hasCriticalError = false;
        for (const err of validate.errors ?? []) {
            if (
                err.keyword === 'enum' &&
                err.schemaPath.includes('propertyNames') &&
                Object.prototype.hasOwnProperty.call(err, 'propertyName')
                && isTranslationSchema
            ) {
                // Kurzform für unbekannte Property
                console.warn(`⚠️ Unbekannter Schlüssel: '${err.propertyName}' (bei ${schemaPath})`);
            } else if (
                err.keyword === 'propertyNames' &&
                err.schemaPath.includes('propertyNames')
                && isTranslationSchema
            ) {
                // skip

            } else {
                hasCriticalError = true;
                // Normale Ausgabe für andere Fehler
                console.error(`❌ Schema-Validierung fehlgeschlagen für ${filePath}:`, err);
            }
        }
        // Bei reinen propertyName-Fehlern in translations: Test nicht fehlschlagen
        if (!hasCriticalError) {
            return true;
        }
        return false;
    }
    console.log(`✅ ${filePath} ist valide.`);
    return true;
}

// Prüfung auf doppelte (title, creator)-Paare in allen Script-Sammlungen
function checkDuplicateScriptTitles(files: string[]): boolean {
    const seen = new Map<string, string[]>(); // key: title\u0000creator, value: [file1, file2, ...]
    let hasDuplicate = false;
    for (const file of files) {
        let content: string;
        try {
            content = fs.readFileSync(file, 'utf-8');
        } catch (e) {
            continue;
        }
        let data: any;
        try {
            data = file.endsWith('.jsonc') ? parseJsonc(content) : JSON.parse(content);
        } catch (e) {
            continue;
        }
        if (data && Array.isArray(data.scripts)) {
            for (const script of data.scripts) {
                if (!script || typeof script !== 'object') continue;
                const title = script.title || '';
                const creator = script.creator || '';
                if (!title || !creator) continue;
                const key = `${title}\u0000${creator}`;
                if (!seen.has(key)) {
                    seen.set(key, [file]);
                } else {
                    seen.get(key)!.push(file);
                    hasDuplicate = true;
                }
            }
        }
    }
    if (hasDuplicate) {
        for (const [key, files] of seen.entries()) {
            if (files.length > 1) {
                const [title, creator] = key.split('\u0000');
                console.error(`❌ Duplicate script title/creator pair found: "${title}" by "${creator}" in files: ${files.join(', ')}`);
            }
        }
    }
    return !hasDuplicate;
}

(async () => {
    const files = findDataFiles(dataDir);
    let allValid = true;
    for (const file of files) {
        const valid = await validateFile(file);
        if (!valid) allValid = false;
    }
    // Nach Schema-Validierung: Doppelte Script-Titel/Creator prüfen
    const scriptFiles = files.filter(f => {
        const content = fs.readFileSync(f, 'utf-8');
        const data = f.endsWith('.jsonc') ? parseJsonc(content) : JSON.parse(content);
        return data && data.$schema && data.$schema.includes('scripts.schema');
    });
    if (!checkDuplicateScriptTitles(scriptFiles)) {
        allValid = false;
    }
    if (!allValid) {
        process.exit(1);
    } else {
        console.log('Alle Daten sind valide!');
    }
})();