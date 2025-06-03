

import waybackJson from './wayback.json' assert { type: 'json' };

import { Script } from './../../src/scripts.g';
import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom'

type WaybackData = {
    original: string;
    mimetype: string;
    timestamp: string;
    endtimestamp: string;
    groupcount: number;
    uniqcount: number;
};

// the first element is the headrs the rest are tuples in the order of WaybackData
const waybackData = waybackJson.filter((_, i) => i > 0).map((x) => {
    const [original, mimetype, timestamp, endtimestamp, groupcount, uniqcount] = x;
    return {
        original: original,
        mimetype: mimetype,
        timestamp: timestamp,
        endtimestamp: endtimestamp,
        groupcount: parseInt(groupcount),
        uniqcount: parseInt(uniqcount),
    } satisfies WaybackData;
});

const availableMastermindIds = new Set(waybackData.filter(x => x.original.includes('/mastermind')).map(x => {
    const match = x.original.match(/\/scripts\/(\d+)\/mastermind/);
    if (match) {
        return parseInt(match[1]);
    }
    return null;
}).filter(x => x !== null) as number[]);
const availablePlayerIds = new Set(waybackData.filter(x => !x.original.includes('/mastermind')).map(x => {
    const match = x.original.match(/\/scripts\/(\d+)$/);
    if (match) {
        return parseInt(match[1]);
    }
    return null;
}).filter(x => x !== null) as number[]);

const availableIds = [...availableMastermindIds].map(x=>parseInt(x.toString())).sort();

const scripts: Script[] = [];
for (const id of availableIds) {
    console.log(`Fetching data for script ID: ${id}`);
    const scriptData = await getdata(id);
    if (scriptData) {
        scripts.push(scriptData.mastermind);
    } else {
        console.warn(`No data found for script ID: ${id}`);
    }
}
// const scripts = (await Promise.all(availableIds.sort().map(async (id) => {
//     console.log(`Fetching data for script ID: ${id}`);
//     const scriptData = await getdata(id);
//     if (scriptData) {
//         return scriptData.mastermind;
//     } else {
//         console.warn(`No data found for script ID: ${id}`);
//         return false;
//     }
// }))).filter(x => x !== false) as Script[];
const targetPath = './data/tragedylooperscripts/scripts.json';
if (!fs.existsSync(path.dirname(targetPath))) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

if (scripts.length > 0) {
    fs.writeFileSync(targetPath, JSON.stringify({
        "$schema": "../scripts.g.schema.json",
        scripts
    }, null, 2));
    console.log(`Wrote ${scripts.length} scripts to ${targetPath}`);
}


function getUrl(timestamp: string, id: number) {
    return `https://web.archive.org/web/${timestamp}id_/http://tragedylooperscripts.com/scripts/${id}/mastermind`;
}

async function getdata(id: number) {

    async function getTimestamps(id: number, isMastermind: boolean) {
        const mastermindRequest = await fetch(`https://web.archive.org/__wb/calendarcaptures/2?url=http%3A%2F%2Ftragedylooperscripts.com%2Fscripts%2F${id}${isMastermind ? '%2Fmastermind' : ''}&date=2`)
        if (!mastermindRequest.ok) {
            console.error(`Failed to fetch timestamps for ID: ${id} - Status: ${mastermindRequest.status}`);
            return [];
        }
        const mastermindJson = await mastermindRequest.json() as { items: [number][] };
        const mastermindTimestamps = mastermindJson.items.map(([timestamp]) => timestamp);
        // sort descending
        return mastermindTimestamps.sort((a, b) => b - a);
    }


    const mastermindTimestamps = await getTimestamps(id, true);
    // const playerTimestamps = await getTimestamps(id, false);


    const handleMastermind = async () => {
        // parse the latest timestamp for player and mastermind
        // if is not valid, try the next one
        for (const timestamp of mastermindTimestamps) {
            console.log(`Trying timestamp: ${timestamp} for ID: ${id}`);
            const mastermindUrl = getUrl(timestamp.toString(), id);
            const mastermindResponse = await fetch(mastermindUrl);
            if (mastermindResponse.ok) {
                const mastermindText = await mastermindResponse.text();
                const mastermindData = parseMastermindData(mastermindText, id);
                if (mastermindData) {
                    return mastermindData;
                } else {
                    console.warn(`Failed to parse mastermind data for ID: ${id} at timestamp: ${timestamp}`);
                }
            } else {
                console.warn(`Failed to fetch mastermind data for ID: ${id} at timestamp: ${timestamp} - Status: ${mastermindResponse.status}`);
            }
        }
        return false;
    }

    const mastermindData = await handleMastermind();
    if (!mastermindData) {
        return false;
    }
    return {
        mastermind: mastermindData,
        id: id,
    };
}




type MastermindData = {
    Title: string;
    "Created by": string;
    "Tragedy Set": string;
    "Difficulty": string;
    "Description": string;
    "Main Plot": string;
    "Subplot 1": string;
    "Subplot 2"?: string;
    "Number of Loops": number[]
    "Days per Loop": number;
    "Hints for Mastermind": string;
    "Victory Conditions for Mastermind": string;
    "Special Rule": string;

    Incidents: {
        day: number;
        incidentName: string;
        culprit: string;
    }[];
    cast: {
        name: string;
        role: string;

    }[];
    comments: string[];
};


function parseMastermindData(txt: string, id: number): false | Script {

    // <p>
    //       <strong>Title:</strong>
    //       Tainted Candy
    //     </p>

    // get p elements
    const parser = new JSDOM(txt);
    const doc = parser.window.document;
    const pElements = doc.querySelectorAll('p');
    // find all p elements that have a strong element as first child and build a record with the strong text as key and the rest of the text as value
    const data = {} as Record<keyof MastermindData, string>;
    pElements.forEach((p) => {
        const strong = p.querySelector('strong');
        if (strong) {
            const key = strong.textContent?.replace(':', '').trim() || '';
            const value = p.textContent?.replace(strong.textContent || '', '').trim() || '';
            data[key] = value;
        }
    });

    // find the table where thead contains a th with text "Incident"
    const incidentTable = Array.from(doc.querySelectorAll('table.table-striped')).find(table => {
        const ths = table.querySelectorAll('thead th');
        return Array.from(ths).some(th => th.textContent?.trim() === 'Incident');
    });
    const incidents: MastermindData['Incidents'] = [];
    if (incidentTable) {
        const rows = incidentTable.querySelectorAll('tbody tr');
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 3) {
                const dayText = cells[0].textContent?.trim() || '';
                const incidentName = cells[1].textContent?.trim() || '';
                const culprit = cells[2].textContent?.trim() || '';
                const dayMatch = dayText.match(/Day (\d+)/);
                if (dayMatch) {
                    incidents.push({
                        day: parseInt(dayMatch[1]),
                        incidentName,
                        culprit,
                    });
                } else {
                    console.warn(`Could not parse day from text: ${dayText}`);
                }
            }
        });
    } else {
        console.warn('Could not find incident table');
        return false;
    }


    const castTable = Array.from(doc.querySelectorAll('table.table-striped')).find(table => {
        const ths = table.querySelectorAll('thead th');
        return Array.from(ths).some(th => th.textContent?.trim() === 'Cast');
    });
    const cast: MastermindData['cast'] = [];
    if (castTable) {
        const rows = castTable.querySelectorAll('tbody tr');
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 2) {
                const name = cells[0].textContent?.trim() || '';
                const role = cells[1].textContent?.trim() || '';
                cast.push({ name, role });
            }
        });
    } else {
        console.warn('Could not find cast table');
        return false;
    }


    if (cast.length === 0) {
        console.warn('No cast found');
        return false;
    }
    // find the comments section
    // <p><strong>Comments</strong></p>
    //  <p>
    //     test comment<br>
    //     <span class="sub-text">Alan Tran
    //     </span>
    //   </p>
    const comments: MastermindData['comments'] = [];
    const commentsSection = Array.from(doc.querySelectorAll('p')).find(p => p.textContent?.includes('Comments'));
    if (commentsSection) {
        let nextSibling = commentsSection.nextElementSibling;
        while (nextSibling && nextSibling.tagName === 'P') {
            const commentText = nextSibling.textContent?.replace(/<br>/g, '\n').trim() || '';
            if (commentText) {
                comments.push(commentText);
            }
            nextSibling = nextSibling.nextElementSibling;
        }
    }

    // pares days of loops
    const daysOfLoops = parseInt(data['Days per Loop']);
    if (isNaN(daysOfLoops)) {
        console.warn('Could not parse days per loop');
        return false;
    }
    // parse number of loops
    const numberOfLoopsText = data['Number of Loops'];
    const numberOfLoops = numberOfLoopsText.split(/,|(or)/).map(x => x?.trim() == '∞' ? 666 : parseInt(x?.trim())).filter(x => !isNaN(x));

    if (numberOfLoops.length === 0) {
        console.warn('Could not parse number of loops');
        return false;
    }

    const scriptRawData: MastermindData = {
        ...data,
        'Number of Loops': numberOfLoops,
        'Days per Loop': daysOfLoops,
        Incidents: incidents,
        cast: cast,
        comments: comments,
    };

    // assert Title, Tragedy Set, Main Plot, Subplot 1
    const requiredFields: (keyof MastermindData)[] = [
        'Tragedy Set',
        'Main Plot',
        'Subplot 1',
        'Number of Loops',
        'Days per Loop',
    ];
    for (const field of requiredFields) {
        if (!scriptRawData[field]) {
            console.warn(`Missing required field: ${field}`);
            return false;
        }
    }

    const result = {
        cast: Object.fromEntries(scriptRawData.cast.map(x => [x.name, !x.role ? 'person' : x.role] as const)),
        incidents: scriptRawData.Incidents.map(x => ({
            day: x.day,
            incident: x.incidentName,
            culprit: x.culprit,
        })) as any,
        title: !scriptRawData.Title ? `Unnamed Script #${id}` : scriptRawData.Title,
        mainPlot: [scriptRawData['Main Plot']] as any,
        subPlots: [scriptRawData['Subplot 1'], scriptRawData['Subplot 2']].filter(x => x) as any,
        story: scriptRawData.Description,
        tragedySet: scriptRawData['Tragedy Set'] as any,
        mastermindHints: scriptRawData['Hints for Mastermind'],
        specialRules: [scriptRawData['Special Rule']],
        specifics: `${scriptRawData['Victory Conditions for Mastermind']}

${scriptRawData.comments.join('\n\n')}`,
        creator: scriptRawData['Created by'],
        daysPerLoop: scriptRawData['Days per Loop'],
        difficultySets: scriptRawData['Number of Loops'].map(n => ({
            difficulty: isNaN(parseInt(scriptRawData.Difficulty)) ? 0 : parseInt(scriptRawData.Difficulty),
            numberOfLoops: n,
        })),
        set: {
            name: 'www.tragedylooperscripts.com',
            number: id,
        }

    } satisfies Script;

    return result;
}