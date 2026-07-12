import { View, Text, TextInput, Pressable, Modal } from "react-native";
import { useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { DismissKeyboard } from "./dismiss-keyboard";

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (title: string, description?: string) => Promise<void>;
  submitting?: boolean;
}

export function AddTaskModal({
  visible,
  onClose,
  onAddTask,
  submitting = false,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleAddTask = async () => {
    if (!title.trim()) {
      setError("Task name is required");
      return;
    }

    try {
      setError("");
      await onAddTask(title, description || undefined);
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <DismissKeyboard>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="w-11/12 bg-surface-container-high rounded-3xl p-lg gap-lg">
            <View className="flex-row items-center justify-between">
              <Text className="font-headline-sm text-headline-sm text-on-surface">
                Add Task
              </Text>
              <Pressable onPress={onClose} className="active:opacity-70">
                <MaterialIcons name="close" size={24} color="#A0A7A5" />
              </Pressable>
            </View>

            <View className="gap-sm">
              <Text className="font-label-md text-label-md text-on-surface-variant uppercase">
                Task Name
              </Text>
              <TextInput
                className="w-full border px-md py-lg bg-surface-container-lowest border-outline-variant rounded-xl font-body-md text-body-md text-on-surface"
                placeholder="Enter task name"
                placeholderTextColor="#A0A7A5"
                value={title}
                onChangeText={setTitle}
                editable={!submitting}
              />
            </View>

            <View className="gap-sm">
              <Text className="font-label-md text-label-md text-on-surface-variant uppercase">
                Description
              </Text>
              <TextInput
                className="w-full border px-md py-lg bg-surface-container-lowest border-outline-variant rounded-xl font-body-md text-body-md text-on-surface min-h-24"
                placeholder="Add task description (optional)"
                placeholderTextColor="#A0A7A5"
                value={description}
                onChangeText={setDescription}
                multiline
                editable={!submitting}
              />
            </View>

            {error ? (
              <Text className="font-body-sm text-body-sm text-error">
                {error}
              </Text>
            ) : null}

            <View className="flex-row gap-md">
              <Pressable
                onPress={onClose}
                disabled={submitting}
                className="flex-1 items-center justify-center h-14 bg-surface-container-high border border-outline-variant rounded-full active:opacity-70"
              >
                <Text className="font-label-md text-label-md text-on-surface">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleAddTask}
                disabled={submitting}
                className="flex-1 items-center justify-center h-14 bg-primary rounded-full active:opacity-80"
              >
                <Text className="font-label-md text-label-md text-black">
                  {submitting ? "Adding..." : "Add Task"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </DismissKeyboard>
    </Modal>
  );
}
