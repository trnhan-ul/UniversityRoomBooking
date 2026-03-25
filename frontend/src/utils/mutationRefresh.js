// Run one or multiple refresh functions in parallel after a successful mutation.
export const refreshMany = async (refreshFns) => {
  const tasks = Array.isArray(refreshFns) ? refreshFns : [refreshFns];
  const validTasks = tasks.filter((fn) => typeof fn === "function");

  await Promise.all(validTasks.map((fn) => fn()));
};

// Standard flow: execute mutate API call first, then refresh related data sources.
export const runMutationWithRefresh = async ({ mutate, refresh }) => {
  const result = await mutate();

  if (refresh) {
    await refreshMany(refresh);
  }

  return result;
};
