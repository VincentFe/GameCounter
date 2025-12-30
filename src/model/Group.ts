import crypto from "crypto";

/**
 * Generates a 16-character GUID.
 */
function generateGUID(): string {
  return crypto.randomBytes(8).toString("hex");
}

/**
 * Represents a named group of players.
 * Groups store player IDs to avoid duplicating player objects.
 */
export class Group {
  id: string;
  name: string;
  members: string[];

  constructor(name: string, members: string[] = [], id?: string) {
    this.id = id || generateGUID();
    this.name = (name || "").toString();
    this.members = Array.isArray(members) ? members.map((p) => String(p)) : [];
  }

  addMember(name: string) {
    if (!this.members.includes(name)) this.members.push(name);
  }

  removeMember(name: string) {
    const i = this.members.indexOf(name);
    if (i !== -1) this.members.splice(i, 1);
  }

  toJSON(): { id: string; name: string; members: string[] } {
    return { id: this.id, name: this.name, members: this.members };
  }

  static fromJSON(obj: any): Group {
    if (!obj) return new Group("");
    return new Group(obj.name || "", obj.members || [], obj.id);
  }
}

export default Group;
