import { FaExclamationTriangle } from "react-icons/fa";
import { CardWrapper } from "@/components";

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

export { ErrorCard };
