import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Link, Redirect} from "expo-router";
import {useAuth} from "@clerk/expo";
import {links} from "../links";

export default function Landing() {
  const {isSignedIn, isLoaded} = useAuth({treatPendingAsSignedOut: false});

  if (!isLoaded) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-background">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return <Redirect href="./pages/tasks" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center border-b px-margin-mobile h-14 bg-background border-outline-variant/20">
        <View className="flex-row items-center gap-3">
          <Image source={{uri: links.logo}} className="w-8 h-8 rounded-lg" />
          <Text className="text-lg tracking-tight font-display-lg-mobile text-primary">
            DoIt
          </Text>
        </View>
        <View className="ml-auto">
          <Link href="./pages/sign-in" asChild>
            <Pressable>
              <Text className="font-label-md text-label-md text-primary">
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{paddingTop: 24, paddingBottom: 80}}
      >
        <View className="px-margin-mobile">
          <View className="items-center">
            <View className="relative w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden border border-outline-variant/20">
              <Image
                source={{uri: links.hero}}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute p-3 border bottom-4 right-4 bg-surface-container-low/90 rounded-2xl border-outline-variant/20">
                <Text className="text-primary">✓</Text>
              </View>
            </View>

            <View className="items-center gap-4 mt-6">
              <Text className="leading-tight text-center font-display-lg-mobile text-display-lg-mobile text-on-background">
                Master your day, <Text className="text-primary">one task</Text>{" "}
                at a time.
              </Text>
              <Text className="max-w-md text-center font-body-lg text-body-lg text-on-surface-variant">
                The simple, beautiful way to organize your life and stay
                productive without the clutter.
              </Text>
            </View>
          </View>

          <View className="gap-4 mt-10">
            <Link href="./pages/sign-up" asChild>
              <Pressable className="flex-row items-center justify-center w-full gap-2 h-14 bg-primary rounded-2xl active:opacity-90">
                <Text className="text-black font-headline-sm text-headline-sm">
                  Get Started
                </Text>
                <Text className="text-black">→</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
