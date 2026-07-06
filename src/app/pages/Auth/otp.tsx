// Import Dependencies
import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useNavigate } from "react-router";

// Local Imports
import { Button, Card, InputErrorMsg } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { APP_LOGO } from "@/constants/app";
import { Page } from "@/components/shared/Page";
import { getSelectedCompany } from "@/utils/companyStorage";

// ----------------------------------------------------------------------

const OTP_LENGTH = 4;


export default function OtpVerify() {
    
  const { verifyOtp, errorMessage, user } = useAuthContext();
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!getSelectedCompany()) {
      navigate("/select-company");
    }
  }, [user, navigate]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer === 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < OTP_LENGTH) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight") {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < OTP_LENGTH) return;
    setLoading(true);
    try {
      await verifyOtp(otpValue);
      navigate("/dashboards/home");
    } catch {
      // error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setResendTimer(30);
    focusInput(0);
    // call your resend OTP API here if needed
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <Page title="OTP Verification">
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-200">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden min-h-screen">

            {/* Left Side - Form */}
            <div className="p-6 sm:p-8 lg:p-10 bg-white dark:bg-dark-100 flex items-center justify-center">
              <Card className="rounded-lg p-5 lg:p-7 bg-transparent dark:bg-transparent w-full">
              <div className="mb-8 flex justify-center">
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
                >

                </div>
                {/* Header */}
                <div className="mb-6 mt-10 text-center">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                    OTP Verification
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                    Enter the 4-digit code sent to your registered email
                  </p>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off">
                  {/* OTP Inputs */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        className="h-12 w-10 sm:h-14 sm:w-12 rounded-lg border border-gray-300 bg-transparent text-center text-lg font-semibold text-gray-800 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-dark-450 dark:text-dark-50 dark:focus:border-primary-400"
                      />
                    ))}
                  </div>

                  <div className="mt-3">
                    <InputErrorMsg when={(errorMessage && errorMessage !== "") as boolean}>
                      {errorMessage}
                    </InputErrorMsg>
                  </div>

                  <Button
                    type="submit"
                    className="mt-6 w-full"
                    color="primary"
                    disabled={!isComplete || loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </form>

                {/* Resend */}
                <div className="mt-5 text-center text-xs text-gray-500 dark:text-dark-300">
                  {resendTimer > 0 ? (
                    <p>
                      Resend code in{" "}
                      <span className="font-medium text-gray-700 dark:text-dark-100">
                        {resendTimer}s
                      </span>
                    </p>
                  ) : (
                    <p>
                      Didn't receive code?{" "}
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600 font-medium"
                      >
                        Resend OTP
                      </button>
                    </p>
                  )}
                </div>

                {/* Back to login */}
                <div className="mt-3 text-center text-xs text-gray-500 dark:text-dark-300">
                  <button
                    type="button"
                    onClick={() => navigate("/select-company")}
                    className="text-gray-400 transition-colors hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100"
                  >
                    ← Back to Select Company
                  </button>
                </div>

              </Card>
            </div>

            {/* Right Side - Image */}
            <div className="relative hidden lg:flex items-center justify-center">
              <img
                src="images/ammar/login.jpeg"
                alt="OTP Verification"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

          </div>
        </div>
      </main>
    </Page>
  );
}