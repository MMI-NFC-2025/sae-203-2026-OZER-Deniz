import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

const pocketbaseUrl = 'http://sae203.deniz-ozer.fr/_/'.replace(/\/_\/?$/, '');

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/connexion?error=missing-fields',
      },
    });
  }

  const pb = new PocketBase(pocketbaseUrl);

  try {
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
        Location: '/compte',
        'Set-Cookie': authCookie,
      },
    });
  } catch {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/connexion?error=invalid-credentials',
      },
    });
  }
};
