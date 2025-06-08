export interface AIModel {
  id: string;
  name: string;
  avatar: string;
  apiKey: string;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  models?: AIModel[];
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
