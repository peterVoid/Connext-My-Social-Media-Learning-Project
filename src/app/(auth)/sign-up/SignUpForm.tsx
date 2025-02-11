"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { signUpSchema, type signUpValues } from "@/lib/validations";
import { signUp } from "./action";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const router = useRouter();

  const form = useForm<signUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      emailAddress: "",
      firstname: "",
      password: "",
      surname: "",
    },
  });

  async function onSubmitHandler(values: signUpValues) {
    try {
      setIsLoading(true);
      const { success, message } = await signUp(values);

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

      toast({
        title: message,
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
        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firstname</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Firstname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surname</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Surname" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 border border-white/30 px-3 py-1">
                    <Input
                      type="radio"
                      {...field}
                      value="MALE"
                      checked={field.value === "MALE"}
                      onChange={() => form.setValue("gender", "MALE")}
                    />
                    MALE
                  </label>
                  <label className="flex items-center gap-2 border border-white/30 px-3 py-1">
                    <Input
                      type="radio"
                      {...field}
                      value="FEMALE"
                      checked={field.value === "FEMALE"}
                      onChange={() => form.setValue("gender", "FEMALE")}
                    />
                    FEMALE
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
          <LoadingButton isLoading={isLoading} buttonText="Sign Up" />
        </div>
      </form>
    </Form>
  );
}
