import { LoaderFunctionArgs } from 'react-router-dom';
import ApiClient from '@api/apiClient';
import { AxiosError } from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

export async function pantryIdLoader({ params }: LoaderFunctionArgs) {
  const { pantryId } = params;

  if (!pantryId) {
    throw new Response('Pantry ID required', { status: 400 });
  }

  try {
    // Fetch the auth session
    const session = await fetchAuthSession({ forceRefresh: false });
    const idToken = session.tokens?.idToken?.toString();

    // If no token, the user isn't authenticated yet, so let the Authenticator handle this
    if (!idToken) {
      return { pantry: null };
    }

    const pantry = await ApiClient.getPantry(parseInt(pantryId, 10));
    return { pantry };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        throw new Response('Not Found', { status: 404 });
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Auth error - return null and let component retry after auth
        return { pantry: null };
      }
    }

    throw new Response('Server Error: ', { status: 500 });
  }
}
