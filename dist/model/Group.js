import crypto from "crypto";
/**
 * Generates a 16-character GUID.
 */
function generateGUID() {
    return crypto.randomBytes(8).toString("hex");
}
/**
 * Represents a named group of players.
 * Groups store player IDs to avoid duplicating player objects.
 */
export class Group {
    constructor(name, members = [], id) {
        this.id = id || generateGUID();
        this.name = (name || "").toString();
        this.members = Array.isArray(members) ? members.map((p) => String(p)) : [];
    }
    /**
     * Add a member to this group if not already present.
     * @param {string} name - The member name to add.
     * @returns {void}
     */
    addMember(name) {
        if (!this.members.includes(name))
            this.members.push(name);
    }
    /**
     * Remove a member from this group by name.
     * @param {string} name - The member name to remove.
     * @returns {void}
     */
    removeMember(name) {
        const i = this.members.indexOf(name);
        if (i !== -1)
            this.members.splice(i, 1);
    }
    /**
     * Serialize this group to a JSON-friendly object.
     * @returns {{ id: string; name: string; members: string[] }} JSON representation.
     */
    toJSON() {
        return { id: this.id, name: this.name, members: this.members };
    }
    /**
     * Create a Group instance from a JSON object.
     * @param {any} obj - Object containing group data.
     * @returns {Group} The reconstructed group instance.
     */
    static fromJSON(obj) {
        if (!obj)
            return new Group("");
        return new Group(obj.name || "", obj.members || [], obj.id);
    }
}
export default Group;
//# sourceMappingURL=Group.js.map