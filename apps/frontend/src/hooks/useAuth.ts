import { useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub, type HubCapsule } from 'aws-amplify/utils';
import apiClient from '@api/apiClient';

interface AuthPayload {
  event: 'signIn' | 'signOut' | 'tokenRefresh' | string;
}

// Hook to manage authentication state and set the API client's access token
export function useAuth() {
  useEffect(() => {
    const updateToken = async () => {
      try {
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        if (accessToken) {
          apiClient.setAccessToken(accessToken);
          localStorage.setItem('accessToken', accessToken);
        } else {
          apiClient.setAccessToken(undefined);
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        console.error('Error fetching auth session:', error);
        apiClient.setAccessToken(undefined);
        localStorage.removeItem('accessToken');
      }
    };

    updateToken();

    // Listen for auth events so we can update token immediately after sign in
    const listener = (data: HubCapsule<'auth', AuthPayload>) => {
      const { payload } = data;
      if (payload.event === 'signIn' || payload.event === 'tokenRefresh') {
        updateToken();
      }

      if (payload.event === 'signOut') {
        apiClient.setAccessToken(undefined);
        localStorage.removeItem('accessToken');
      }
    };

    const unsubscribe = Hub.listen('auth', listener);

    return () => {
      unsubscribe();
    };
  }, []);
}
