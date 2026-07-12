import {useState} from "react";
import {router} from "expo-router";
import {useSignIn, useAuth} from "@clerk/expo";
import ForgotPasswordForm from "./forgot-password-form";
import ResetPasswordForm from "./reset-password-form";
import {AuthGuard} from "../../../components/auth-guard";

export default function ForgotPassword() {
  const {signIn} = useSignIn();
  const {signOut} = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);

  const onSendCode = async () => {
    setError("");
    setSubmitting(true);

    const {error: createError} = await signIn.create({
      identifier: email,
    });

    if (createError) {
      setError(createError.message ?? "Unable to find account.");
      setSubmitting(false);
      return;
    }

    const {error: sendError} = await signIn.resetPasswordEmailCode.sendCode();

    setSubmitting(false);

    if (sendError) {
      setError(sendError.message ?? "Unable to send code.");
      return;
    }

    setPendingReset(true);
  };

  const onResend = async () => {
    await signIn.resetPasswordEmailCode.sendCode();
  };

  const onResetPassword = async () => {
    setError("");
    setSubmitting(true);

    try {
      const verifyResult = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      });

      if (verifyResult.error) {
        setError(verifyResult.error.message ?? "Invalid code.");
        setSubmitting(false);
        return;
      }

      const resetResult = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });

      if (resetResult.error) {
        setError(resetResult.error.message ?? "Unable to reset password.");
        setSubmitting(false);
        return;
      }

      await signOut();

      setSubmitting(false);
      router.replace("/pages/sign-in");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reset password.",
      );
      setSubmitting(false);
    }
  };

  const content = pendingReset ? (
    <ResetPasswordForm
      code={code}
      newPassword={newPassword}
      showPassword={showPassword}
      onChangeCode={setCode}
      onChangePassword={setNewPassword}
      onTogglePassword={() => setShowPassword((v) => !v)}
      onSubmit={onResetPassword}
      onResend={onResend}
      submitting={submitting}
      error={error}
    />
  ) : (
    <ForgotPasswordForm
      email={email}
      onChangeEmail={setEmail}
      onSubmit={onSendCode}
      submitting={submitting}
      error={error}
    />
  );

  return <AuthGuard>{content}</AuthGuard>;
}
