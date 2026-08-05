import { userRepository } from '@repositories/user.repository';
import { ApiError } from '@utils/ApiError';

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async listOrgUsers(organizationId: string, filters: Record<string, unknown> = {}) {
    return userRepository.find({ organizationId, ...filters });
  },

  async deactivate(userId: string) {
    return userRepository.updateById(userId, { isActive: false });
  },

  async activate(userId: string) {
    return userRepository.updateById(userId, { isActive: true });
  },
};
