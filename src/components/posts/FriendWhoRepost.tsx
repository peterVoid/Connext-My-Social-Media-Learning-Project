import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import Image from "next/image";

interface FriendWhoRepostProps {
  userData: {
    id: string;
    image: string | null;
    username: string;
  };
}

export default function FriendWhoRepost({ userData }: FriendWhoRepostProps) {
  return (
    <div className="relative size-10">
      <Image
        src={
          typeof userData.image === "string"
            ? userData.image
            : avatarPlaceholder
        }
        alt=""
        fill
        className="rounded-full object-contain"
      />
    </div>
  );
}
