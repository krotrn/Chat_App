import VerificationForm from "@/components/auth/VerificationForm";
export default function Page({searchParams}: {searchParams:{email?:string}}) {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <VerificationForm email = {searchParams.email} />
    </div>
  );
}
