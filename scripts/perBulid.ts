import 'path';
import fs from 'fs';
import path from 'path';


const types = ['characters', 'scripts', 'plots', 'roles', 'tragedys', 'incidents'] as const;

const dirs = fs.readdirSync('./data');
const data =
    Promise.all(
        dirs.flatMap(folder => types.map(t => [folder, t] as const))
            .map(([folder, type]) => [`./data/${folder}/${type}.json`, type] as const)
            .filter(([x]) => fs.existsSync(x))
            .map(([scriptLocation, type]) => new Promise<readonly [string, typeof types[number]]>((resolve, reject) => {
                fs.readFile(scriptLocation, 'utf-8', (err, data) => {
                    if (err !== null) {
                        reject(err);
                    } else {
                        resolve([data, type] as const);
                    }
                })
            }))
    );



data.then(x => {

    const data = types.map(type => {
        return [type, x.filter(([, t]) => t == type).map(([x]) => x).filter(x => {
            try {
                const parsed = JSON.parse(x);
                return typeof parsed == 'object' && Array.isArray(parsed);
            } catch (error) {
                console.error(error);
                return false;
            }
        })] as const;
    });

    return data.map(([type, arrays]) => {

        return `export const ${type} = [\n${arrays.map(x => ` ...${x}`).reduce((p, c) => `${p}${p.length > 0 ? ',' : ''}\n${c}`, '')}\n] as const`;

    }).reduce((p, c) => `${p};\n${c}`, '')




}
).then(x => {

    fs.writeFileSync('./src/data.ts', x);
    console.log('finished game data')
}
)

// translations


const translationsfiles = fs.readdirSync('./translations');
const translationData =
    Promise.all(
        translationsfiles.map((fileName) => [`./translations/${fileName}`, path.parse(fileName).name] as const)
            .filter(([x]) => fs.existsSync(x))
            .map(([localisationPath, localisationName]) => new Promise<readonly [string, string]>((resolve, reject) => {
                fs.readFile(localisationPath, 'utf-8', (err, data) => {
                    if (err !== null) {
                        reject(err);
                    } else {
                        resolve([data, localisationName] as const);
                    }
                })
            }))
    );



translationData.then((translations) => {

    const innerObject = translations.map(([data, lang]) => {
        return `"${lang}": ${data}`;
    }).reduce((p, c) => `${p}${p.length == 0 ? '' : ','}\n${c}`, "");

    return `export const translations = {\n${innerObject}\n}`



    // const data = types.map(type => {
    //     return [type, x.filter(([, t]) => t == type).map(([x]) => x).filter(x => {
    //         try {
    //             const parsed = JSON.parse(x);
    //             return typeof parsed == 'object' && Array.isArray(parsed);
    //         } catch (error) {
    //             console.error(error);
    //             return false;
    //         }
    //     })] as const;
    // });

    // return data.map(([type, arrays]) => {

    //     return `export const ${type} = [\n${arrays.map(x => ` ...${x}`).reduce((p, c) => `${p}${p.length > 0 ? ',' : ''}\n${c}`, '')}\n] as const`;

    // }).reduce((p, c) => `${p};\n${c}`, '')




}
).then(x => {

    fs.writeFileSync('./src/data-translations.ts', x);
    console.log('finished Translations');
}
)



