// The one rule for who may act as an operator: login and every later request both use it, so they cannot drift apart.
const canOperate = (user) => Boolean(user && user.role === "OPERATOR" && user.active && user.passwordHash);

export { canOperate };
