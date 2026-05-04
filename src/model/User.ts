/**
 * Base User class for authentication and authorization.
 */
export class User {
  guid: string;
  username: string;
  password: string; // In production, this should be hashed

  /**
   * Create a new user instance.
   * @param {string} username - The user's username.
   * @param {string} password - The user's password (should be hashed in production).
   * @param {string} [guid] - Optional GUID, generated if not provided.
   */
  constructor(username: string, password: string, guid?: string) {
    this.guid = guid || this.generateGUID();
    this.username = username;
    this.password = password;
  }

  private generateGUID(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Check if the provided password matches.
   * @param {string} password - The password to check.
   * @returns {boolean} True if password matches.
   */
  checkPassword(password: string): boolean {
    return this.password === password;
  }

  /**
   * Check if user is a grandmaster.
   * @returns {boolean} Always false for base User.
   */
  isGrandmaster(): boolean {
    return false;
  }

  /**
   * Serialize to JSON.
   * @returns {Object} JSON representation.
   */
  toJSON(): { guid: string; username: string; role: string } {
    return { guid: this.guid, username: this.username, role: "user" };
  }
}

/**
 * Grandmaster user with elevated permissions.
 */
export class Grandmaster extends User {
  /**
   * Check if user is a grandmaster.
   * @returns {boolean} Always true for Grandmaster.
   */
  isGrandmaster(): boolean {
    return true;
  }

  /**
   * Serialize to JSON.
   * @returns {Object} JSON representation.
   */
  toJSON(): { guid: string; username: string; role: string } {
    return { guid: this.guid, username: this.username, role: "grandmaster" };
  }
}