export function isUnauthorizedError(error: any): boolean {
  return error?.code === "auth/unauthorized" || error?.status === 401;
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: "default" | "destructive" }) => void) {
  if (toast) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Please sign in to continue.",
      variant: "destructive",
    });
  }
}
