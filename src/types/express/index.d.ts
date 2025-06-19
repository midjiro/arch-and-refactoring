
import { IUserDocument } from '../../models/user';

declare global {
  namespace Express {
    interface User extends IUserDocument{}
  }
}
