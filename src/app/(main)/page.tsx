import { Metadata } from "next";

import HomeTabs from "./HomeTabs";

export const metadata: Metadata = {
  title: "Home",
};

export default async function Home() {
  return (
    <main>
      <HomeTabs />
    </main>
  );
}
