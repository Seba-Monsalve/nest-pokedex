export const EnvConfig = () => ({

    enviroment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/nest-pokemon',
    defaultLimit: process.env.DEFAULT_LIMIT || 10,
})