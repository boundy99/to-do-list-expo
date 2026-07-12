const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_LOCAL_URL;

export class TokenExpiredError extends Error {
  constructor() {
    super("Token expired");
    this.name = "TokenExpiredError";
  }
}

export class NetworkError extends Error {
  constructor() {
    super("Can't reach the server. Check your internet connection.");
    this.name = "NetworkError";
  }
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path: string, options: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new NetworkError();
  }

  if (response.status === 401) {
    throw new TokenExpiredError();
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // response body wasn't JSON; keep the default message
    }
    throw new ApiError(response.status, message);
  }

  return response.json();
}

export function getTasks(token: string) {
  return request("/api/tasks", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
}

export function createTask(
  userId: number,
  title: string,
  token: string,
  description?: string,
) {
  return request("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: token,
      userId,
      title,
      description,
    }),
  });
}

export function updateTask(
  id: number,
  token: string,
  updates: Partial<{title: string; description: string; completed: boolean}>,
) {
  return request(`/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({user: token, ...updates}),
  });
}

export function deleteTask(id: number, token: string) {
  return request(`/api/tasks/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({user: token}),
  });
}
