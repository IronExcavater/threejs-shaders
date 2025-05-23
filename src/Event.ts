export default class Event<T extends (...args: any[]) => void> {
    private listeners: Set<T> = new Set();

    subscribe(listener: T): void {
        this.listeners.add(listener);
    }

    unsubscribe(listener: T): void {
        this.listeners.delete(listener);
    }

    invoke(...args: Parameters<T>): void {
        for (const listener of this.listeners) {
            listener(...args);
        }
    }

    clear(): void {
        this.listeners.clear();
    }
}