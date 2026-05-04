/**
 * Base User class for authentication and authorization.
 */
export declare class User {
    guid: string;
    username: string;
    password: string;
    /**
     * Create a new user instance.
     * @param {string} username - The user's username.
     * @param {string} password - The user's password (should be hashed in production).
     * @param {string} [guid] - Optional GUID, generated if not provided.
     */
    constructor(username: string, password: string, guid?: string);
    private generateGUID;
    /**
     * Check if the provided password matches.
     * @param {string} password - The password to check.
     * @returns {boolean} True if password matches.
     */
    checkPassword(password: string): boolean;
    /**
     * Check if user is a grandmaster.
     * @returns {boolean} Always false for base User.
     */
    isGrandmaster(): boolean;
    /**
     * Serialize to JSON.
     * @returns {Object} JSON representation.
     */
    toJSON(): {
        guid: string;
        username: string;
        role: string;
    };
}
/**
 * Grandmaster user with elevated permissions.
 */
export declare class Grandmaster extends User {
    /**
     * Check if user is a grandmaster.
     * @returns {boolean} Always true for Grandmaster.
     */
    isGrandmaster(): boolean;
    /**
     * Serialize to JSON.
     * @returns {Object} JSON representation.
     */
    toJSON(): {
        guid: string;
        username: string;
        role: string;
    };
}
//# sourceMappingURL=User.d.ts.map