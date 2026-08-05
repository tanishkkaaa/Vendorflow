import { userRepository } from '@repositories/user.repository';
import { organizationRepository } from '@repositories/organization.repository';
import { vendorRepository } from '@repositories/vendor.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@utils/jwt.util';
import { ApiError } from '@utils/ApiError';
import { Role } from '@constants/roles';

export const authService = {
  /** Registers a new organization + its first Admin user (used for company sign-up). */
  async registerOrganization(input: { orgName: string; name: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const organization = await organizationRepository.create({ name: input.orgName } as any);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: Role.ADMIN,
      organizationId: organization._id,
    } as any);

    return authService.issueTokens(user);
  },

  /** Admin/Procurement Manager invites an internal team member. */
  async inviteInternalUser(input: {
    organizationId: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    department?: string;
  }) {
    if (input.role === Role.VENDOR) {
      throw ApiError.badRequest('Use vendor registration flow for vendor accounts');
    }
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    return userRepository.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      department: input.department,
      organizationId: input.organizationId,
    } as any);
  },

  /** Vendor self-registration: creates login user (role=vendor) + Vendor profile in one step. */
  async registerVendor(input: {
    organizationId: string;
    name: string;
    email: string;
    password: string;
    companyName: string;
    contactPerson: string;
    phone: string;
  }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: Role.VENDOR,
      organizationId: input.organizationId,
    } as any);

    const vendor = await vendorRepository.create({
      organizationId: input.organizationId,
      userId: user._id,
      companyName: input.companyName,
      contactPerson: input.contactPerson,
      email: input.email,
      phone: input.phone,
    } as any);

    user.vendorId = vendor._id as any;
    await user.save();

    const tokens = await authService.issueTokens(user);
    return { vendor, ...tokens };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email, true);
    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    if (!user.isActive) throw ApiError.forbidden('Your account has been deactivated');

    user.lastLoginAt = new Date();
    await user.save();

    return authService.issueTokens(user);
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
    const user = await userRepository.findById(payload.userId);
    if (!user || !user.isActive) throw ApiError.unauthorized('User no longer active');
    return authService.issueTokens(user);
  },

  issueTokens(user: { _id: unknown; role: string; organizationId: unknown }) {
    const payload = {
      userId: String(user._id),
      role: user.role,
      organizationId: String(user.organizationId),
    };
    return {
      user,
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  },
};
