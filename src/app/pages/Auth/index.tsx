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
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-200">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden min-h-screen">
            {/* Left Side - Form */}
            <div className="p-6 sm:p-8 lg:p-10 bg-white dark:bg-dark-100 flex items-center justify-center">
              <Card className="rounded-lg p-5 lg:p-7 bg-transparent dark:bg-transparent w-full" style={{ overflow: "visible" }}>
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
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white">
                    Welcome to <span className="text-main">Autobook</span> ERP
                  </h2>
                  <p className="mt-1 text-gray-700 dark:text-dark-400 leading-relaxed">
                    Streamline your business operations with a powerful and easy-to-use ERP platform.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                  <div className="space-y-4 mt-6">
                    <Input
                      label="Email"
                      placeholder="Enter Email"
                      prefix={<EnvelopeIcon className="size-5 transition-colors duration-200" strokeWidth="1" />}
                      {...register("email")}
                      error={errors?.email?.message}
                    />
                    <Input
                      label="Password"
                      placeholder="Enter Password"
                      type="password"
                      prefix={<LockClosedIcon className="size-5 transition-colors duration-200" strokeWidth="1" />}
                      {...register("password")}
                      error={errors?.password?.message}
                    />
                  </div>

                  <div className="mt-2">
                    <InputErrorMsg when={(errorMessage && errorMessage !== "") as boolean}>
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
            <div className="relative hidden lg:flex items-center justify-center">
              <img
                src="images/ammar/login.jpeg"
                alt="Login Banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </Page>
  );
}