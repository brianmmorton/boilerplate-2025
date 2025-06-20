import { getToken } from './getToken';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
	return fetch(`${process.env.REACT_APP_API_URL}${url}`, {
		...options,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {}),
			Authorization: `Bearer ${getToken()}`,
		},
	});
};
