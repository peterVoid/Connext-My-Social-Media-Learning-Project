import { Metadata } from "next";
import NotificationsHeader from "./NotificationsHeader";
import NotificationsContent from "./NotificationsContent";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function Page() {
  return (
    <div>
      <NotificationsHeader />
      <NotificationsContent />
    </div>
  );
}
