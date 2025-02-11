import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignUpForm from "./SignUpForm";
import { Metadata } from "next";

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
    </Card>
  );
}
