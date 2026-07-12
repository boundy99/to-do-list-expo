import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useSignIn } from "@clerk/expo";
import { useSignInWithGoogle } from "@clerk/expo/google";
import { links } from "../../../links";
import { AuthGuard } from "../../../components/auth-guard";
import { DismissKeyboard } from "../../../components/dismiss-keyboard";

function SignInContent() {
  const { signIn, fetchStatus } = useSignIn();
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const onSignInPress = async () => {
    setError("");

    const { error: signInError } = await signIn.password({
      identifier: email,
      password,
    });

    if (signInError) {
      setError(signInError.message ?? "Unable to sign in.");
      return;
    }

    switch (signIn.status) {
      case "complete":
        await signIn.finalize({
          navigate: () => router.replace("./tasks"),
        });
        break;

      case "needs_client_trust":
        const { error: emailError } = await signIn.emailCode.sendCode();
        if (emailError) {
          setError("Failed to send verification code");
          return;
        }
        setNeedsVerification(true);
        break;

      default:
        setError(`Verification required. Status: ${signIn.status}`);
    }
  };

  const onVerifyCodePress = async () => {
    setError("");

    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    const { error: verifyError } = await signIn.emailCode.verifyCode({
      code: verificationCode,
    });

    if (verifyError) {
      setError(verifyError.message ?? "Invalid verification code");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: () => router.replace("./tasks"),
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <DismissKeyboard>
        <View className="items-center justify-center flex-1 px-margin-mobile">
          <View className="items-center mb-xl">
            <Image
              source={{ uri: links.logo }}
              className="w-16 h-16 mb-md"
              resizeMode="contain"
            />
            <Text className="tracking-tight font-display-lg-mobile text-display-lg-mobile text-primary">
              DoIt
            </Text>
            <Text className="font-headline-sm text-headline-sm text-on-surface mt-xs">
              Welcome back
            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant">
              Sign in to your tasks
            </Text>
          </View>

          <View className="w-full gap-md">
            {!needsVerification ? (
              <>
                <View className="gap-xs">
                  <Text className="px-1 font-label-md text-label-md text-on-surface-variant">
                    Email
                  </Text>
                  <TextInput
                    className="w-full h-12 border px-md bg-surface-container-lowest border-outline-variant rounded-xl font-body-md text-body-md text-on-surface"
                    placeholder="name@example.com"
                    placeholderTextColor="#A0A7A5"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    editable={!needsVerification}
                  />
                </View>

                <View className="gap-xs">
                  <View className="flex-row items-center justify-between px-1">
                    <Text className="font-label-md text-label-md text-on-surface-variant">
                      Password
                    </Text>
                    <Link href="../forgot-password" asChild>
                      <Pressable>
                        <Text className="font-label-md text-label-md text-primary">
                          Forgot password?
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                  <View className="relative">
                    <TextInput
                      className="w-full h-12 pr-12 border px-md bg-surface-container-lowest border-outline-variant rounded-xl font-body-md text-body-md text-on-surface"
                      placeholder="••••••••"
                      placeholderTextColor="#A0A7A5"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={password}
                      onChangeText={setPassword}
                      editable={!needsVerification}
                    />
                    <Pressable
                      className="absolute top-0 justify-center h-12 right-md"
                      onPress={() => setShowPassword((v) => !v)}
                    >
                      <Text className="text-on-surface-variant">
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  className="items-center justify-center w-full h-14 mt-sm bg-primary rounded-xl active:opacity-90"
                  onPress={onSignInPress}
                  disabled={fetchStatus === "fetching"}
                >
                  {fetchStatus === "fetching" ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-black font-headline-sm text-headline-sm">
                      Sign In
                    </Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                <View className="gap-xs">
                  <Text className="px-1 font-label-md text-label-md text-on-surface-variant">
                    Verification Code
                  </Text>
                  <Text className="px-1 font-body-sm text-body-sm text-on-surface-variant">
                    Enter the code sent to {email}
                  </Text>
                  <TextInput
                    className="w-full h-12 border px-md bg-surface-container-lowest border-outline-variant rounded-xl font-body-md text-body-md text-on-surface"
                    placeholder="000000"
                    placeholderTextColor="#A0A7A5"
                    keyboardType="number-pad"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    maxLength={6}
                  />
                </View>

                <Pressable
                  className="items-center justify-center w-full h-14 mt-sm bg-primary rounded-xl active:opacity-90"
                  onPress={onVerifyCodePress}
                  disabled={fetchStatus === "fetching"}
                >
                  {fetchStatus === "fetching" ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-black font-headline-sm text-headline-sm">
                      Verify Code
                    </Text>
                  )}
                </Pressable>
              </>
            )}

            {error ? (
              <Text className="font-body-sm text-body-sm text-error">
                {error}
              </Text>
            ) : null}
          </View>

          <View className="mt-xl">
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <Link href="./sign-up" asChild>
                <Text className="font-semibold text-primary">Sign Up</Text>
              </Link>
            </Text>
          </View>
        </View>
      </DismissKeyboard>
    </SafeAreaView>
  );
}

export default function SignInScreen() {
  return (
    <AuthGuard>
      <SignInContent />
    </AuthGuard>
  );
}
