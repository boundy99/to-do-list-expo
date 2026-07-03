import {View, Text, Pressable} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {router} from "expo-router";
import {useClerk} from "@clerk/expo";
import {AuthGuard} from "../../components/AuthGuard";

function TasksContent() {
  const {signOut} = useClerk();

  const onSignOut = async () => {
    await signOut();
    router.replace("../");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 px-margin-mobile">
        <View className="flex-row items-center justify-between border-b h-14 border-outline-variant/20">
          <Text className="font-headline-sm text-headline-sm text-on-surface">
            My Tasks
          </Text>
          <Pressable onPress={onSignOut} className="active:opacity-70">
            <Text className="font-label-md text-label-md text-error">
              Sign Out
            </Text>
          </Pressable>
        </View>

        <View className="items-center justify-center flex-1">
          <Text className="font-body-md text-body-md text-on-surface-variant">
            No tasks yet — add your first one!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function Tasks() {
  return (
    <AuthGuard requireAuth>
      <TasksContent />
    </AuthGuard>
  );
}
