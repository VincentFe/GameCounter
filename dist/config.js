import path from "path";
const config = {
    port: parseInt(process.env.PORT || "3000", 10),
    baseDir: path.join(process.cwd(), "src"),
    dbDir: path.join(process.cwd(), "db"),
    publicDir: path.join(process.cwd(), "src", "public"),
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
};
export default config;
//# sourceMappingURL=config.js.map