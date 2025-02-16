import Cookie from 'js-cookie';

export const getToken = () => Cookie.get('token');