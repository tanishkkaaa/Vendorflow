import { BaseRepository } from './base.repository';
import { User, IUser } from '@models/User.model';

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  findByEmail(email: string, withPassword = false) {
    const query = this.model.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select('+password');
    return query.exec();
  }
}

export const userRepository = new UserRepository();
