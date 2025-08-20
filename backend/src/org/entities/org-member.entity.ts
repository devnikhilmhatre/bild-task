export class OrgMember {
    orgId: string;
    userId: string;
    role: 'manager' | 'member';
    joinedAt: string;
}
