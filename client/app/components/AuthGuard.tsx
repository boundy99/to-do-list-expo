import {useAuth} from "@clerk/expo";
import {Redirect} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator} from "react-native";
import React from "react";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
};

export function AuthGuard({children, requireAuth = false}: AuthGuardProps) {
  const {isSignedIn, isLoaded} = useAuth({treatPendingAsSignedOut: false});

  if (!isLoaded) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-background">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isSignedIn && !requireAuth) {
    return <Redirect href="/pages/tasks" />;
  }

  if (!isSignedIn && requireAuth) {
    return <Redirect href="/pages/sign-in" />;
  }

  return <>{children}</>;
}
