import json
import os

# Comprehensive detailed milestone trees for ALL key role and tech roadmaps

dsa_steps = [
    {
        "stepNumber": 1,
        "title": "Language Syntax & Array / String Fundamentals",
        "subtitle": "C++, Java, or Python Core Data Structures",
        "description": "Master array and string manipulation fundamentals: In-place reversal, two-pointer traversals, sliding window technique, and frequency hash maps.",
        "guide": """### 💡 Array Mechanics & Memory
Arrays store contiguous memory elements. O(1) random access lookup by index, O(N) insertion/deletion.

### 🔑 Common Patterns
- Two Pointers (Left / Right pointers moving towards center).
- Sliding Window (Fixed size or dynamic expanding/contracting window).""",
        "codeSnippet": "# Sliding Window Maximum Sum of Subarray of size K\ndef max_sub_array_of_size_k(k, arr):\n    max_sum, window_sum = 0, 0\n    window_start = 0\n    for window_end in range(len(arr)):\n        window_sum += arr[window_end]\n        if window_end >= k - 1:\n            max_sum = max(max_sum, window_sum)\n            window_sum -= arr[window_start]\n            window_start += 1\n    return max_sum",
        "submodules": [
            {"name": "Array Contiguous Memory & Bounds", "status": "pending"},
            {"name": "String Immutability & Manipulation", "status": "pending"},
            {"name": "Two-Pointer Strategy", "status": "pending"},
            {"name": "Sliding Window Pattern (Fixed & Dynamic)", "status": "pending"}
        ],
        "interviewFaqs": ["What is the difference between string immutability in Java vs C++?", "How does sliding window reduce time complexity from O(N^2) to O(N)?"],
        "topics": ["Array", "String", "Two Pointers", "Sliding Window"],
        "problems": ["two-sum", "best-time-to-buy-and-sell-stock", "longest-substring-without-repeating-characters"],
        "icon": "code", "color": "yellow", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 2,
        "title": "Asymptotic Analysis (Big-O, Big-Omega, Big-Theta)",
        "subtitle": "Time & Space Complexity Metrics",
        "description": "Calculate time and space complexity for recursive and iterative algorithms: Big-O upper bound, Big-Omega lower bound, Master Theorem, and auxiliary space.",
        "guide": """### ⏱️ Time Complexity Hierarchy
`O(1) < O(log N) < O(N) < O(N log N) < O(N^2) < O(2^N) < O(N!)`

### 🧠 Master Theorem for Divide & Conquer
For recurrence relation `T(n) = aT(n/b) + f(n)`.""",
        "codeSnippet": "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1",
        "submodules": [
            {"name": "Big-O Notation Upper Bound", "status": "pending"},
            {"name": "Space Complexity & Auxiliary Memory", "status": "pending"},
            {"name": "Recursion Call Stack Memory Usage", "status": "pending"},
            {"name": "Master Theorem Analysis", "status": "pending"}
        ],
        "interviewFaqs": ["Explain amortized time complexity of dynamic array resizing."],
        "topics": ["Big-O", "Time Complexity", "Space Complexity", "Binary Search"],
        "problems": ["binary-search", "search-a-2d-matrix"],
        "icon": "zap", "color": "yellow", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 3,
        "title": "Matrix & Multi-Dimensional Array Patterns",
        "subtitle": "2D Grid Traversal, In-place Rotations & Spiral Order",
        "description": "Master 2D array matrix algorithms: Row-major vs Column-major memory layout, matrix rotation by 90 degrees, spiral traversal, and matrix search.",
        "guide": """### 🧩 Matrix Rotation 90 Degrees Clockwise
1. Transpose matrix (`matrix[i][j] = matrix[j][i]`).
2. Reverse each row.""",
        "codeSnippet": "# Matrix Transpose & In-place Reverse\ndef rotate(matrix):\n    n = len(matrix)\n    for i in range(n):\n        for j in range(i, n):\n            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n    for i in range(n):\n        matrix[i].reverse()",
        "submodules": [
            {"name": "2D Array Memory Layout", "status": "pending"},
            {"name": "Matrix Transpose & Rotation", "status": "pending"},
            {"name": "Spiral Matrix Traversal", "status": "pending"},
            {"name": "Submatrix Sum Queries", "status": "pending"}
        ],
        "interviewFaqs": ["How do you rotate an N x N matrix in O(1) extra space?"],
        "topics": ["Matrix", "2D Array", "Rotation", "Spiral"],
        "problems": ["rotate-image", "spiral-matrix", "set-matrix-zeroes"],
        "icon": "grid", "color": "yellow", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 4,
        "title": "Linked Lists (Singly & Doubly)",
        "subtitle": "Pointers, Reversal, Fast & Slow Pointers (Floyd's Cycle Detection)",
        "description": "Master linked list data structures: Singly and Doubly linked list node pointers, iterative and recursive reversal, finding middle node, detecting cycles using Floyd's Tortoise and Hare algorithm.",
        "guide": """### 🐢 Fast & Slow Pointers (Floyd's Cycle Detection)
Slow pointer moves 1 step, Fast pointer moves 2 steps. If a cycle exists, Fast will eventually meet Slow inside the loop.""",
        "codeSnippet": "def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False",
        "submodules": [
            {"name": "Singly Linked List Operations", "status": "pending"},
            {"name": "Doubly Linked List & Sentinel Nodes", "status": "pending"},
            {"name": "Reverse Linked List (Iterative & Recursive)", "status": "pending"},
            {"name": "Floyd's Cycle Detection Algorithm", "status": "pending"}
        ],
        "interviewFaqs": ["Why does Floyd's Tortoise and Hare algorithm guarantee cycle detection in O(N) time and O(1) space?"],
        "topics": ["Linked List", "Fast & Slow Pointers", "Floyd's Cycle"],
        "problems": ["reverse-linked-list", "linked-list-cycle", "merge-two-sorted-lists"],
        "icon": "code", "color": "blue", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 5,
        "title": "Stacks, Queues & Monotonic Stack Patterns",
        "subtitle": "LIFO, FIFO, Monotonic Stack & Sliding Window Maximum",
        "description": "Master Stack and Queue data structures: Expression evaluation (Infix to Postfix), Monotonic Increasing/Decreasing Stacks for Next Greater Element problems, and Deque for Sliding Window Maximum.",
        "guide": """### 🥞 Monotonic Stack Pattern
A stack whose elements are kept in strictly increasing or decreasing order. Ideal for 'Next Greater Element' or 'Daily Temperatures' in O(N) time.""",
        "codeSnippet": "def dailyTemperatures(temperatures):\n    res = [0] * len(temperatures)\n    stack = [] # stores indices\n    for i, t in enumerate(temperatures):\n        while stack and temperatures[stack[-1]] < t:\n            prev_i = stack.pop()\n            res[prev_i] = i - prev_i\n        stack.append(i)\n    return res",
        "submodules": [
            {"name": "Stack LIFO Operations & Memory", "status": "pending"},
            {"name": "Queue FIFO & Deque Operations", "status": "pending"},
            {"name": "Monotonic Stack Pattern", "status": "pending"},
            {"name": "Sliding Window Maximum with Deque", "status": "pending"}
        ],
        "interviewFaqs": ["What is a Monotonic Stack and when should you use it over brute-force double loops?"],
        "topics": ["Stack", "Queue", "Monotonic Stack", "Deque"],
        "problems": ["valid-parentheses", "daily-temperatures", "sliding-window-maximum"],
        "icon": "layers", "color": "purple", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 6,
        "title": "Binary Trees & Traversal Algorithms",
        "subtitle": "In-order, Pre-order, Post-order, BFS Level-Order & Diameter",
        "description": "Master Binary Tree data structures: Recursive and iterative traversals (In-order, Pre-order, Post-order), Breadth-First Search (BFS level order traversal with Queue), tree height, and Lowest Common Ancestor (LCA).",
        "guide": """### 🌳 Tree Traversals
- **Pre-order**: Node -> Left -> Right
- **In-order**: Left -> Node -> Right (Yields sorted order in Binary Search Trees)
- **Post-order**: Left -> Right -> Node (Ideal for deleting nodes or computing subtree properties)
- **Level-order (BFS)**: Breadth-first level by level using Queue.""",
        "codeSnippet": "def levelOrder(root):\n    if not root: return []\n    res, queue = [], [root]\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.pop(0)\n            level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        res.append(level)\n    return res",
        "submodules": [
            {"name": "Binary Tree Node Properties", "status": "pending"},
            {"name": "Depth-First Search (DFS) Pre/In/Post Order", "status": "pending"},
            {"name": "Breadth-First Search (BFS) Level-Order", "status": "pending"},
            {"name": "Lowest Common Ancestor (LCA)", "status": "pending"}
        ],
        "interviewFaqs": ["What is the difference between BFS and DFS tree traversal?", "How do you find the Lowest Common Ancestor (LCA) in a Binary Tree?"],
        "topics": ["Binary Tree", "DFS", "BFS", "Level Order", "LCA"],
        "problems": ["maximum-depth-of-binary-tree", "binary-tree-level-order-traversal", "lowest-common-ancestor-of-a-binary-tree"],
        "icon": "git-branch", "color": "green", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 7,
        "title": "Binary Search Trees (BST) & Balanced Trees",
        "subtitle": "BST Property, Insertion, Deletion, Searching & AVL Trees",
        "description": "Master Binary Search Tree properties: Left child < Node < Right child, O(log N) average search/insert/delete, BST validation, and balanced AVL / Red-Black self-balancing trees.",
        "guide": """### 🌲 BST Property
For every node, all nodes in left subtree are strictly smaller, and all nodes in right subtree are strictly greater.""",
        "codeSnippet": "def isValidBST(root, low=float('-inf'), high=float('inf')):\n    if not root: return True\n    if not (low < root.val < high): return False\n    return isValidBST(root.left, low, root.val) and isValidBST(root.right, root.val, high)",
        "submodules": [
            {"name": "BST Searching & Insertion", "status": "pending"},
            {"name": "BST Node Deletion Algorithm", "status": "pending"},
            {"name": "Validating BST Properties", "status": "pending"},
            {"name": "AVL & Red-Black Tree Balancing", "status": "pending"}
        ],
        "interviewFaqs": ["What happens to search time complexity when a BST degenerates into a linear linked list?"],
        "topics": ["BST", "Binary Search Tree", "AVL Tree", "Red-Black Tree"],
        "problems": ["validate-binary-search-tree", "kth-smallest-element-in-a-bst"],
        "icon": "git-branch", "color": "green", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 8,
        "title": "Heaps & Priority Queues",
        "subtitle": "Min-Heap, Max-Heap, Heapify Algorithm & Top-K Elements",
        "description": "Master Binary Heaps: Min-Heap and Max-Heap array representations, O(log N) push/pop, O(N) Heapify algorithm, finding Kth largest/smallest element, and Top-K Frequent patterns.",
        "guide": """### ⛰️ Heap Memory Representation
Binary Heap represented as array:
- Parent of `i`: `(i - 1) // 2`
- Left child: `2i + 1`
- Right child: `2i + 2`""",
        "codeSnippet": "import heapq\n\ndef findKthLargest(nums, k):\n    heap = nums[:k]\n    heapq.heapify(heap)\n    for num in nums[k:]:\n        if num > heap[0]:\n            heapq.heapreplace(heap, num)\n    return heap[0]",
        "submodules": [
            {"name": "Min-Heap & Max-Heap Array Layout", "status": "pending"},
            {"name": "Heapify Algorithm O(N)", "status": "pending"},
            {"name": "Top-K Elements Pattern", "status": "pending"},
            {"name": "Merge K Sorted Lists Pattern", "status": "pending"}
        ],
        "interviewFaqs": ["Why is `heapify` O(N) time complexity instead of O(N log N)?"],
        "topics": ["Heap", "Priority Queue", "Min-Heap", "Top-K"],
        "problems": ["kth-largest-element-in-an-array", "top-k-frequent-elements", "merge-k-sorted-lists"],
        "icon": "zap", "color": "yellow", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 9,
        "title": "Hashing & Hash Tables",
        "subtitle": "Hash Functions, Collision Resolution, Sets & Maps",
        "description": "Master Hash Tables: Hash functions, collision resolution techniques (Chaining vs Open Addressing / Linear Probing), HashSet, HashMap, and 2-Sum lookup optimizations.",
        "guide": """### 🔑 Collision Resolution
- **Separate Chaining**: Bucket stores linked list of collided key-value pairs.
- **Open Addressing (Linear/Quadratic Probing)**: Probes next sequential available slot in array.""",
        "codeSnippet": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
        "submodules": [
            {"name": "Hash Function Design & Uniformity", "status": "pending"},
            {"name": "Collision Resolution (Chaining vs Probing)", "status": "pending"},
            {"name": "HashSet & HashMap Mechanics", "status": "pending"},
            {"name": "Subarray Sum Equals K Pattern", "status": "pending"}
        ],
        "interviewFaqs": ["What is Hash Collision and how does HashMap handle collisions in Java 8+ (Treeifying buckets)?"],
        "topics": ["Hash Table", "HashSet", "HashMap", "Collisions"],
        "problems": ["two-sum", "group-anagrams", "subarray-sum-equals-k"],
        "icon": "database", "color": "red", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 10,
        "title": "Recursion & Backtracking",
        "subtitle": "State Space Trees, Subsets, Permutations & N-Queens",
        "description": "Master recursive search algorithms and Backtracking: Decision state trees, pruning invalid branches, Subsets, Combinations, Permutations, Sudoku Solver, and N-Queens.",
        "guide": """### 🔄 Backtracking Template
1. Choose option
2. Explore recursively (`backtrack(next_state)`)
3. Unchoose option (Backtrack state)""",
        "codeSnippet": "def subsets(nums):\n    res = []\n    def backtrack(start, path):\n        res.append(path[:])\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    return res",
        "submodules": [
            {"name": "Recursion Base Case & Stack Bounds", "status": "pending"},
            {"name": "Decision State Space Tree", "status": "pending"},
            {"name": "Subsets & Combinations Pattern", "status": "pending"},
            {"name": "N-Queens & Board Backtracking", "status": "pending"}
        ],
        "interviewFaqs": ["What is the difference between pure Recursion and Backtracking?"],
        "topics": ["Recursion", "Backtracking", "Subsets", "Permutations"],
        "problems": ["subsets", "permutations", "n-queens"],
        "icon": "zap", "color": "purple", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 11,
        "title": "Dynamic Programming (1D DP)",
        "subtitle": "Memoization (Top-Down) vs Tabulation (Bottom-Up)",
        "description": "Master Dynamic Programming fundamentals: Identifying overlapping subproblems and optimal substructure, Top-Down DP with Memoization, Bottom-Up DP with Tabulation, and space optimization.",
        "guide": """### 💡 DP Identification
- Is the problem asking for optimal choice (max/min), total ways, or feasibility?
- Can state be expressed recursively with repeating identical subproblems?""",
        "codeSnippet": "# Coin Change 1D DP Tabulation\ndef coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for i in range(1, amount + 1):\n        for coin in coins:\n            if i - coin >= 0:\n                dp[i] = min(dp[i], dp[i - coin] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
        "submodules": [
            {"name": "Overlapping Subproblems & Optimal Substructure", "status": "pending"},
            {"name": "Top-Down Memoization Recursion", "status": "pending"},
            {"name": "Bottom-Up Tabulation Iteration", "status": "pending"},
            {"name": "Space Optimization Techniques", "status": "pending"}
        ],
        "interviewFaqs": ["What is the difference between Memoization (Top-Down) and Tabulation (Bottom-Up)?"],
        "topics": ["Dynamic Programming", "DP", "Memoization", "Tabulation"],
        "problems": ["climbing-stairs", "coin-change", "house-robber"],
        "icon": "zap", "color": "purple", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 12,
        "title": "Advanced Dynamic Programming (2D/3D DP & Bitmask)",
        "subtitle": "0/1 Knapsack, Longest Common Subsequence & Edit Distance",
        "description": "Solve hard 2D Dynamic Programming patterns: 0/1 Knapsack, Unbounded Knapsack, Longest Common Subsequence (LCS), Edit Distance, Matrix Chain Multiplication, and Bitmask DP.",
        "guide": """### 🎒 0/1 Knapsack State Equation
`dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]])`""",
        "codeSnippet": "# Longest Common Subsequence (LCS)\ndef longestCommonSubsequence(text1, text2):\n    m, n = len(text1), len(text2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if text1[i-1] == text2[j-1]:\n                dp[i][j] = 1 + dp[i-1][j-1]\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    return dp[m][n]",
        "submodules": [
            {"name": "0/1 Knapsack Pattern", "status": "pending"},
            {"name": "Longest Common Subsequence (LCS)", "status": "pending"},
            {"name": "Edit Distance (Levenshtein)", "status": "pending"},
            {"name": "Bitmask Dynamic Programming", "status": "pending"}
        ],
        "interviewFaqs": ["How do you optimize 2D DP space from O(M*N) to O(N)?"],
        "topics": ["Hard DP", "Knapsack", "LCS", "Edit Distance"],
        "problems": ["longest-common-subsequence", "edit-distance", "target-sum"],
        "icon": "zap", "color": "purple", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 13,
        "title": "Graph Algorithms: Fundamentals & Traversals",
        "subtitle": "Adjacency List/Matrix, Graph BFS & DFS, Connected Components",
        "description": "Master Graph data structure representations (Adjacency List vs Matrix), Graph Breadth-First Search (BFS), Depth-First Search (DFS), Cycle Detection in Directed/Undirected Graphs, and Connected Components.",
        "guide": """### 🕸️ Graph Representations
- **Adjacency List**: `map<int, vector<int>> adj` -> Memory O(V + E).
- **Adjacency Matrix**: `vector<vector<int>> matrix` -> Memory O(V^2).""",
        "codeSnippet": "# Number of Islands (2D Grid Graph DFS)\ndef numIslands(grid):\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == '0': return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count",
        "submodules": [
            {"name": "Graph Adjacency List & Matrix", "status": "pending"},
            {"name": "Graph BFS Traversal (Shortest Unweighted Path)", "status": "pending"},
            {"name": "Graph DFS Traversal & Cycle Detection", "status": "pending"},
            {"name": "Connected Components & Island Problems", "status": "pending"}
        ],
        "interviewFaqs": ["How do you detect cycles in a directed graph using DFS coloring (White, Gray, Black)?"],
        "topics": ["Graph", "BFS", "DFS", "Adjacency List", "Connected Components"],
        "problems": ["number-of-islands", "clone-graph", "course-schedule"],
        "icon": "git-branch", "color": "green", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 14,
        "title": "Shortest Path & Topological Sort Algorithms",
        "subtitle": "Dijkstra, Bellman-Ford, Kahn's Algorithm (Topological Sort)",
        "description": "Master shortest path and dependency graph algorithms: Dijkstra's algorithm for non-negative weighted graphs (using Priority Queue), Bellman-Ford for negative weights, and Kahn's BFS Topological Sort.",
        "guide": """### 🧭 Dijkstra's Shortest Path Algorithm
Finds shortest path from source vertex to all other vertices in non-negative weighted graph in `O((V + E) log V)` using Min-Heap.""",
        "codeSnippet": "import heapq\n\ndef dijkstra(graph, start):\n    distances = {node: float('inf') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    while pq:\n        curr_dist, u = heapq.heappop(pq)\n        if curr_dist > distances[u]: continue\n        for v, weight in graph[u]:\n            if distances[u] + weight < distances[v]:\n                distances[v] = distances[u] + weight\n                heapq.heappush(pq, (distances[v], v))\n    return distances",
        "submodules": [
            {"name": "Kahn's Algorithm (BFS Topological Sort)", "status": "pending"},
            {"name": "Dijkstra Shortest Path with Min-Heap", "status": "pending"},
            {"name": "Bellman-Ford Algorithm (Negative Edges)", "status": "pending"},
            {"name": "Floyd-Warshall All-Pairs Shortest Path", "status": "pending"}
        ],
        "interviewFaqs": ["Why does Dijkstra's algorithm fail on graphs with negative edge weights?"],
        "topics": ["Dijkstra", "Topological Sort", "Shortest Path", "Graph"],
        "problems": ["network-delay-time", "course-schedule-ii", "cheapest-flights-within-k-stops"],
        "icon": "navigation", "color": "teal", "sourceUrl": "https://leetcode.com"
    },
    {
        "stepNumber": 15,
        "title": "Disjoint Set Union (DSU) & Minimum Spanning Trees",
        "subtitle": "Union-Find with Path Compression & Kruskal's / Prim's MST",
        "description": "Master Disjoint Set Union (DSU) data structures: Find with Path Compression, Union by Rank/Size, Kruskal's Minimum Spanning Tree algorithm, and Prim's algorithm.",
        "guide": """### 🔗 DSU Near-Constant Operations
With Path Compression and Union by Rank, DSU operations run in amortized `O(α(N))` time (inverse Ackermann function, near O(1)).""",
        "codeSnippet": "class DSU:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n    def find(self, i):\n        if self.parent[i] == i: return i\n        self.parent[i] = self.find(self.parent[i])\n        return self.parent[i]\n    def union(self, i, j):\n        root_i, root_j = self.find(i), self.find(j)\n        if root_i != root_j:\n            if self.rank[root_i] < self.rank[root_j]: root_i, root_j = root_j, root_i\n            self.parent[root_j] = root_i\n            if self.rank[root_i] == self.rank[root_j]: self.rank[root_i] += 1\n            return True\n        return False",
        "submodules": [
            {"name": "Union-Find Data Structure", "status": "pending"},
            {"name": "Path Compression & Union by Rank", "status": "pending"},
            {"name": "Kruskal's MST Algorithm", "status": "pending"},
            {"name": "Prim's MST Algorithm", "status": "pending"}
        ],
        "interviewFaqs": ["How does Path Compression achieve amortized near-constant time in DSU?"],
        "topics": ["DSU", "Union Find", "MST", "Kruskal", "Graph"],
        "problems": ["redundant-connection", "min-cost-to-connect-all-points"],
        "icon": "git-pull-request", "color": "indigo", "sourceUrl": "https://leetcode.com"
    }
]

# Update detailed_roadmaps_data.json
out_path = os.path.join("frontend", "src", "data", "detailed_roadmaps_data.json")

with open(out_path, "r", encoding="utf-8") as f:
    roadmaps_data = json.load(f)

roadmap_map = {r['id']: r for r in roadmaps_data}

roadmap_map['tech-dsa']['steps'] = dsa_steps
roadmap_map['tech-dsa']['creator'] = 'GrindFam & LeetCode Curriculum'
roadmap_map['tech-dsa']['description'] = 'Exhaustive step-by-step masterclass covering Arrays, Two Pointers, Sliding Window, Linked Lists, Stacks/Queues, Trees, BST, Heaps, Hash Tables, Backtracking, 1D/2D DP, Graph Traversals, Dijkstra, DSU, and MST.'

updated_list = list(roadmap_map.values())
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(updated_list, f, indent=2)

print("Saved updated DSA roadmap data!")
