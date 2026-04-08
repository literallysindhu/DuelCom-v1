// problems.ts
// Static problem database for DuelCom-v1
// Compatible with the Problem interface in types.ts
// Each problem includes starter code, examples, and is suitable for AI judgement
// via compareSolutions (correctness, efficiency, readability, edge case handling)

import { Problem, Difficulty, Language } from './types';

// ─────────────────────────────────────────────
// JAVASCRIPT PROBLEMS
// ─────────────────────────────────────────────

const jsProblems: Problem[] = [
  {
    id: 'js-easy-1',
    title: 'Two Sum',
    difficulty: Difficulty.EASY,
    language: Language.JAVASCRIPT,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`.

You may assume each input has exactly one solution, and you may not use the same element twice.
Return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
      },
    ],
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
}

// Example usage:
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
`,
  },
  {
    id: 'js-easy-2',
    title: 'Reverse a String',
    difficulty: Difficulty.EASY,
    language: Language.JAVASCRIPT,
    description: `Write a function \`reverseString\` that takes a string and returns it reversed.

Do **not** use the built-in \`.reverse()\` method on arrays.`,
    examples: [
      {
        input: '"hello"',
        output: '"olleh"',
      },
      {
        input: '"abcde"',
        output: '"edcba"',
      },
      {
        input: '""',
        output: '""',
        explanation: 'Empty string returns empty string',
      },
    ],
    starterCode: `/**
 * @param {string} s
 * @return {string}
 */
function reverseString(s) {
  // Your code here
}

console.log(reverseString("hello")); // "olleh"
`,
  },
  {
    id: 'js-medium-1',
    title: 'Group Anagrams',
    difficulty: Difficulty.MEDIUM,
    language: Language.JAVASCRIPT,
    description: `Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in any order.

An **anagram** is a word or phrase formed by rearranging the letters of a different word, using all the original letters exactly once.`,
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
      },
      {
        input: 'strs = [""]',
        output: '[[""]]',
      },
      {
        input: 'strs = ["a"]',
        output: '[["a"]]',
      },
    ],
    starterCode: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // Your code here
}

console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));
`,
  },
  {
    id: 'js-medium-2',
    title: 'Flatten Nested Array',
    difficulty: Difficulty.MEDIUM,
    language: Language.JAVASCRIPT,
    description: `Write a function \`flatten\` that takes a deeply nested array and returns a flat array with all values in order.

Do **not** use \`Array.prototype.flat()\` or \`Array.prototype.flatMap()\`.`,
    examples: [
      {
        input: '[1, [2, [3, [4]], 5]]',
        output: '[1, 2, 3, 4, 5]',
      },
      {
        input: '[[1, 2], [3, 4], [5, 6]]',
        output: '[1, 2, 3, 4, 5, 6]',
      },
      {
        input: '[1, 2, 3]',
        output: '[1, 2, 3]',
        explanation: 'Already flat, returns as-is',
      },
    ],
    starterCode: `/**
 * @param {any[]} arr
 * @return {any[]}
 */
function flatten(arr) {
  // Your code here
}

console.log(flatten([1, [2, [3, [4]], 5]])); // [1, 2, 3, 4, 5]
`,
  },
  {
    id: 'js-hard-1',
    title: 'LRU Cache',
    difficulty: Difficulty.HARD,
    language: Language.JAVASCRIPT,
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(capacity)\` — Initialize the LRU cache with positive size \`capacity\`.
- \`get(key)\` — Return the value of the key if it exists, otherwise return \`-1\`.
- \`put(key, value)\` — Update or insert the value. If the cache reaches capacity, evict the least recently used key before inserting.

Both \`get\` and \`put\` must run in **O(1)** average time complexity.`,
    examples: [
      {
        input: 'capacity = 2\nput(1, 1)\nput(2, 2)\nget(1)\nput(3, 3)\nget(2)\nput(4, 4)\nget(1)\nget(3)\nget(4)',
        output: '1\n-1\n-1\n3\n4',
        explanation: 'After put(3,3), key 2 is evicted. After put(4,4), key 1 is evicted.',
      },
    ],
    starterCode: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    // Your code here
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    // Your code here
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    // Your code here
  }
}

const lru = new LRUCache(2);
lru.put(1, 1);
lru.put(2, 2);
console.log(lru.get(1)); // 1
lru.put(3, 3);
console.log(lru.get(2)); // -1
`,
  },
];

// ─────────────────────────────────────────────
// PYTHON PROBLEMS
// ─────────────────────────────────────────────

const pythonProblems: Problem[] = [
  {
    id: 'py-easy-1',
    title: 'Palindrome Check',
    difficulty: Difficulty.EASY,
    language: Language.PYTHON,
    description: `Write a function \`is_palindrome\` that returns \`True\` if the given string is a palindrome (reads the same forwards and backwards), and \`False\` otherwise.

Ignore case and consider only alphanumeric characters.`,
    examples: [
      {
        input: '"A man a plan a canal Panama"',
        output: 'True',
      },
      {
        input: '"race a car"',
        output: 'False',
      },
      {
        input: '" "',
        output: 'True',
        explanation: 'After filtering, an empty string is a palindrome.',
      },
    ],
    starterCode: `def is_palindrome(s: str) -> bool:
    # Your code here
    pass

print(is_palindrome("A man a plan a canal Panama"))  # True
print(is_palindrome("race a car"))  # False
`,
  },
  {
    id: 'py-easy-2',
    title: 'FizzBuzz',
    difficulty: Difficulty.EASY,
    language: Language.PYTHON,
    description: `Write a function \`fizzbuzz\` that takes an integer \`n\` and returns a list of strings for numbers from 1 to n:
- \`"FizzBuzz"\` for multiples of both 3 and 5
- \`"Fizz"\` for multiples of 3
- \`"Buzz"\` for multiples of 5
- The number as a string otherwise`,
    examples: [
      {
        input: 'n = 15',
        output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
      },
      {
        input: 'n = 3',
        output: '["1","2","Fizz"]',
      },
    ],
    starterCode: `from typing import List

def fizzbuzz(n: int) -> List[str]:
    # Your code here
    pass

print(fizzbuzz(15))
`,
  },
  {
    id: 'py-medium-1',
    title: 'Binary Search',
    difficulty: Difficulty.MEDIUM,
    language: Language.PYTHON,
    description: `Given a sorted array of distinct integers \`nums\` and a target value, return the index if the target is found. If not, return the index where it **would be** inserted in order.

You must write an algorithm with **O(log n)** runtime complexity.`,
    examples: [
      {
        input: 'nums = [1,3,5,6], target = 5',
        output: '2',
      },
      {
        input: 'nums = [1,3,5,6], target = 2',
        output: '1',
      },
      {
        input: 'nums = [1,3,5,6], target = 7',
        output: '4',
      },
    ],
    starterCode: `from typing import List

def search_insert(nums: List[int], target: int) -> int:
    # Your code here
    pass

print(search_insert([1,3,5,6], 5))  # 2
print(search_insert([1,3,5,6], 2))  # 1
`,
  },
  {
    id: 'py-medium-2',
    title: 'Valid Parentheses',
    difficulty: Difficulty.MEDIUM,
    language: Language.PYTHON,
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket.`,
    examples: [
      {
        input: 's = "()"',
        output: 'True',
      },
      {
        input: 's = "()[]{}"',
        output: 'True',
      },
      {
        input: 's = "(]"',
        output: 'False',
      },
    ],
    starterCode: `def is_valid(s: str) -> bool:
    # Your code here
    pass

print(is_valid("()"))      # True
print(is_valid("()[]{}"")) # True
print(is_valid("(]"))      # False
`,
  },
  {
    id: 'py-hard-1',
    title: 'Word Ladder',
    difficulty: Difficulty.HARD,
    language: Language.PYTHON,
    description: `Given two words \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the number of words in the **shortest transformation sequence** from \`beginWord\` to \`endWord\`, or 0 if no such sequence exists.

Rules:
- Every adjacent pair of words in the sequence differs by exactly one letter.
- Every word in the sequence (except \`beginWord\`) must exist in \`wordList\`.`,
    examples: [
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        output: '5',
        explanation: '"hit" → "hot" → "dot" → "dog" → "cog"',
      },
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]',
        output: '0',
        explanation: '"cog" is not in wordList',
      },
    ],
    starterCode: `from typing import List

def ladder_length(beginWord: str, endWord: str, wordList: List[str]) -> int:
    # Your code here
    pass

print(ladder_length("hit", "cog", ["hot","dot","dog","lot","log","cog"]))  # 5
`,
  },
];

// ─────────────────────────────────────────────
// C PROBLEMS
// ─────────────────────────────────────────────

const cProblems: Problem[] = [
  {
    id: 'c-easy-1',
    title: 'Fibonacci Sequence',
    difficulty: Difficulty.EASY,
    language: Language.C,
    description: `Write a function \`fibonacci\` that returns the **nth Fibonacci number** (0-indexed).

- fib(0) = 0
- fib(1) = 1
- fib(n) = fib(n-1) + fib(n-2)

Aim for an **iterative** solution rather than a naive recursive one.`,
    examples: [
      {
        input: 'n = 0',
        output: '0',
      },
      {
        input: 'n = 1',
        output: '1',
      },
      {
        input: 'n = 10',
        output: '55',
      },
    ],
    starterCode: `#include <stdio.h>

long long fibonacci(int n) {
    // Your code here
    return 0;
}

int main() {
    printf("%lld\\n", fibonacci(0));  // 0
    printf("%lld\\n", fibonacci(10)); // 55
    return 0;
}
`,
  },
  {
    id: 'c-easy-2',
    title: 'Count Vowels',
    difficulty: Difficulty.EASY,
    language: Language.C,
    description: `Write a function \`count_vowels\` that takes a null-terminated C string and returns the count of vowels (a, e, i, o, u — both upper and lower case).`,
    examples: [
      {
        input: '"Hello World"',
        output: '3',
        explanation: 'e, o, o',
      },
      {
        input: '"aeiou"',
        output: '5',
      },
      {
        input: '"bcdfg"',
        output: '0',
      },
    ],
    starterCode: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int count_vowels(const char *s) {
    // Your code here
    return 0;
}

int main() {
    printf("%d\\n", count_vowels("Hello World")); // 3
    printf("%d\\n", count_vowels("aeiou"));        // 5
    return 0;
}
`,
  },
  {
    id: 'c-medium-1',
    title: 'Reverse Linked List',
    difficulty: Difficulty.MEDIUM,
    language: Language.C,
    description: `Given the head of a singly linked list, reverse the list and return the new head.

You must do this **in-place** — do not allocate extra memory for another linked list.`,
    examples: [
      {
        input: 'head = [1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
      },
      {
        input: 'head = [1, 2]',
        output: '[2, 1]',
      },
      {
        input: 'head = []',
        output: '[]',
      },
    ],
    starterCode: `#include <stdio.h>
#include <stdlib.h>

typedef struct ListNode {
    int val;
    struct ListNode *next;
} ListNode;

ListNode* reverseList(ListNode* head) {
    // Your code here
    return NULL;
}

// Helper: build list from array
ListNode* build(int *arr, int n) {
    if (!n) return NULL;
    ListNode *head = malloc(sizeof(ListNode));
    head->val = arr[0]; head->next = NULL;
    ListNode *cur = head;
    for (int i = 1; i < n; i++) {
        cur->next = malloc(sizeof(ListNode));
        cur->next->val = arr[i]; cur->next->next = NULL;
        cur = cur->next;
    }
    return head;
}

// Helper: print list
void print_list(ListNode *head) {
    while (head) { printf("%d ", head->val); head = head->next; }
    printf("\\n");
}

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    ListNode *head = build(arr, 5);
    head = reverseList(head);
    print_list(head); // 5 4 3 2 1
    return 0;
}
`,
  },
  {
    id: 'c-hard-1',
    title: 'Merge K Sorted Arrays',
    difficulty: Difficulty.HARD,
    language: Language.C,
    description: `Given \`k\` sorted integer arrays each of length \`n\`, merge them into a single sorted array.

You are given:
- \`int arrays[k][n]\` — the input arrays
- \`int k\` — number of arrays
- \`int n\` — length of each array
- \`int result[]\` — output array of length \`k*n\`

Aim for better than O(k·n·log(k·n)) brute-force. A min-heap approach is preferred.`,
    examples: [
      {
        input: 'k=3, n=3, arrays=[[1,4,7],[2,5,8],[3,6,9]]',
        output: '[1,2,3,4,5,6,7,8,9]',
      },
      {
        input: 'k=2, n=2, arrays=[[1,3],[2,4]]',
        output: '[1,2,3,4]',
      },
    ],
    starterCode: `#include <stdio.h>
#include <stdlib.h>

void merge_k_sorted(int **arrays, int k, int n, int *result) {
    // Your code here
}

int main() {
    int a1[] = {1,4,7}, a2[] = {2,5,8}, a3[] = {3,6,9};
    int *arrays[] = {a1, a2, a3};
    int result[9];
    merge_k_sorted(arrays, 3, 3, result);
    for (int i = 0; i < 9; i++) printf("%d ", result[i]);
    printf("\\n"); // 1 2 3 4 5 6 7 8 9
    return 0;
}
`,
  },
];

// ─────────────────────────────────────────────
// C++ PROBLEMS
// ─────────────────────────────────────────────

const cppProblems: Problem[] = [
  {
    id: 'cpp-easy-1',
    title: 'Maximum Subarray',
    difficulty: Difficulty.EASY,
    language: Language.CPP,
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the **largest sum** and return its sum.

This is the classic Kadane's algorithm problem.`,
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'Subarray [4,-1,2,1] has the largest sum = 6',
      },
      {
        input: 'nums = [1]',
        output: '1',
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
      },
    ],
    starterCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Your code here
    return 0;
}

int main() {
    vector<int> nums = {-2,1,-3,4,-1,2,1,-5,4};
    cout << maxSubArray(nums) << endl; // 6
    return 0;
}
`,
  },
  {
    id: 'cpp-easy-2',
    title: 'Single Number',
    difficulty: Difficulty.EASY,
    language: Language.CPP,
    description: `Given a non-empty array of integers \`nums\`, every element appears **twice** except for one. Find that single element.

You must implement a solution with **O(n)** time complexity and **O(1)** extra space.`,
    examples: [
      {
        input: 'nums = [2,2,1]',
        output: '1',
      },
      {
        input: 'nums = [4,1,2,1,2]',
        output: '4',
      },
      {
        input: 'nums = [1]',
        output: '1',
      },
    ],
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int singleNumber(vector<int>& nums) {
    // Your code here
    return 0;
}

int main() {
    vector<int> nums = {4,1,2,1,2};
    cout << singleNumber(nums) << endl; // 4
    return 0;
}
`,
  },
  {
    id: 'cpp-medium-1',
    title: 'Number of Islands',
    difficulty: Difficulty.MEDIUM,
    language: Language.CPP,
    description: `Given an \`m x n\` 2D binary grid where \`'1'\` represents land and \`'0'\` represents water, return the number of **islands**.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: '1',
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: '3',
      },
    ],
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    void dfs(vector<vector<char>>& grid, int r, int c) {
        // Your helper here
    }

    int numIslands(vector<vector<char>>& grid) {
        // Your code here
        return 0;
    }
};

int main() {
    vector<vector<char>> grid = {
        {'1','1','0','0','0'},
        {'1','1','0','0','0'},
        {'0','0','1','0','0'},
        {'0','0','0','1','1'}
    };
    Solution sol;
    cout << sol.numIslands(grid) << endl; // 3
    return 0;
}
`,
  },
  {
    id: 'cpp-medium-2',
    title: 'Longest Palindromic Substring',
    difficulty: Difficulty.MEDIUM,
    language: Language.CPP,
    description: `Given a string \`s\`, return the **longest palindromic substring** in \`s\`.

A palindrome is a string that reads the same forward and backward.`,
    examples: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: '"aba" is also a valid answer',
      },
      {
        input: 's = "cbbd"',
        output: '"bb"',
      },
      {
        input: 's = "a"',
        output: '"a"',
      },
    ],
    starterCode: `#include <iostream>
#include <string>
using namespace std;

string longestPalindrome(string s) {
    // Your code here
    return "";
}

int main() {
    cout << longestPalindrome("babad") << endl; // "bab" or "aba"
    cout << longestPalindrome("cbbd") << endl;  // "bb"
    return 0;
}
`,
  },
  {
    id: 'cpp-hard-1',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: Difficulty.HARD,
    language: Language.CPP,
    description: `Design an algorithm to **serialize** and **deserialize** a binary tree.

Serialization converts a tree to a string. Deserialization reconstructs the tree from that string.

There is no restriction on your serialization format — just ensure \`deserialize(serialize(root))\` returns the original tree.`,
    examples: [
      {
        input: 'root = [1,2,3,null,null,4,5]',
        output: '[1,2,3,null,null,4,5]',
        explanation: 'The deserialized tree matches the original',
      },
      {
        input: 'root = []',
        output: '[]',
      },
    ],
    starterCode: `#include <iostream>
#include <string>
#include <sstream>
#include <queue>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Codec {
public:
    string serialize(TreeNode* root) {
        // Your code here
        return "";
    }

    TreeNode* deserialize(string data) {
        // Your code here
        return nullptr;
    }
};

int main() {
    TreeNode* root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    root->right->left = new TreeNode(4);
    root->right->right = new TreeNode(5);

    Codec codec;
    string serialized = codec.serialize(root);
    cout << "Serialized: " << serialized << endl;
    TreeNode* restored = codec.deserialize(serialized);
    cout << "Root val: " << restored->val << endl; // 1
    return 0;
}
`,
  },
];

// ─────────────────────────────────────────────
// COMBINED EXPORT
// ─────────────────────────────────────────────

export const PROBLEMS: Problem[] = [
  ...jsProblems,
  ...pythonProblems,
  ...cProblems,
  ...cppProblems,
];

/**
 * Get a random problem filtered by difficulty and/or language.
 * Falls back to full database if no matches found.
 */
export function getRandomProblem(
  difficulty?: Difficulty,
  language?: Language
): Problem {
  let pool = PROBLEMS;
  if (difficulty) pool = pool.filter(p => p.difficulty === difficulty);
  if (language) pool = pool.filter(p => p.language === language);
  if (pool.length === 0) pool = PROBLEMS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get a problem by its id.
 */
export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find(p => p.id === id);
}

/**
 * Get all problems for a given language.
 */
export function getProblemsByLanguage(language: Language): Problem[] {
  return PROBLEMS.filter(p => p.language === language);
}

/**
 * Get all problems for a given difficulty.
 */
export function getProblemsByDifficulty(difficulty: Difficulty): Problem[] {
  return PROBLEMS.filter(p => p.difficulty === difficulty);
}
