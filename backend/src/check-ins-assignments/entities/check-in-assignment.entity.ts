export class CheckInAssignment {
  checkInId: string;
  memberEmail: string;
  status: 'pending' | 'submitted';
  answers?: any[];
  assignedAt: string;
  submittedAt?: string;
}
