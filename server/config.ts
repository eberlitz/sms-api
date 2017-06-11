export const config = {
    jwt_secret: process.env.JWT_SECRET,
    db: {
        connection: process.env.DATABASE
    }
};
