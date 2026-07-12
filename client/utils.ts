export function getStrength(value: string) {
  let strength = 0;
  if (value.length > 0) strength += 20;
  if (value.length >= 8) strength += 20;
  if (/[A-Z]/.test(value)) strength += 20;
  if (/[0-9]/.test(value)) strength += 20;
  if (/[^A-Za-z0-9]/.test(value)) strength += 20;
  return strength;
}

export function getStrengthMeta(strength: number, length: number) {
  if (length === 0) {
    return {
      color: "bg-on-surface-variant/30",
      text: "Enter at least 8 characters",
      textColor: "text-on-surface-variant",
    };
  }
  if (strength <= 40) {
    return {
      color: "bg-error",
      text: length < 8 ? "Enter at least 8 characters" : "Weak password",
      textColor: "text-error",
    };
  }
  if (strength <= 80) {
    return {
      color: "bg-yellow-500",
      text: "Getting stronger...",
      textColor: "text-yellow-500",
    };
  }
  return {
    color: "bg-primary",
    text: "Great password!",
    textColor: "text-primary",
  };
}
