import { Card, Input, Button, Typography } from "@material-tailwind/react";
import { cache } from "cache/cache";
import Cookies from "js-cookie";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

type Inputs = {
  email: string;
  password: string;
};

export function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const response = await fetch("/1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Unknown");
      }

      const { tokens, user } = await response.json();

      Cookies.set("token", tokens.access.token);

      cache.httpCache.setState(cache.httpCache.getInitialState());

      navigate("/");
    } catch (err) {
      alert("An unknown error occurred, please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center align-middle h-full w-full p-20">
      <Card color="transparent" shadow={false}>
        <Typography variant="h4" color="blue-gray">
          Login
        </Typography>
        <Typography color="gray" className="mt-1 font-normal">
          Nice to see you again!
        </Typography>
        <form
          className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Your Email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              {...register("email", { required: true })}
              error={!!errors.email}
            />
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              {...register("password", { required: true })}
              error={!!errors.password}
            />
          </div>
          <Button className="mt-6" fullWidth type="submit">
            Login
          </Button>
          <Typography color="gray" className="mt-4 text-center font-normal">
            Don't have an acccount?{" "}
            <Link to="/signup" className="font-medium text-gray-900">
              Sign Up
            </Link>
          </Typography>
        </form>
      </Card>
    </div>
  );
}
