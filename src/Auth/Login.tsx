import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "./loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React from "react";

type LoginParams = {
  email: string;
  password: string;
};

type LoginResponse = {
  data: {
    token: string;
    coordinador: {
      Id: number;
      Nombre: string;
      Correo: string;
      Tipo: string;
    };
  };
};

// Hook definido fuera de la función Login
function useLoginRequest(options?: {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: unknown) => void;
}) {
  return useMutation<LoginResponse, unknown, LoginParams>({
    mutationFn: async ({ email, password }) => {
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Correo: email, Contraseña: password }),
      });
      if (!resp.ok) {
        // Aquí podrías leer resp.status (por ejemplo, 500) y/o resp.text() para tener más detalle.
        throw new Error("Error al iniciar sesión");
      }
      return resp.json();
    },
    ...options,
  });
}

export default function Login() {
  const navigate = useNavigate();
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isError, error } = useLoginRequest({
    onSuccess: (data) => {
      // Si el login fue exitoso, guarda el token (por ejemplo en localStorage)
      localStorage.setItem("authToken", data.data.token);
      // Redirige a la ruta protegida /general
      navigate("/general");
    },
    onError: (err) => {
      console.error("Error en Login:", err);
      // Aquí podrías actualizar un estado local para mostrar un mensaje en la UI
    },
  });

  const onSubmit = (formData: z.infer<typeof loginSchema>) => {
    mutate({ email: formData.email, password: formData.password });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-1/4">
        <CardHeader>
          <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form
              className="space-y-4"
              onSubmit={loginForm.handleSubmit(onSubmit)}
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo institucional</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese su correo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Ingrese su contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isError && (
                <p className="text-red-600 text-sm mt-2">
                  {error instanceof Error ? error.message : "Error desconocido"}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-gema-green hover:bg-green-600 text-black font-semibold mt-2"
              >
                Ingresar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}