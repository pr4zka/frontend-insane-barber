"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, EnvelopeSimple, Lock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      login(res.data.user, res.data.token);
      router.push("/dashboard");
    } catch {
      setError("Credenciales incorrectas. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: "oklch(0.2 0.04 265)" }}
      >
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(oklch(0.7 0.14 265) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 px-16 text-center">
          {/* Logo */}
          <div className="mx-auto mb-10 flex size-24 items-center justify-center rounded-full border-2"
            style={{
              borderColor: "oklch(0.7 0.14 265)",
              background: "oklch(0.7 0.14 265 / 8%)",
            }}
          >
            <Scissors className="size-12" weight="bold" style={{ color: "oklch(0.7 0.14 265)" }} />
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-3"
            style={{ color: "oklch(0.96 0 0)" }}
          >
            Insane Barber
          </h1>
          <div className="w-16 h-0.5 mx-auto mb-6" style={{ background: "oklch(0.7 0.14 265)" }} />
          <p className="text-lg font-light tracking-wide"
            style={{ color: "oklch(0.55 0.02 265)" }}
          >
            Sistema de Gestion
          </p>

          {/* Decorative bottom */}
          <div className="mt-20 flex items-center justify-center gap-3"
            style={{ color: "oklch(0.35 0.015 265)" }}
          >
            <div className="h-px w-12" style={{ background: "oklch(0.35 0.015 265)" }} />
            <span className="text-xs font-medium tracking-[0.2em] uppercase">IVAN MARTINEZ. 2026</span>
            <div className="h-px w-12" style={{ background: "oklch(0.35 0.015 265)" }} />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Scissors className="size-7 text-primary" weight="bold" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Insane Barber</h1>
            <p className="text-sm text-muted-foreground mt-1">Sistema de Gestion</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Bienvenido</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ingrese sus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                Correo electronico
              </Label>
              <div className="relative">
                <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                Contrasena
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2.5">
                <p className="text-xs text-destructive font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-semibold tracking-wide" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesion"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground/60 mt-10">
            Insane Barber &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
