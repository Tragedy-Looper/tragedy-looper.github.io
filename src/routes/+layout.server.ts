import { characters } from '../data';
import type { LayoutServerLoad } from './$types';
import * as fs from 'fs';

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function normalizeCharacterName(name: string): string {
    return name.replace(/[^a-zA-Z0-9\(\)]/g, '').toLowerCase(); // remove non-alphanumeric characters and convert to lowercase
}

export const load: LayoutServerLoad = ({ params }) => {
    const characterNames = characters.map(x => x.name);
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
        .map(file => file.replace('.png', '')); // remove .png extension

    const characterMapImages = characterNames.reduce((acc, name) => {
        // /^${name}(\d+)?$/i
        const regex = new RegExp(`^${escapeRegExp(normalizeCharacterName(name))}(\\d+)?$`, 'i'); // regex to match name with optional numbers at the end
        // check if the name (optionally with numbers at the end) exists in the characterImages
        const imagesForThisCharacters = images.filter(imageName => regex.test(normalizeCharacterName(imageName)));
        if (imagesForThisCharacters.length === 0) {
            console.warn(`No images found for character: ${name}`);
            return acc; // no image found for this character
        }
        acc[name] = imagesForThisCharacters.map(imageName => `/cards/characters/${imageName}.png`);
        return acc;
    }, {} as Record<typeof characterNames[number], string[]>);

    return {
        characterImages: characterMapImages

    };
};