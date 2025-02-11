"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInSchema, type signInValues } from "@/lib/validations";
import { useState } from "react";
import { signInAction } from "./action";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import LoadingButton from "@/components/LoadingButton";

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const { toast } = useToast();

  const form = useForm<signInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

  async function onSubmitHandler(values: signInValues) {
    try {
      setIsLoading(true);
      const { success, message } = await signInAction(values);

      if (!success) {
        toast({
          variant: "destructive",
          title: message,
        });
        return;
      }

      await signIn("credentials", {
        email: values.emailAddress,
        password: values.password,
        redirect: false,
      }).catch((error) => {
        console.error(error);
      });

      router.push("/");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="emailAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="email address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="Password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full items-center justify-center">
          <LoadingButton isLoading={isLoading} buttonText="Sign In" />
        </div>
      </form>
    </Form>
  );
}
