import { FaExclamationTriangle } from "react-icons/fa";
import { CardWrapper } from "@/components/auth/card-wrapper";

const ErrorCard = () => {
  return (
    <CardWrapper
      backButtonHref="/login"
      backButtonLabel="Back to login"
      headerLabel="Oops! Someting went wrong!"
    >
      <div className="flex items-center justify-center w-full">
        <FaExclamationTriangle className="text-destructive " />
      </div>
    </CardWrapper>
  );
};

export default ErrorCard;
