"use client";

import { cn } from "@/lib/utils";
import { Bell, Home, LucideIcon, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import LogoutButton from "./LogoutButton";

const SIDEBAR_LINKS: { title: string; Icon: LucideIcon; href: string }[] = [
  { title: "Home", Icon: Home, href: "/" },
  { title: "Notifications", Icon: Bell, href: "/notifications" },
  { title: "Profile", Icon: User, href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const { data } = useSession();

  if (!data?.user) {
    return null;
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-14 border-r border-white/20 px-2 py-9 md:w-56 md:px-5">
      <div className="flex h-full flex-col">
        <div className="space-y-4">
          {SIDEBAR_LINKS.map((item) => (
            <Link
              key={item.title}
              href={
                item.title === "Profile" && data?.user.username
                  ? `/${data?.user.username}`
                  : item.href
              }
              className="flex cursor-pointer items-center gap-3 rounded-full p-2 hover:bg-white/20"
            >
              <item.Icon size={22} />
              <h2
                className={cn(
                  "hidden font-medium md:block",
                  pathname === item.href && "font-bold",
                )}
              >
                {item.title}
              </h2>
            </Link>
          ))}
        </div>
        <div className="mt-auto">
          <UserSidebarOptions
            firstname={data.user.firstname}
            surname={data.user.surname}
            image={data.user.image}
            username={data.user.username}
          />
        </div>
      </div>
    </aside>
  );
}

interface UserSidebarOptionsProps {
  image?: string | null;
  username?: string | null;
  firstname: string;
  surname?: string | null;
}

function UserSidebarOptions({
  firstname,
  image,
  surname,
  username,
}: UserSidebarOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex w-full cursor-pointer items-center gap-1 rounded-md hover:bg-white/10">
          <div className="relative size-10">
            <Image
              src={image || avatarPlaceholder}
              alt="User image"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="hidden space-y-1 md:block">
            <div className="line-clamp-1 text-sm">{`${firstname} ${surname}`}</div>
            <div className="text-xs text-muted-foreground">@{username}</div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
