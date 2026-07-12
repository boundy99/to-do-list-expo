import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { getStrength, getStrengthMeta } from "../../../utils";
import { DismissKeyboard } from "../../../components/dismiss-keyboard";

type Props = {
  name: string;
  username: string;
  email: string;
  password: string;
  showPassword: boolean;
  error: string;
  submitting: boolean;
  onChangeName: (v: string) => void;
  onChangeUsername: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
};

export default function Form({
  name,
  username,
  email,
  password,
  showPassword,
  error,
  submitting,
  onChangeName,
  onChangeUsername,
  onChangeEmail,
  onChangePassword,
  onTogglePassword,
  onSubmit,
}: Props) {
  const strength = getStrength(password);
  const meta = getStrengthMeta(strength, password.length);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <DismissKeyboard>
        <View className="items-center justify-center flex-1 px-margin-mobile">
          <View className="items-center w-full mb-xl">
            <Text className="tracking-tight text-center font-display-lg-mobile text-display-lg-mobile text-on-background mb-xs">
              Create your account
            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant opacity-80">
              Start organizing your tasks
            </Text>
          </View>

          <View className="w-full gap-md">
            <View className="gap-xs">
              <Text className="ml-1 font-label-md text-label-md text-on-surface-variant">
                Name
              </Text>
              <TextInput
                className="w-full border h-14 px-md rounded-xl bg-surface-container-lowest border-outline-variant font-body-md text-body-md text-on-surface"
                placeholder="John Doe"
                placeholderTextColor="#A0A7A5"
                value={name}
                onChangeText={onChangeName}
              />
            </View>

            <View className="gap-xs">
              <Text className="ml-1 font-label-md text-label-md text-on-surface-variant">
                Username
              </Text>
              <TextInput
                className="w-full border h-14 px-md rounded-xl bg-surface-container-lowest border-outline-variant font-body-md text-body-md text-on-surface"
                placeholder="johndoe"
                placeholderTextColor="#A0A7A5"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={onChangeUsername}
              />
            </View>

            <View className="gap-xs">
              <Text className="ml-1 font-label-md text-label-md text-on-surface-variant">
                Email
              </Text>
              <TextInput
                className="w-full border h-14 px-md rounded-xl bg-surface-container-lowest border-outline-variant font-body-md text-body-md text-on-surface"
                placeholder="name@example.com"
                placeholderTextColor="#A0A7A5"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={onChangeEmail}
              />
            </View>

            <View className="gap-xs">
              <Text className="ml-1 font-label-md text-label-md text-on-surface-variant">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full pr-12 border h-14 pl-md rounded-xl bg-surface-container-lowest border-outline-variant font-body-md text-body-md text-on-surface"
                  placeholder="••••••••"
                  placeholderTextColor="#A0A7A5"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
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

              <View className="w-full h-1 mt-1 overflow-hidden rounded-full bg-surface-container-high">
                <View
                  className={`h-full rounded-full ${meta.color}`}
                  style={{ width: `${strength}%` }}
                />
              </View>
              <Text
                className={`font-label-sm text-label-sm ml-1 mt-1 ${meta.textColor}`}
              >
                {meta.text}
              </Text>
            </View>

            {error ? (
              <Text className="font-body-sm text-body-sm text-error">
                {error}
              </Text>
            ) : null}

            <Pressable
              className="items-center justify-center w-full h-14 bg-primary rounded-2xl mt-sm active:opacity-90"
              onPress={onSubmit}
              disabled={submitting}
            >
              <Text className="text-black font-headline-sm text-headline-sm">
                {submitting ? "Creating account..." : "Sign Up"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-xl">
            <Text className="font-body-md text-body-md text-on-surface-variant">
              Already have an account?{" "}
              <Link href="./sign-in" asChild>
                <Text className="font-semibold text-primary">Sign In</Text>
              </Link>
            </Text>
          </View>
        </View>
      </DismissKeyboard>
    </SafeAreaView>
  );
}
