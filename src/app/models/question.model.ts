export interface Question {
  id?: string; // optional because new questions don't have an ID yet
  prompt: string;
  answers: string[];
  createdAt?: string;
  updatedAt?: string;
}
