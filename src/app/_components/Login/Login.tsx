"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { signIn } from "next-auth/react";
import React, { type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type LoginData = {
  id: string;
  password: string;
};

const Login = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [formData, setFormData] = React.useState<LoginData>({
    id: "",
    password: "",
  });

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  async function onSubmit(event: React.SyntheticEvent) {
    // start the loading spinner
    setIsLoading(true);
    event.preventDefault();

    // @ts-expect-error error exists
    const { error } = await signIn("credentials", {
      username: formData.id,
      password: formData.password,
      error: true,
      redirect: false,
    });

    if (!error) {
      router.push("/dashboard");
    } else {
      // TODO: Display error
      setIsLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-gray-100 p-8",
        className,
      )}
      {...props}
    >
      <form onSubmit={onSubmit}>
        <div className="grid gap-2 w-[20vw]">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email or Username
            </Label>
            <Input
              id="id"
              placeholder="name@example.com or your username"
              type="text"
              autoCapitalize="none"
              autoComplete="text"
              autoCorrect="off"
              disabled={isLoading}
              onChange={onChange}
            />
            <Input
              id="password"
              placeholder="password"
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              onChange={onChange}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Login;