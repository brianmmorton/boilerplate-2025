export const getToken = () => sessionStorage.getItem('token');
export const getRefreshToken = () => sessionStorage.getItem('refresh_token');
export const setToken = (token: string) => sessionStorage.setItem('token', token);
export const setRefreshToken = (token: string) => sessionStorage.setItem('refresh_token', token);
