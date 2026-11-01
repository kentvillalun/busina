// Where to go after login. Only a path on this site: "//evil.com" or "/\evil.com" would send the commuter to another site.
const safeNext = (value) => {
  const ok = typeof value === "string" && value.length <= 200 && /^\/(?![/\\])[^\\\u0000-\u001f]*$/.test(value);
  return ok ? value : "/home";
};

export { safeNext };
