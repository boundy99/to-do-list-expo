import {View, Text, TextInput, Pressable} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {router} from "expo-router";

type Props = {
  code: string;
  newPassword: string;
  showPassword: boolean;
  onChangeCode: (v: string) => void;
  onChangePassword: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onResend: () => void;
  submitting: boolean;
  error: string;
};

export default function ResetPasswordForm({
  code,
  newPassword,
  showPassword,
  onChangeCode,
  onChangePassword,
  onTogglePassword,
  onSubmit,
  onResend,
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
        <Text className="ml-sm font-headline-sm text-headline-sm text-primary">
          DoIt
        </Text>
      </View>

      <View className="items-center justify-center flex-1 px-margin-mobile">
        <View className="w-full gap-lg">
          <View className="items-center gap-xs">
            <Text className="tracking-tight text-center font-display-lg-mobile text-display-lg-mobile text-on-surface">
              Check your email
            </Text>
            <Text className="text-center font-body-md text-body-md text-on-surface-variant">
              Enter the code we sent you and choose a new password
            </Text>
          </View>

          <View className="border bg-surface-container rounded-xl p-md gap-lg border-outline-variant/20">
            <View className="gap-sm">
              <Text className="tracking-widest uppercase font-label-md text-label-md text-on-surface-variant">
                Verification Code
              </Text>
              <TextInput
                className="w-full text-center border h-14 px-md bg-surface-container-high border-outline-variant rounded-xl font-headline-md text-headline-md text-on-surface"
                placeholder="123456"
                placeholderTextColor="#A0A7A5"
                keyboardType="number-pad"
                value={code}
                onChangeText={onChangeCode}
              />
            </View>

            <View className="gap-sm">
              <Text className="tracking-widest uppercase font-label-md text-label-md text-on-surface-variant">
                New Password
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full pr-12 border h-14 pl-md bg-surface-container-high border-outline-variant rounded-xl font-body-md text-body-md text-on-surface"
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#A0A7A5"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={newPassword}
                  onChangeText={onChangePassword}
                />
                <Pressable
                  className="absolute top-0 justify-center right-md h-14"
                  onPress={onTogglePassword}
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
              className="items-center justify-center w-full rounded-full h-14 bg-primary active:opacity-90"
              onPress={onSubmit}
              disabled={submitting}
            >
              <Text className="tracking-widest text-black uppercase font-label-md text-label-md">
                {submitting ? "Resetting..." : "Reset Password"}
              </Text>
            </Pressable>

            <View className="items-center">
              <Text className="font-body-sm text-body-sm text-on-surface-variant">
                Didn't receive the code?{" "}
                <Text className="font-semibold text-primary" onPress={onResend}>
                  Resend code
                </Text>
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center gap-xs opacity-60">
            <Text className="tracking-tight uppercase font-label-md text-label-md text-on-surface-variant">
              🔒 Secure end-to-end encryption
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
