import { fetchWithAuth } from 'utils/fetchWithAuth';
import { getRefreshToken, setRefreshToken, setToken } from './getToken';

export const refreshTokens = async (): Promise<boolean> => {
	const response = await fetchWithAuth(`/1/auth/refresh-tokens`, {
		method: 'POST',
		body: JSON.stringify({
			refreshToken: getRefreshToken(),
		}),
	});

	if (response.ok) {
		const data = await response.json();
		setToken(data.access.token);
		setRefreshToken(data.refresh.token);

		return true;
	}

	return false;
};
