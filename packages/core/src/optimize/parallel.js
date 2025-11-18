export function parallel(tasks) {
    return tasks.map(task => task());
}
