// Import Dependencies
import { useNavigate } from "react-router";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

// Local Imports
import { Button, Card, Checkbox, Input, InputErrorMsg } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { APP_LOGO } from "@/constants/app";
import { AuthFormValues, schema } from "./schema";
import { Page } from "@/components/shared/Page";

// ----------------------------------------------------------------------

export default function SignIn() {
  const { login, errorMessage } = useAuthContext();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthFormValues) => {
    try {
      await login({ email: data.email, password: data.password });
      navigate("/select-company");
    } catch (err) {
      // error handled by context
    }
  };

  return (
    <Page title="Login">
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full">
          <div className="grid min-h-screen grid-cols-1 gap-0 overflow-hidden lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center bg-white p-6 sm:p-8 lg:p-10">
              <Card
                className="w-full rounded-lg bg-transparent p-5 lg:p-7"
                style={{ overflow: "visible" }}
              >
                <div className="mb-8 flex justify-start">
                  <img
                    src={APP_LOGO}
                    alt="Autobook ERP"
                    className="h-12 w-auto object-contain sm:h-14"
                  />
                </div>
                <div
                  style={{
                    borderTop: "6px solid #1a2fa8",
                    borderBottom: "6px solid #1a2fa8",
                    borderRadius: "40px",
                    width: "100%",
                  }}
                ></div>

                <div className="mt-6 text-left">
                  <h2 className="text-primary text-2xl font-bold sm:text-3xl">
                    Welcome to <span className="text-main">Autobook</span> ERP
                  </h2>
                  <p className="mt-1 leading-relaxed text-gray-600">
                    Streamline your business operations with a powerful and
                    easy-to-use ERP platform.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                  <div className="mt-6 space-y-4">
                    <Input
                      label="Email"
                      placeholder="Enter Email"
                      prefix={
                        <EnvelopeIcon
                          className="size-5 text-gray-500"
                          strokeWidth="1"
                        />
                      }
                      className="focus:border-primary border-gray-300 bg-white text-gray-800"
                      {...register("email")}
                      error={errors?.email?.message}
                    />
                    <Input
                      label="Password"
                      placeholder="Enter Password"
                      type="password"
                      prefix={
                        <LockClosedIcon
                          className="size-5 text-gray-500"
                          strokeWidth="1"
                        />
                      }
                      className="focus:border-primary border-gray-300 bg-white text-gray-800"
                      {...register("password")}
                      error={errors?.password?.message}
                    />
                  </div>

                  <div className="mt-2">
                    <InputErrorMsg
                      when={(errorMessage && errorMessage !== "") as boolean}
                    >
                      {errorMessage}
                    </InputErrorMsg>
                  </div>

                  <div className="mt-4 flex items-center justify-between space-x-2">
                    <Checkbox label="Remember me" />
                  </div>

                  <Button type="submit" className="mt-5 w-full" color="primary">
                    Sign In
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right Side - Image */}
            <div className="relative hidden items-center justify-center lg:flex">
              <img
                src="images/ammar/login.jpeg"
                alt="Login Banner"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </Page>
  );
}
