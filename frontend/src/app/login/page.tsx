"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api-client";
import { credentialsSchema, type AuthMode, type CredentialValues } from "@/lib/validation";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [formError, setFormError] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CredentialValues>({
    resolver: zodResolver(credentialsSchema(mode)),
    defaultValues: { name: "", email: "", password: "" },
  });

  // Someone arriving with a live session has no business on this page.
  useEffect(() => {
    if (!isLoading && user) router.replace("/projects");
  }, [isLoading, user, router]);

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setFormError(null);
    try {
      if (isSignUp) await signUp(name, email, password);
      else await signIn(email, password);
      router.replace("/projects");
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;

      // Field-level problems belong on the field; everything else goes above.
      for (const [field, messages] of Object.entries(error.fieldErrors ?? {})) {
        if (messages?.[0]) setError(field as keyof CredentialValues, { message: messages[0] });
      }
      setFormError(error.message);
    }
  });

  const switchMode = () => {
    setMode(isSignUp ? "sign-in" : "sign-up");
    setFormError(null);
    reset();
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-brand text-white">
            <LayoutGrid className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold">
              {isSignUp ? "Create your account" : "Sign in to your dashboard"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isSignUp ? "Takes a moment." : "Track status, deadlines, owners and budget."}
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          {formError && (
            <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          )}

          {isSignUp && (
            <Field label="Name" htmlFor="name" error={errors.name?.message}>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Ada Lovelace"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
            </Field>
          )}

          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint={isSignUp ? "At least 8 characters" : undefined}
          >
            <Input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </Field>

          <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
            {isSignUp ? "Create account" : "Sign in"}
          </Button>

          <p className="text-center text-sm text-muted">
            {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-brand hover:underline"
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </p>
        </form>

        {!isSignUp && (
          <p className="mt-4 text-center text-sm text-muted">
            Seeded demo account: <code className="text-ink">demo@saasdash.dev</code> /{" "}
            <code className="text-ink">demo12345</code>
          </p>
        )}
      </div>
    </main>
  );
}
