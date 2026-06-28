import {View, Text, Pressable, Image, ScrollView} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Link} from "expo-router";
import {links} from "./links";
import React from "react";

export default function Landing() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center px-margin-mobile h-14 bg-background border-b border-outline-variant/20">
        <View className="flex-row items-center gap-3">
          <Image source={{uri: links.logo}} className="w-8 h-8 rounded-lg" />
          <Text className="font-display-lg-mobile text-primary tracking-tight text-lg">
            DoIt
          </Text>
        </View>
        <View className="ml-auto">
          <Link href="/sign-in" asChild>
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
              <View className="absolute bottom-4 right-4 bg-surface-container-low/90 p-3 rounded-2xl border border-outline-variant/20">
                <Text className="text-primary">✓</Text>
              </View>
            </View>

            <View className="mt-6 items-center gap-4">
              <Text className="font-display-lg-mobile text-display-lg-mobile text-on-background text-center leading-tight">
                Master your day, <Text className="text-primary">one task</Text>{" "}
                at a time.
              </Text>
              <Text className="font-body-lg text-body-lg text-on-surface-variant text-center max-w-md">
                The simple, beautiful way to organize your life and stay
                productive without the clutter.
              </Text>
            </View>
          </View>

          <View className="mt-10 gap-4">
            <Link href="/pages/sign-in" asChild>
              <Pressable className="w-full h-14 bg-primary rounded-2xl items-center justify-center flex-row gap-2 active:opacity-90">
                <Text className="font-headline-sm text-headline-sm text-black">
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
