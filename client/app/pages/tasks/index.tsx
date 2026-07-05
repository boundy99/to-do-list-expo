import {View, Text} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {AuthGuard} from "../../components/auth-guard";
import {Navbar} from "../../components/navbar";

function TasksContent() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between border-b px-margin-mobile h-14 border-outline-variant/20">
          <Text className="font-headline-sm text-headline-sm text-on-surface">
            My Tasks
          </Text>
        </View>

        <View className="items-center justify-center flex-1 px-margin-mobile">
          <Text className="font-body-md text-body-md text-on-surface-variant">
            No tasks yet — add your first one!
          </Text>
        </View>
      </View>

      <Navbar />
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
