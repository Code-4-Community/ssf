import { json, LoaderFunctionArgs } from 'react-router-dom';

export async function pantryIdLoader({ params }: LoaderFunctionArgs) {
  const { pantryId } = params;

  if (!pantryId) {
    throw new Response('Pantry ID required', { status: 400 });
  }

  const response = await fetch(`/api/pantries/${pantryId}`);

  if (response.status === 404) {
    throw new Response('Not Found', { status: 404 });
  }

  if (!response.ok) {
    throw new Response('Server Error', { status: 500 });
  }

  const pantry = await response.json();
  return json({ pantry });
}
