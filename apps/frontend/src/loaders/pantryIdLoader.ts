import { json, LoaderFunctionArgs } from 'react-router-dom';
import ApiClient from '@api/apiClient';
import { AxiosError } from 'axios';

export async function pantryIdLoader({ params }: LoaderFunctionArgs) {
  const { pantryId } = params;

  if (!pantryId) {
    throw new Response('Pantry ID required', { status: 400 });
  }

  try {
    const pantry = await ApiClient.getPantry(parseInt(pantryId, 10));
    return json({ pantry });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        throw new Response('Not Found', { status: 404 });
      }
    }

    throw new Response('Server Error', { status: 500 });
  }
}
