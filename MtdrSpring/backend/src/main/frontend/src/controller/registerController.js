import { checkDuplicates, createUser } from '../services/RegisterService';

export async function registerUser(username, email, password, role) {
    const success = await checkDuplicates(username, email);
    if (!success) {
      return null;
    } else {
      const createUserSuccess = await createUser(username, email, password, role);
        if (createUserSuccess === null) {
            return null;
        } else {
            return createUserSuccess;
        }
    }
    // eslint-disable-next-line no-unreachable
    return null;
}