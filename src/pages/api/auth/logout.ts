import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
    return new Response(null, {
        status: 302,
        headers: {
            Location: '/connexion?logout=1',
            'Set-Cookie': 'pb_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
        },
    });
};
