import { getArtistes, getScenes, getConcerts, getImageUrl, pb } from './backend.mjs';

async function test() {
    console.log('=== Test PocketBase ===\n');

    // Test connexion
    try {
        await pb.health.check();
        console.log('Connexion OK\n');
    } catch (e) {
        console.log('Erreur: PocketBase non accessible');
        return;
    }

    // Test artistes
    console.log('--- Artistes ---');
    const artistes = await getArtistes();
    console.log(`${artistes.length} artiste(s)`);
    artistes.forEach(a => console.log(`  - ${a.nom} (${a.instrument || 'N/A'})`));

    // Test scènes
    console.log('\n--- Scènes ---');
    const scenes = await getScenes();
    console.log(`${scenes.length} scène(s)`);
    scenes.forEach(s => console.log(`  - ${s.nom} (${s.capacite || 'N/A'} places)`));

    // Test concerts
    console.log('\n--- Concerts ---');
    const concerts = await getConcerts();
    console.log(`${concerts.length} concert(s)`);
    concerts.forEach(c => {
        const artiste = c.expand?.artiste?.nom || 'N/A';
        const scene = c.expand?.scene?.nom || 'N/A';
        console.log(`  - ${c.titre} | ${artiste} | ${scene} | ${c.date}`);
    });

    console.log('\n=== Fin des tests ===');
}

test();
