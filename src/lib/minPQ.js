class MinHeap {
    constructor() {
        this.arr = [];
        this.size = 0;
    }
    /**
     * @abstract Maintains the min-heap property
     * @param i Index of the item to min-heapify at
     */
    minHeapify(i) {
        if (i >= this.size)
            return;
        const l = MinHeap.left(i);
        const r = MinHeap.right(i);
        let smallest = i;
        if (l < this.size && this.arr[l] < this.arr[smallest]) {
            smallest = l;
        }
        if (r < this.size && this.arr[r] < this.arr[smallest]) {
            smallest = r;
        }
        if (smallest !== i) {
            const temp = this.arr[smallest];
            this.arr[smallest] = this.arr[i];
            this.arr[i] = temp;
            this.minHeapify(smallest);
        }
    }
    /**
     * @abstract Rearranges array to maintain the min-heap property
     */
    buildMinHeap() {
        this.size = this.arr.length;
        for (let i = MinHeap.parent(this.arr.length - 1); i >= 0; i--) {
            this.minHeapify(i);
        }
    }
}
/**
 * @param i Index of target
 * @returns Index of the parent
 */
MinHeap.parent = (i) => {
    return Math.floor((i - 1) / 2);
};
/**
 * @param i Index of target
 * @returns Index of the left child
 */
MinHeap.left = (i) => {
    return i * 2 + 1;
};
/**
 * @param i Index of target
 * @returns Index of the right child
 */
MinHeap.right = (i) => {
    return (i + 1) * 2;
};
export default class MinPriorityQueue extends MinHeap {
    /**
     * @param setItemKey Function to change the key of any item in the queue
     * @param getItemKey Function to get the value of the key of any item in the queue
     */
    constructor(setItemKey, getItemKey) {
        super();
        this.setItemKey = setItemKey;
        this.getItemKey = getItemKey;
    }
    /**
     * @abstract Returns the item with minimum key and removes it
     * @returns Item with minimum key
     */
    extractMin() {
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
    decreaseKey(i, key) {
        if (key > this.getItemKey(this.arr[i])) {
            throw Error("New key is larger than current key");
        }
        this.setItemKey(this.arr[i], key);
        while (i > 0 && this.getItemKey(this.arr[MinHeap.parent(i)]) > this.getItemKey(this.arr[i])) {
            const temp = this.arr[i];
            this.arr[i] = this.arr[MinHeap.parent(i)];
            this.arr[MinHeap.parent(i)] = temp;
            i = MinHeap.parent(i);
        }
    }
    /**
     * @param item Item to insert into the min priority queue
     */
    insert(item) {
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
    buildPriorityQueueOnArray(arr) {
        this.arr = [...arr];
        this.buildMinHeap();
    }
    isEmpty() {
        return this.size === 0;
    }
}
