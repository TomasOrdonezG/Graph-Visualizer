class MinHeap<Item> {
    public arr: Item[] = [];
    protected size: number = 0;
    protected getItemKey: (item: Item) => number;

    /**
     * @param getItemKey Function to get the value of the key of any item in the queue
     */
    constructor(getItemKey: (item: Item) => number) {
        this.getItemKey = getItemKey;
    }

    protected static parent = (i: number): number => Math.floor((i - 1) / 2);
    protected static left = (i: number): number => i * 2 + 1;
    protected static right = (i: number): number => (i + 1) * 2;

    /**
     * @abstract Maintains the min-heap property
     * @param i Index of the item to min-heapify at
     */
    protected minHeapify(i: number): void {
        if (i >= this.size) return;
        const l = MinHeap.left(i);
        const r = MinHeap.right(i);

        let smallest: number = i;
        if (l < this.size && this.getItemKey(this.arr[l]) < this.getItemKey(this.arr[smallest])) {
            smallest = l;
        }
        if (r < this.size && this.getItemKey(this.arr[r]) < this.getItemKey(this.arr[smallest])) {
            smallest = r;
        }

        if (smallest !== i) {
            const temp: Item = this.arr[smallest];
            this.arr[smallest] = this.arr[i];
            this.arr[i] = temp;
            this.minHeapify(smallest);
        }
    }

    /**
     * @abstract Rearranges array to maintain the min-heap property
     */
    protected buildMinHeap(): void {
        this.size = this.arr.length;
        for (let i = MinHeap.parent(this.arr.length - 1); i >= 0; i--) {
            this.minHeapify(i);
        }
    }
}

export class MinPriorityQueue<Item> extends MinHeap<Item> {
    private setItemKey: (item: Item, key: number) => void;

    /**
     * @param setItemKey Function to change the key of any item in the queue
     * @param getItemKey Function to get the value of the key of any item in the queue
     */
    constructor(setItemKey: (item: Item, key: number) => void, getItemKey: (item: Item) => number) {
        super(getItemKey);
        this.setItemKey = setItemKey;
    }

    /**
     * @abstract Returns the item with minimum key and removes it
     * @returns Item with minimum key
     */
    public extractMin(): Item {
        if (this.size < 1) {
            throw Error("Heap underflow");
        }

        const head = this.arr[0];
        this.arr[0] = this.arr[this.size - 1];
        this.size--;
        this.minHeapify(0);
        return head;
    }

    /**
     * @param i Index of target item
     * @param key New key value for the item, must be smaller than previous key value
     */
    public decreaseKey(i: number, key: number): void {
        if (key > this.getItemKey(this.arr[i])) {
            throw Error("New key is larger than current key");
        }

        this.setItemKey(this.arr[i], key);
        while (i > 0 && this.getItemKey(this.arr[MinHeap.parent(i)]) > this.getItemKey(this.arr[i])) {
            const temp: Item = this.arr[i];
            this.arr[i] = this.arr[MinHeap.parent(i)];
            this.arr[MinHeap.parent(i)] = temp;
            i = MinHeap.parent(i);
        }
    }

    /**
     * @param item Item to insert into the min priority queue
     */
    public insert(item: Item): void {
        this.size++;
        this.arr.push(item);
        const key = this.getItemKey(item);
        this.setItemKey(item, Infinity);
        this.decreaseKey(this.size - 1, key);
    }

    /**
     * @abstract Builds a min priority queue off of an array. The original array remains unchanged.
     * @param arr Array to build min priority queue off of
     */
    public buildPriorityQueueOnArray(arr: Item[]): void {
        this.arr = [...arr];
        this.buildMinHeap();
    }

    public isEmpty(): boolean {
        return this.size === 0;
    }
}
