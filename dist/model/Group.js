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
    addMember(name) {
        if (!this.members.includes(name))
            this.members.push(name);
    }
    removeMember(name) {
        const i = this.members.indexOf(name);
        if (i !== -1)
            this.members.splice(i, 1);
    }
    toJSON() {
        return { id: this.id, name: this.name, members: this.members };
    }
    static fromJSON(obj) {
        if (!obj)
            return new Group("");
        return new Group(obj.name || "", obj.members || [], obj.id);
    }
}
export default Group;
//# sourceMappingURL=Group.js.map