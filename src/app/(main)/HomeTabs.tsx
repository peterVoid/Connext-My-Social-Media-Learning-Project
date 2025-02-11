"use client";

import ForYouFeed from "./ForYouFeed";
import PostEditor from "./PostEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import { useSession } from "next-auth/react";

export default function HomeTabs() {
  const { data } = useSession();

  if (!data?.user) {
    return null;
  }

  return (
    <div>
      <PostEditor />
      <Tabs defaultValue="for-you">
        <TabsList className="grid w-full grid-cols-2 bg-black">
          <TabsTrigger value="for-you">For you</TabsTrigger>
          <TabsTrigger value="followings">Following</TabsTrigger>
        </TabsList>
        <TabsContent key="for-you" value="for-you">
          <ForYouFeed />
        </TabsContent>
        <TabsContent key="followings" value="followings">
          <FollowingFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
