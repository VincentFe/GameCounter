/**
 * Represents a named group of players.
 * Groups store player IDs to avoid duplicating player objects.
 */
export declare class Group {
    id: string;
    name: string;
    members: string[];
    constructor(name: string, members?: string[], id?: string);
    addMember(name: string): void;
    removeMember(name: string): void;
    toJSON(): {
        id: string;
        name: string;
        members: string[];
    };
    static fromJSON(obj: any): Group;
}
export default Group;
//# sourceMappingURL=Group.d.ts.map