/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";
import { Button, Card, Checkbox, Label, TextInput } from "flowbite-react";
import type { FC, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../public/images/logo.png";

const SignInPage: FC = function () {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    if (email === "teller@gmail.com" && password === "teller123") {
      localStorage.setItem("role", "teller");
      navigate("/dashboard");
      setError("");
    } else if (email === "meterman@gmail.com" && password === "meter123") {
      localStorage.setItem("role", "meter");
      navigate("/billing");
      setError("");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1950&q=80')",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <img alt="Flowbite logo" src={logo} className="h-28 drop-shadow-lg" />
        </div>
        <Card className="w-full p-6 backdrop-blur-sm bg-white/80 dark:bg-gray-800/70 shadow-2xl rounded-2xl">
          <h1 className="mb-3 text-2xl font-bold text-center text-gray-800 dark:text-white md:text-3xl">
            Sign in to WaterWorks
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="email" value="Your email" />
              <TextInput
                id="email"
                name="email"
                placeholder="name@company.com"
                type="email"
                required
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="password" value="Your password" />
              <TextInput
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                required
                className="mt-1"
              />
            </div>
            {error && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full mt-2">
              Login to your account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            <a
              href="#"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Forgot your password?
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;
