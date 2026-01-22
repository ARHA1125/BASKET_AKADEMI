export interface InvoiceData {
    id: string;
    student: {
        name: string;
        grade: string;
    };
    items: any[];
    total: number;
}

export interface InvoiceHeaderProps {
  data: {
    id: string;
    school: { name: string; };
    student: {
      name: string;
      id: string;
      grade: string;
      address: string;
      studentNames?: string[];
    };
    issueDate: string;
    dueDate: string;
    status: string;
  };
}