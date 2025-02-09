

export * from "./middleware/verifyJWT";
export const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecret';