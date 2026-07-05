import {View, Text, Pressable, ScrollView} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useUser, useClerk} from "@clerk/expo";
import {router} from "expo-router";

export default function Profile() {
  const {user} = useUser();
  const {signOut} = useClerk();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/pages/landing");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="flex-row items-center justify-between border-b px-margin-mobile h-14 border-outline-variant/20">
          <Pressable
            onPress={() => router.back()}
            className="active:opacity-70"
          >
            <Text className="text-primary font-label-md">← Back</Text>
          </Pressable>
          <Text className="font-headline-sm text-headline-sm text-on-surface">
            Account
          </Text>
          <View className="w-6" />
        </View>

        <View className="items-center py-12 gap-md">
          <View className="w-32 h-32 rounded-full bg-primary items-center justify-center relative">
            <Text className="text-4xl font-bold text-black">{initials}</Text>
          </View>

          <View className="items-center gap-xs">
            <Text className="font-headline-sm text-headline-sm text-on-surface">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant">
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View>

        <View className="px-margin-mobile gap-md">
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center gap-md p-lg rounded-2xl bg-surface-container-high border border-outline-variant/20 active:opacity-80"
          >
            <Text className="m-auto font-headline-sm text-headline-sm text-error">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
