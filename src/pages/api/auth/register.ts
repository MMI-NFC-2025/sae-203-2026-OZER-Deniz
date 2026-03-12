import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

const pocketbaseUrl = 'https://sae203.deniz-ozer.fr';

export const POST: APIRoute = async ({ request }) => {
    const formData = await request.formData();
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const passwordConfirm = String(formData.get('passwordConfirm') || '');

    if (!name || !email || !password || !passwordConfirm) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/inscription?error=missing-fields',
            },
        });
    }

    if (password !== passwordConfirm) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/inscription?error=password-mismatch',
            },
        });
    }

    const pb = new PocketBase(pocketbaseUrl);

    try {
        await pb.collection('users').create({
            name,
            email,
            password,
            passwordConfirm,
            emailVisibility: true,
        });

        await pb.collection('users').authWithPassword(email, password);

        const authCookie = pb.authStore.exportToCookie({
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'Lax',
            path: '/',
        });

        return new Response(null, {
            status: 302,
            headers: {
                Location: '/compte?welcome=1',
                'Set-Cookie': authCookie,
            },
        });
    } catch (error) {
        const message = String(error || '').toLowerCase();
        const location = message.includes('already') || message.includes('exists')
            ? '/inscription?error=email-already-used'
            : '/inscription?error=register-failed';

        return new Response(null, {
            status: 302,
            headers: {
                Location: location,
            },
        });
    }
};
