import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

const pocketbaseUrl = 'https://sae203.deniz-ozer.fr';

export const POST: APIRoute = async ({ request }) => {
    const pb = new PocketBase(pocketbaseUrl);
    pb.authStore.loadFromCookie(request.headers.get('cookie') || '');

    if (!pb.authStore.isValid || !pb.authStore.model) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/connexion?error=not-authenticated',
            },
        });
    }

    try {
        await pb.collection('users').authRefresh();
    } catch {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/connexion?error=session-expired',
            },
        });
    }

    const formData = await request.formData();
    const avatar = formData.get('avatar');

    if (!(avatar instanceof File) || avatar.size === 0) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/compte?avatar=missing-file',
            },
        });
    }

    try {
        const userId = pb.authStore.record?.id;

        if (!userId) {
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/connexion?error=session-expired',
                },
            });
        }

        const updatedUser = await pb.collection('users').update(userId, {
            avatar,
        });

        // Keep auth cookie model in sync so the header can immediately show the new avatar.
        pb.authStore.save(pb.authStore.token, updatedUser);

        const authCookie = pb.authStore.exportToCookie({
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'Lax',
            path: '/',
        });

        return new Response(null, {
            status: 302,
            headers: {
                Location: '/compte?avatar=updated',
                'Set-Cookie': authCookie,
            },
        });
    } catch {
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/compte?avatar=error',
            },
        });
    }
};
