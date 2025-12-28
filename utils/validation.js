export function isValidEmail(email) {
  return typeof email === "string"
    && /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

export function isValidUsername(username) {
  if (!username || typeof username !== "string") return false;
  // Username: 3-30 characters, alphanumeric, underscore, hyphen
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username.trim());
}

export function isValidPassword(password) {
  if (!password || typeof password !== "string") return false;
  // Password: at least 8 characters, at least one letter and one number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== "string") return false;
  // Basic phone validation: digits, spaces, dashes, parentheses, plus sign
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return /^\d{10,15}$/.test(cleaned);
}