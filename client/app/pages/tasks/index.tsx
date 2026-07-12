import {View, Text, Pressable, ScrollView, Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useState, useEffect} from "react";
import {useUser, useAuth} from "@clerk/expo";
import {router} from "expo-router";
import {AuthGuard} from "../../components/auth-guard";
import {Navbar} from "../../components/navbar";
import {AddTaskModal} from "../../components/add-task";
import {EditTaskModal} from "../../components/edit-task";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as api from "../../services/api";

interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

function TasksContent() {
  const {user} = useUser();
  const {getToken, signOut} = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleTokenExpired = async () => {
    await signOut();
    router.replace("./sign-in");
  };

  const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong";

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const token = await getToken();
      if (!token) throw new Error("No token available");
      const data = await api.getTasks(token);
      setTasks(data);
    } catch (error) {
      if (error instanceof api.TokenExpiredError) {
        await handleTokenExpired();
        return;
      }
      console.error("Failed to fetch tasks:", error);
      setFetchError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token available");
      const updatedTask = await api.updateTask(taskId, token, {
        completed: !completed,
      });
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    } catch (error) {
      if (error instanceof api.TokenExpiredError) {
        await handleTokenExpired();
        return;
      }
      console.error("Failed to update task:", error);
      Alert.alert("Couldn't update task", errorMessage(error));
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token available");
      await api.deleteTask(taskId, token);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      if (error instanceof api.TokenExpiredError) {
        await handleTokenExpired();
        return;
      }
      Alert.alert("Couldn't delete task", errorMessage(error));
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const updateTask = async (title: string, description?: string) => {
    if (!editingTask) return;
    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) throw new Error("No token available");
      const updatedTask = await api.updateTask(editingTask.id, token, {
        title,
        description,
      });
      setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      setShowEditModal(false);
      setEditingTask(null);
    } catch (error) {
      if (error instanceof api.TokenExpiredError) {
        await handleTokenExpired();
        return;
      }
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const addTask = async (title: string, description?: string) => {
    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) throw new Error("No token available");
      const newTask = await api.createTask(
        user?.id as unknown as number,
        title,
        token,
        description,
      );
      setTasks([...tasks, newTask]);
    } catch (error) {
      if (error instanceof api.TokenExpiredError) {
        await handleTokenExpired();
        return;
      }
      console.error("Failed to add task:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleFABPress = () => {
    setShowAddModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b px-margin-mobile h-14 border-outline-variant/20">
        <Text className="font-headline-sm text-headline-sm text-on-surface">
          My Tasks
        </Text>
      </View>

      <View className="flex-row gap-sm px-margin-mobile py-lg">
        {(["all", "active", "completed"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setFilter(tab)}
            className={`px-lg py-sm rounded-full ${
              filter === tab ? "bg-primary" : "bg-surface-container-high"
            } active:opacity-70`}
          >
            <Text
              className={`font-label-md text-label-md capitalize ${
                filter === tab ? "text-black" : "text-on-surface"
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1 px-margin-mobile">
        {loading ? (
          <View className="items-center justify-center flex-1 py-xl">
            <Text className="text-on-surface-variant">Loading tasks...</Text>
          </View>
        ) : fetchError ? (
          <View className="items-center justify-center gap-lg py-xl">
            <MaterialIcons name="error-outline" size={32} color="#A0A7A5" />
            <Text className="font-body-md text-body-md text-on-surface-variant text-center">
              {fetchError}
            </Text>
            <Pressable
              onPress={fetchTasks}
              className="px-lg py-sm rounded-full bg-primary active:opacity-80"
            >
              <Text className="font-label-md text-label-md text-black">
                Try again
              </Text>
            </Pressable>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View className="items-center justify-center py-xl">
            <Text className="font-body-md text-body-md text-on-surface-variant">
              {filter === "all"
                ? "No tasks yet — add your first one!"
                : `No ${filter} tasks`}
            </Text>
          </View>
        ) : (
          <View className="gap-md pb-lg">
            {filteredTasks.map((task) => (
              <Pressable
                key={task.id}
                className="p-lg rounded-2xl bg-surface-container-high border border-outline-variant/20 gap-md active:opacity-70"
              >
                <View className="flex-row items-start gap-md">
                  <Pressable
                    onPress={() => toggleTask(task.id, task.completed)}
                    className="mt-xs"
                  >
                    {task.completed ? (
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color="#1A9B8E"
                      />
                    ) : (
                      <MaterialIcons
                        name="radio-button-unchecked"
                        size={24}
                        color="#A0A7A5"
                      />
                    )}
                  </Pressable>

                  <View className="flex-1 gap-xs">
                    <Text
                      className={`font-headline-sm text-headline-sm ${
                        task.completed
                          ? "line-through text-on-surface-variant"
                          : "text-on-surface"
                      }`}
                    >
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text className="font-body-sm text-body-sm text-on-surface-variant">
                        {task.description}
                      </Text>
                    )}
                  </View>

                  <View className="flex-row gap-xs">
                    <Pressable
                      onPress={() => openEditModal(task)}
                      className="active:opacity-70"
                    >
                      <MaterialIcons name="edit" size={24} color="#A0A7A5" />
                    </Pressable>
                    <Pressable
                      onPress={() => deleteTask(task.id)}
                      className="active:opacity-70"
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={24}
                        color="#A0A7A5"
                      />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={handleFABPress}
        className="absolute bottom-32 right-margin-mobile w-14 h-14 rounded-full bg-primary items-center justify-center active:opacity-80 shadow-lg"
      >
        <MaterialIcons name="add" size={28} color="#000" />
      </Pressable>

      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTask={addTask}
        submitting={submitting}
      />

      <EditTaskModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
        onUpdateTask={updateTask}
        initialTitle={editingTask?.title || ""}
        initialDescription={editingTask?.description || ""}
        submitting={submitting}
      />

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
