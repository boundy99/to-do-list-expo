import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DismissKeyboard } from "../../components/dismiss-keyboard";

type Props = {
  email: string;
  code: string;
  onChangeCode: (code: string) => void;
  onVerify: () => void;
  submitting: boolean;
  error: string;
};

export default function VerifyEmail({
  email,
  code,
  onChangeCode,
  onVerify,
  submitting,
  error,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <DismissKeyboard>
        <View className="items-center justify-center flex-1 px-margin-mobile">
          <View className="items-center w-full mb-xl">
            <Text className="tracking-tight text-center font-display-lg-mobile text-display-lg-mobile text-on-background mb-xs">
              Check your email
            </Text>
            <Text className="text-center font-body-md text-body-md text-on-surface-variant opacity-80">
              Enter the code we sent to {email}
            </Text>
          </View>

          <View className="w-full gap-md">
            <TextInput
              className="w-full text-center border h-14 px-md rounded-xl bg-surface-container-lowest border-outline-variant font-body-md text-body-md text-on-surface"
              placeholder="123456"
              placeholderTextColor="#A0A7A5"
              keyboardType="number-pad"
              value={code}
              onChangeText={onChangeCode}
            />

            {error ? (
              <Text className="font-body-sm text-body-sm text-error">
                {error}
              </Text>
            ) : null}

            <Pressable
              className="items-center justify-center w-full h-14 bg-primary rounded-2xl active:opacity-90"
              onPress={onVerify}
              disabled={submitting}
            >
              <Text className="text-black font-headline-sm text-headline-sm">
                {submitting ? "Verifying..." : "Verify"}
              </Text>
            </Pressable>
          </View>
        </View>
      </DismissKeyboard>
    </SafeAreaView>
  );
}
