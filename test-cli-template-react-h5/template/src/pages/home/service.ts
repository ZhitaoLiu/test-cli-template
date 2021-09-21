import request from '@/utils/axios';

const api = {
  userInfo: '/xxxx/xxx',
};

export const getUserInfoRequest = (data: { user_id: string }) => request.post(api.userInfo, { ...data });
