import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'calzare_super_secure_jwt_secret_dev_2026_xyz', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};
