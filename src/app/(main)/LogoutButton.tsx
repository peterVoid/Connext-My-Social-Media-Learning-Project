import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogoutButtonClick = () => {
    signOut();
  };
  return (
    <button onClick={handleLogoutButtonClick}>
      <LogOut /> Logout{" "}
    </button>
  );
}
