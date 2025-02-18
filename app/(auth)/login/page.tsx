
import LoginForm from "@/components/auth/Login-Form";

/**
 * Page component that renders the login form centered on the screen.
 *
 * @returns {React.ReactNode} The JSX code for the login page.
 */
const Page = (): React.ReactNode => {
  return (
    <div className="min-h-screen flex items-center justify-center">
        <LoginForm />
    </div>
  );
};

export default Page;
