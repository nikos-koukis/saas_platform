import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Compared against when no user matches, so a wrong email and a wrong
 * password cost the same time and cannot be told apart by an attacker.
 */
const DUMMY_HASH = "$2b$12$5HC/LSynF2NtKGXJ31hGd.tgBgXOawn9pujRA55f7OtygOViYFSQq";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string | undefined): Promise<boolean> {
  if (!hash) return bcrypt.compare(plain, DUMMY_HASH).then(() => false);
  return bcrypt.compare(plain, hash);
}
