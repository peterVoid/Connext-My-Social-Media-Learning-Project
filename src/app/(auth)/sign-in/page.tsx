import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignInForm from "./SignInForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function Page() {
  return (
    <Card className="w-[500px] border border-white/20 bg-black text-white">
      <CardHeader>
        <CardTitle>Log in to Connext</CardTitle>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p>{"Don't have an account?"}</p>
        <Button asChild className="w-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
