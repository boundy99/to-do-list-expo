import {useState} from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Link, router} from "expo-router";
import {useSignIn} from "@clerk/expo";
import {useSignInWithGoogle} from "@clerk/expo/google";
import {links} from "../../links";
import {AuthGuard} from "../../components/auth-guard";

function SignInContent() {
  const {signIn, fetchStatus} = useSignIn();
  const {startGoogleAuthenticationFlow} = useSignInWithGoogle();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const onSignInPress = async () => {
    setError("");

    const {error: signInError} = await signIn.password({
      identifier: email,
      password,
    });

    if (signInError) {
      setError(signInError.message ?? "Unable to sign in.");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: () => router.replace("./tasks"),
      });
    } else {
      setError("Additional verification required.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="items-center justify-center flex-1 px-margin-mobile">
        <View className="items-center mb-xl">
          <Image
            source={{uri: links.logo}}
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

          {error ? (
            <Text className="font-body-sm text-body-sm text-error">
              {error}
            </Text>
          ) : null}

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
