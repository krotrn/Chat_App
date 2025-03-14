import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatDetailsProps {
  onClose: () => void;
  isLoading?: boolean;
}

export default function ChatDetails({
  onClose,
  isLoading = false,
}: ChatDetailsProps) {
  if (isLoading) return null; // Handle loading elsewhere if needed
  return (
    <motion.div
      className="w-80 border-l bg-background"
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h3 className="font-semibold">Chat Details</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
