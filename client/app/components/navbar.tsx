import {View, Text, Pressable} from "react-native";
import {usePathname} from "expo-router";
import {router} from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export function Navbar() {
  const pathname = usePathname();

  const isTasksActive = pathname?.includes("tasks");
  const isProfileActive = pathname?.includes("profile");

  return (
    <View className="flex-row items-center justify-around border-t border-outline-variant/20 bg-background px-margin-mobile py-md gap-md">
      <Pressable
        onPress={() => router.push("/pages/tasks")}
        className={`flex-1 items-center justify-center gap-xs rounded-full py-md ${isTasksActive ? "bg-primary" : ""} active:opacity-70`}
      >
        <MaterialIcons
          name={isTasksActive ? "check-circle" : "radio-button-unchecked"}
          size={24}
          color={isTasksActive ? "#000" : "#A0A7A5"}
        />
        <Text className={`font-label-sm text-label-sm ${isTasksActive ? "text-black" : "text-on-surface-variant"}`}>
          Tasks
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/pages/profile")}
        className={`flex-1 items-center justify-center gap-xs rounded-full py-md ${isProfileActive ? "bg-primary" : ""} active:opacity-70`}
      >
        <MaterialIcons
          name="person"
          size={24}
          color={isProfileActive ? "#000" : "#A0A7A5"}
        />
        <Text className={`font-label-sm text-label-sm ${isProfileActive ? "text-black" : "text-on-surface-variant"}`}>
          Profile
        </Text>
      </Pressable>
    </View>
  );
}
