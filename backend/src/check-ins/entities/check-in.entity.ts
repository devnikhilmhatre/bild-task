export class CheckInQuestion {
  id: string;
  text: string;
}

export class CheckIn {
  id: string;
  title: string;
  dueDate: string;
  questions: CheckInQuestion[];
  createdBy: string;
  createdAt: string;
  ModifiedAt: string;
  ModifiedBy: string;
  orgId: string;
}
