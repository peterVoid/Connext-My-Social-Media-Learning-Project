"use client";

import {
  InfiniteNotificationsType,
  NotificationsDataServerType,
} from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { formatDate } from "@/lib/utils";

export default function NotificationsContent() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<InfiniteNotificationsType>({
      queryKey: ["notifications"],
      queryFn: async ({ pageParam }) => {
        const response = await axios.get(
          `/api/users/notifications?cursor=${pageParam}&limit=10`,
        );
        return response.data;
      },
      initialPageParam: null,
      refetchInterval: 60000,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === "pending") {
    return (
      <div>
        <Loader2 className="mx-auto mt-3 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return <div>Error</div>;
  }

  return (
    <div className="space-y-10 p-8">
      <h1 className="text-4xl font-bold">Notifications</h1>
      {data.pages.map((page, pageIndex) => (
        <div key={pageIndex} className="space-y-5">
          {page.notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <NotificationItem notification={notification} />
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: NotificationsDataServerType;
}

function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <Link
      href={`/${notification.sender.username}/status/${notification.postId}`}
      className="flex items-center gap-3 rounded-md p-3 hover:bg-white/20"
    >
      <div className="relative size-12">
        <Image
          src={notification.sender.image || avatarPlaceholder}
          alt="User image"
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div>
        <span className="text-md mr-1 font-bold">
          {notification.sender.username}
        </span>
        <span>{notification.type.toLowerCase()} your story.</span>
      </div>
      <p>{formatDate(notification.createdAt)}</p>
    </Link>
  );
}
