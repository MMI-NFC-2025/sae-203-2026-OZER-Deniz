import PocketBase from 'pocketbase';

const pocketbaseUrl = 'http://sae203.deniz-ozer.fr/_/'.replace(/\/_\/?$/, '');
const pb = new PocketBase(pocketbaseUrl);

function isMissingCollectionError(error) {
    return error?.status === 404 && error?.response?.message === 'Missing collection context.';
}

async function safeGetFullList(collectionName, options = {}) {
    try {
        return await pb.collection(collectionName).getFullList(options);
    } catch (error) {
        console.warn(`[PocketBase] Collection inaccessible: ${collectionName}`, error?.message || error);
        return [];
    }
}

async function safeGetOne(collectionName, id, options = {}) {
    try {
        return await pb.collection(collectionName).getOne(id, options);
    } catch (error) {
        console.warn(`[PocketBase] Record inaccessible in ${collectionName}: ${id}`, error?.message || error);
        return null;
    }
}

// Artistes
export async function getArtistes() {
    return await safeGetFullList('artistes', { sort: 'nom' });
}

export async function getArtiste(id) {
    return await safeGetOne('artistes', id);
}

// Scènes
export async function getScenes() {
    return await safeGetFullList('scenes', { sort: 'nom' });
}

export async function getScene(id) {
    return await safeGetOne('scenes', id);
}

// Concerts
export async function getConcerts() {
    return await safeGetFullList('concerts', {
        sort: 'date,heure',
        expand: 'artiste,scene'
    });
}

export async function getConcert(id) {
    return await safeGetOne('concerts', id, { expand: 'artiste,scene' });
}

// URL image
export function getImageUrl(record, filename) {
    return pb.files.getURL(record, filename);
}

export { pb };
