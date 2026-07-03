import {useState} from "react";
import {router} from "expo-router";
import {useSignUp} from "@clerk/expo";
import Form from "./form";
import VerifyEmail from "./verify-email";

export default function SignUp() {
  const {signUp} = useSignUp();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const onSignUpPress = async () => {
    setError("");
    setSubmitting(true);

    const {error: signUpError} = await signUp.password({
      emailAddress: email,
      username,
      password,
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message ?? "Unable to sign up.");
      return;
    }

    await signUp.verifications.sendEmailCode();
    setPendingVerification(true);
  };

  const onVerifyPress = async () => {
    setError("");
    setSubmitting(true);

    const {error: verifyError} = await signUp.verifications.verifyEmailCode({
      code,
    });

    setSubmitting(false);

    if (verifyError) {
      setError(verifyError.message ?? "Invalid code.");
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: () => router.replace("../tasks"),
      });
    } else {
      setError("Additional verification required.");
    }
  };

  if (pendingVerification) {
    return (
      <VerifyEmail
        email={email}
        code={code}
        onChangeCode={setCode}
        onVerify={onVerifyPress}
        submitting={submitting}
        error={error}
      />
    );
  }

  return (
    <Form
      name={name}
      username={username}
      email={email}
      password={password}
      showPassword={showPassword}
      error={error}
      submitting={submitting}
      onChangeName={setName}
      onChangeUsername={setUsername}
      onChangeEmail={setEmail}
      onChangePassword={setPassword}
      onTogglePassword={() => setShowPassword((v) => !v)}
      onSubmit={onSignUpPress}
    />
  );
}
