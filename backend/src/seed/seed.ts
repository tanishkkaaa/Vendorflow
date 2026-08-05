/* eslint-disable no-console */
import { connectDatabase, disconnectDatabase } from '@config/database';
import { Organization } from '@models/Organization.model';
import { User } from '@models/User.model';
import { Vendor } from '@models/Vendor.model';
import { Role } from '@constants/roles';
import { VendorStatus } from '@constants/enums';

async function seed() {
  await connectDatabase();
  console.log('Connected. Seeding demo data...');

  await Promise.all([
    Organization.deleteMany({}),
    User.deleteMany({}),
    Vendor.deleteMany({}),
  ]);

  const org = await Organization.create({ name: 'Acme Manufacturing Pvt Ltd', domain: 'acme.com' });

  const admin = await User.create({
    name: 'Aditi Sharma',
    email: 'admin@acme.com',
    password: 'Password@123',
    role: Role.ADMIN,
    organizationId: org._id,
  });
  org.createdBy = admin._id as any;
  await org.save();

  await User.create({
    name: 'Rahul Verma',
    email: 'manager@acme.com',
    password: 'Password@123',
    role: Role.PROCUREMENT_MANAGER,
    organizationId: org._id,
    department: 'Procurement',
  });

  await User.create({
    name: 'Priya Nair',
    email: 'finance@acme.com',
    password: 'Password@123',
    role: Role.FINANCE,
    organizationId: org._id,
    department: 'Finance',
  });

  await User.create({
    name: 'Karan Mehta',
    email: 'director@acme.com',
    password: 'Password@123',
    role: Role.DIRECTOR,
    organizationId: org._id,
  });

  const vendorUser = await User.create({
    name: 'Sunil Traders Contact',
    email: 'vendor@sunilraders.com',
    password: 'Password@123',
    role: Role.VENDOR,
    organizationId: org._id,
  });

  const vendor = await Vendor.create({
    organizationId: org._id,
    userId: vendorUser._id,
    companyName: 'Sunil Traders Pvt Ltd',
    contactPerson: 'Sunil Kumar',
    email: 'vendor@sunilraders.com',
    phone: '+91-9876543210',
    gstNumber: '29ABCDE1234F2Z5',
    status: VendorStatus.VERIFIED,
  });

  vendorUser.vendorId = vendor._id as any;
  await vendorUser.save();

  console.log('Seed complete:');
  console.log(`  Organization: ${org.name} (${org._id})`);
  console.log('  Login credentials (password: Password@123 for all):');
  console.log('    Admin:               admin@acme.com');
  console.log('    Procurement Manager: manager@acme.com');
  console.log('    Finance:             finance@acme.com');
  console.log('    Director:            director@acme.com');
  console.log('    Vendor:              vendor@sunilraders.com');

  await disconnectDatabase();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
