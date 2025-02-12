import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignUpForm from "./SignUpForm";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function Page() {
  return (
    <Card className="max-w-5xl border border-white/20 bg-black text-white">
      <CardHeader>
        <CardTitle>Create new account</CardTitle>
        <CardDescription>{"It's quick and easy. Come on!"}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p>{"Have an account?"}</p>
        <Button asChild className="w-full">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
