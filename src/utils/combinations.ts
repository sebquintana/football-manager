export function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const backtrack = (start: number, path: T[]) => {
    if (path.length === k) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  };
  backtrack(0, []);
  return result;
}
