const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_LOCAL_URL;

export async function getTasks(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/tasks?userId=${userId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function createTask(
  userId: number,
  title: string,
  description?: string,
) {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      title,
      description,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function updateTask(
  id: number,
  updates: Partial<{title: string; description: string; completed: boolean}>,
) {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteTask(id: number) {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}
