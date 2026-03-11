import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

function isMissingCollectionError(error) {
    return error?.status === 404 && error?.response?.message === 'Missing collection context.';
}

async function safeGetFullList(collectionName, options = {}) {
    try {
        return await pb.collection(collectionName).getFullList(options);
    } catch (error) {
        if (isMissingCollectionError(error)) {
            console.warn(`[PocketBase] Collection inaccessible: ${collectionName}`);
            return [];
        }

        throw error;
    }
}

async function safeGetOne(collectionName, id, options = {}) {
    try {
        return await pb.collection(collectionName).getOne(id, options);
    } catch (error) {
        if (error?.status === 404 || isMissingCollectionError(error)) {
            console.warn(`[PocketBase] Record inaccessible in ${collectionName}: ${id}`);
            return null;
        }

        throw error;
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
