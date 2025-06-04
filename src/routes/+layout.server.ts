import { base } from '$app/paths';
import path from 'path';
import { characters, scripts, tragedys } from '../data';
import type { Script } from '../scripts.g';
import type { LayoutServerLoad } from './$types';
import * as fs from 'fs';

function escapeRegExp(string: string): string {
    return string.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function normalizeCharacterName(name: string): string {
    return name.replaceAll(/[^a-zA-Z0-9]/g, '').toLowerCase(); // remove non-alphanumeric characters and convert to lowercase
}

function normalizeTragedyName(name: string): string {
    return name.replaceAll(/[^a-zA-Z0-9\(\) _\-]/g, '').replaceAll(' ', '_').toLowerCase(); // remove non-alphanumeric characters and convert to lowercase
}

export const load: LayoutServerLoad = ({ params }) => {
    const characterNames = characters.map(x => x.id);
    // find images for characters in static/cards/characters

    // get all images in static/cards/characters
    const characterImagesPath = 'static/cards/characters';
    if (!fs.existsSync(characterImagesPath)) {
        console.error(`Character images path does not exist: ${characterImagesPath}`);
        return { characterImages: {} };
    }
    // filter characterNames to only those that have an image in the static/cards/characters folder
    const images = fs.readdirSync(characterImagesPath)
        .filter(file => file.endsWith('.png'))
        .map(file => path.basename( file, '.png')); // remove .png extension

    const characterMapImages = characterNames.reduce((acc, name) => {
        // /^${name}(\d+)?$/i
        const regex = new RegExp(`^${escapeRegExp(normalizeCharacterName(name))}(\\d+)?$`, 'i'); // regex to match name with optional numbers at the end
        // check if the name (optionally with numbers at the end) exists in the characterImages
        const imagesForThisCharacters = images.filter(imageName => regex.test(normalizeCharacterName(imageName)));
        if (imagesForThisCharacters.length === 0) {
            console.warn(`No images found for character: ${name}`);
            return acc; // no image found for this character
        }
        acc[name] = imagesForThisCharacters.map(imageName => `${base}/cards/characters/${imageName}.png`);
        return acc;
    }, {} as Record<typeof characterNames[number], string[]>);

    const packageImagePath = 'static/packages';
    const packageImages = Object.fromEntries(fs.readdirSync(packageImagePath)
        .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) // filter for image files
        .map(file => [path.basename(file, path.extname(file)), path.extname(file)] as const) // get basename and extension
    );

    console.warn(`Found ${Object.keys(packageImages).length} package images in ${packageImagePath}`);
    console.warn(`Keys are: ${Object.keys(packageImages).join(', ')}`);
    console.warn(`normalized keys are: ${Object.keys(packageImages).map(x => normalizeTragedyName(x)).join(', ')}`);

    const tragedySets = [...new Set((scripts as unknown as Script[]).flatMap(x => x.set?.map(x => x.name ?? '') ?? []).filter(x => x.length > 0))];
    console.warn(`Found ${tragedySets.length} tragedy sets: ${tragedySets.join(', ')}`);
    console.warn(`Normalized tragedy sets: ${tragedySets.map(x => normalizeTragedyName(x)).join(', ')}`);
    const tragedySetImages = Object.fromEntries(tragedySets.map(ts => [ts, normalizeTragedyName(ts)] as const).filter(([, fileName]) => {
        return fileName in packageImages;
    }).map(([keys, path]) => [keys, `${base}/packages/${path}${packageImages[path]}`])) as Partial<Record<string, string>>;




    return {
        characterImages: characterMapImages,
        tragedySetImages
    };
};