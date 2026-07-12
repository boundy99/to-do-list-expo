import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Link } from "expo-router";
import { DismissKeyboard } from "../../../components/dismiss-keyboard";

type Props = {
  email: string;
  onChangeEmail: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
};

export default function ForgotPasswordForm({
  email,
  onChangeEmail,
  onSubmit,
  submitting,
  error,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-row items-center border-b px-margin-mobile h-14 border-outline-variant/20">
        <Pressable
          onPress={() => router.back()}
          className="p-1 -ml-1 active:opacity-70"
        >
          <Text className="text-primary font-label-md text-label-md">
            ← Back
          </Text>
        </Pressable>
      </View>

      <DismissKeyboard>
        <View className="items-center justify-center flex-1 px-margin-mobile">
          <View className="w-full gap-lg">
            <View className="gap-xs">
              <Text className="tracking-tight font-display-lg-mobile text-display-lg-mobile text-on-surface">
                Reset your password
              </Text>
              <Text className="font-body-md text-body-md text-on-surface-variant">
                Enter your email and we'll send you a code
              </Text>
            </View>

            <View className="gap-md">
              <View className="gap-xs">
                <Text className="ml-1 font-label-md text-label-md text-on-surface-variant">
                  Email Address
                </Text>
                <TextInput
                  className="w-full border h-14 px-md bg-surface-container-low border-outline-variant rounded-xl font-body-md text-body-md text-on-surface"
                  placeholder="name@example.com"
                  placeholderTextColor="#A0A7A5"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={onChangeEmail}
                />
              </View>

              {error ? (
                <Text className="font-body-sm text-body-sm text-error">
                  {error}
                </Text>
              ) : null}

              <Pressable
                className="items-center justify-center w-full h-14 bg-primary rounded-xl active:opacity-90"
                onPress={onSubmit}
                disabled={submitting}
              >
                <Text className="text-black font-label-md text-label-md">
                  {submitting ? "Sending..." : "Send Code"}
                </Text>
              </Pressable>
            </View>

            <View className="items-center">
              <Text className="font-body-sm text-body-sm text-on-surface-variant">
                Remembered your password?{" "}
                <Link href="../sign-in" asChild>
                  <Text className="font-semibold text-primary">Log in</Text>
                </Link>
              </Text>
            </View>
          </View>
        </View>
      </DismissKeyboard>
    </SafeAreaView>
  );
}
