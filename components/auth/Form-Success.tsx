import { CheckCircle2 } from "lucide-react";

interface FormSuccessProps {
  message?: string;
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  return (
    message && (
      <div className="bg-emerald-500/15 p-3 rounded-md flex items-center justify-center gap-x-2 text-sm text-emerald-500">
        <CheckCircle2 />
        <p>{message}</p>
      </div>
    )
  );
};
