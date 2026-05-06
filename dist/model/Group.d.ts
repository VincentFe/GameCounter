/**
 * Represents a named group of players.
 * Groups store player IDs to avoid duplicating player objects.
 */
export declare class Group {
    id: string;
    name: string;
    members: string[];
    constructor(name: string, members?: string[], id?: string);
    /**
     * Add a member to this group if not already present.
     * @param {string} name - The member name to add.
     * @returns {void}
     */
    addMember(name: string): void;
    /**
     * Remove a member from this group by name.
     * @param {string} name - The member name to remove.
     * @returns {void}
     */
    removeMember(name: string): void;
    /**
     * Serialize this group to a JSON-friendly object.
     * @returns {{ id: string; name: string; members: string[] }} JSON representation.
     */
    toJSON(): {
        id: string;
        name: string;
        members: string[];
    };
    /**
     * Create a Group instance from a JSON object.
     * @param {any} obj - Object containing group data.
     * @returns {Group} The reconstructed group instance.
     */
    static fromJSON(obj: any): Group;
}
export default Group;
//# sourceMappingURL=Group.d.ts.map