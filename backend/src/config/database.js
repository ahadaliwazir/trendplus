require('dotenv').config();

// Auto-detect database type based on environment variables
const isMysql = !!(process.env.MYSQL_URL || process.env.MYSQLDATABASE);

const defineOptions = {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
};

const buildMysqlConfig = (logging = false) => {
    const url = process.env.MYSQL_URL || process.env.DATABASE_URL;
    if (url) {
        return {
            url,
            dialect: 'mysql',
            logging,
            pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
            define: defineOptions
        };
    }
    return {
        username: process.env.MYSQLUSER || process.env.DB_USER,
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
        database: process.env.MYSQLDATABASE || process.env.DB_NAME,
        host: process.env.MYSQLHOST || process.env.DB_HOST,
        port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        logging,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        define: defineOptions
    };
};

const buildPostgresConfig = (logging = false) => ({
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging,
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
    },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: defineOptions
});

const buildSqliteConfig = (logging = false) => ({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging,
    define: defineOptions
});

const getDevelopmentConfig = () => {
    if (isMysql) return buildMysqlConfig(console.log);
    if (process.env.DATABASE_URL) return buildPostgresConfig(console.log);
    return buildSqliteConfig(console.log);
};

const getProductionConfig = () => {
    if (isMysql) return buildMysqlConfig(false);
    if (process.env.DATABASE_URL) return buildPostgresConfig(false);
    return buildSqliteConfig(false);
};

module.exports = {
    development: getDevelopmentConfig(),

    test: {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define: defineOptions
    },

    production: getProductionConfig()
};
