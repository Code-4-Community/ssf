import { useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import apiClient from '@api/apiClient';

// Hook to manage authentication state and set the API client's access token
export function useAuth() {
  useEffect(() => {
    const updateToken = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();        
        apiClient.setAccessToken(idToken);
      } catch (error) {
        console.error('Error fetching auth session:', error);
        apiClient.setAccessToken(undefined);
      }
    };

    updateToken();
  }, []);
}