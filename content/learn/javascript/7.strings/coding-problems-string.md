---
title: String Coding Problems
description: 
navigation:
  title: Coding Problems
  order: 0
  icon: i-lucide-file-text
---

# String Interview Problems

Picture this. 🎯 You're sitting in a coding interview. The interviewer smiles and says:

> *"Can you write a function to check if a string has valid brackets?"*

Your heart beats a little faster. 😅 But then you remember: **string problems follow patterns**. Once you know the patterns, most questions become familiar friends.

In this lesson, you'll practise **16 popular interview questions** on strings, from warm-ups to the ones that big companies love to ask.

## How to Use This Lesson

For every problem:

1. 📖 **Read** the problem and the examples.
2. 🤔 **Think** about how you'd solve it **by hand** first.
3. ⌨️ **Try** it yourself in the playground.
4. ✅ **Then** read the idea and the solution.

> In a real interview, **talk through your thinking out loud**. Interviewers care about **how** you think, not just the final code. 🗣️

---

## The 6 Patterns You'll Use Again and Again 🧠

Almost every string problem uses one (or more) of these:

| Pattern | Idea | Example problems |
|---------|------|------------------|
| **Split → change → join** | Turn the string into an array, work on it, join it back | Reverse words |
| **Frequency map** | Count characters in an object or `Map` | Anagrams, first unique character |
| **Two pointers** | Two positions moving towards each other | Palindromes |
| **Sliding window** | A "window" that grows and shrinks over the string | Longest substring without repeats |
| **Stack** | Last in, first out, like a pile of plates | Valid brackets |
| **Expand around the centre** | Grow outward from each position | Longest palindrome |

### A quick word on speed (Big-O) ⏱️

Interviewers often ask, *"How fast is your solution?"* We describe this with **Big-O**, where `n` is the length of the string:

| Big-O | Meaning | Real-life feel |
|-------|---------|----------------|
| `O(n)` | Look at each character **once** | Reading a sentence once 🟢 |
| `O(n log n)` | Usually means **sorting** | Arranging cards in order 🟡 |
| `O(n²)` | A loop **inside** a loop | Comparing every student with every other student 🔴 |

> Aim for `O(n)` when you can, but a **working** `O(n²)` solution is always better than no solution!

---

# 🟢 Warm-Up Round

## Problem 1: Reverse Words in a Sentence

**Task:** Reverse the **order of the words**, not the letters. Remove extra spaces.

**Examples:**
- `"I love JavaScript"` → `"JavaScript love I"`
- `"  hello   world  "` → `"world hello"`

💡 **Idea:** **Split → change → join.** Trim the ends, split on one or more spaces, reverse the array, and join with a single space.

::js-playground
```js
function reverseWords(sentence) {
  return sentence.trim().split(/\s+/).reverse().join(" ");
}

console.log(reverseWords("I love JavaScript"));    // JavaScript love I
console.log(reverseWords("  hello   world  "));    // world hello
```
::

⏱️ **Time:** `O(n)`

**Follow-up the interviewer might ask:** *"Reverse the letters of each word, but keep the word order."*

::js-playground
```js
function reverseEachWord(sentence) {
  return sentence
    .split(" ")
    .map((word) => word.split("").reverse().join(""))
    .join(" ");
}

console.log(reverseEachWord("Hello World"));   // olleH dlroW
```
::

---

## Problem 2: Valid Anagram

**Task:** Return `true` if two strings contain **exactly the same letters**, in any order.

**Examples:**
- `"listen"`, `"silent"` → `true`
- `"rat"`, `"car"` → `false`

💡 **Idea:** **Frequency map.** Count every letter in the first word, then subtract for every letter in the second. If everything comes back to zero, they're anagrams.

::js-playground
```js
function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  const count = {};
  for (const ch of s) count[ch] = (count[ch] || 0) + 1;

  for (const ch of t) {
    if (!count[ch]) return false;   // missing or used up
    count[ch]--;
  }
  return true;
}

console.log(isAnagram("listen", "silent"));   // true
console.log(isAnagram("rat", "car"));         // false
```
::

⏱️ **Time:** `O(n)`

> 💡 A shorter answer is to sort both strings and compare them, but that's `O(n log n)`. Mention **both** in an interview. It shows you know the trade-offs!

---

## Problem 3: Longest Common Prefix

**Task:** Find the longest **starting part** that all the words share.

**Examples:**
- `["flower", "flow", "flight"]` → `"fl"`
- `["dog", "car", "race"]` → `""`

💡 **Idea:** Start by assuming the **whole first word** is the prefix. For each other word, keep **cutting the prefix shorter** until the word starts with it.

::js-playground
```js
function longestCommonPrefix(words) {
  if (words.length === 0) return "";

  let prefix = words[0];

  for (const word of words.slice(1)) {
    while (!word.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);   // remove the last character
      if (prefix === "") return "";
    }
  }
  return prefix;
}

console.log(longestCommonPrefix(["flower", "flow", "flight"]));   // fl
console.log(longestCommonPrefix(["interview", "internet", "interval"]));   // inter
console.log(longestCommonPrefix(["dog", "car", "race"]));         // ""
```
::

---

## Problem 4: Check if One String Is a Rotation of Another

**Task:** Is `b` a rotation of `a`? A rotation moves some characters from the front to the back.

**Examples:**
- `"waterbottle"`, `"erbottlewat"` → `true`
- `"hello"`, `"lohel"` → `true`
- `"hello"`, `"olleh"` → `false`

💡 **Idea:** Here's a clever trick 🪄. If you join `a` with itself, **every possible rotation** appears inside it!

```
a + a = "hellohello"
          ↑↑↑↑↑
          "lohel" is inside ✅
```

::js-playground
```js
function isRotation(a, b) {
  return a.length === b.length && (a + a).includes(b);
}

console.log(isRotation("waterbottle", "erbottlewat"));   // true
console.log(isRotation("hello", "lohel"));               // true
console.log(isRotation("hello", "olleh"));               // false
```
::

---

# 🟡 Medium Round

## Problem 5: Valid Palindrome (Ignoring Symbols)

**Task:** Check if a sentence reads the same forwards and backwards, **ignoring** case, spaces, and punctuation.

**Examples:**
- `"A man, a plan, a canal: Panama"` → `true`
- `"race a car"` → `false`

💡 **Idea:** **Two pointers.** One starts at the **left**, one at the **right**. Skip anything that isn't a letter or number. Compare the characters and move inward. It's like two friends walking towards each other and checking that they're holding the same card. 🃏

::js-playground
```js
function isPalindrome(text) {
  const isAlphaNum = (ch) => /[a-z0-9]/i.test(ch);

  let left = 0;
  let right = text.length - 1;

  while (left < right) {
    if (!isAlphaNum(text[left])) { left++; continue; }
    if (!isAlphaNum(text[right])) { right--; continue; }

    if (text[left].toLowerCase() !== text[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("A man, a plan, a canal: Panama"));   // true
console.log(isPalindrome("race a car"));                       // false
```
::

⏱️ **Time:** `O(n)`. It also uses **no extra copy** of the string, which interviewers like!

---

## Problem 6: Valid Parentheses ⭐

**Task:** Check if every bracket `( ) { } [ ]` is **closed in the correct order**.

**Examples:**
- `"()[]{}"` → `true`
- `"{[()]}"` → `true`
- `"(]"` → `false`
- `"([)]"` → `false`

💡 **Idea:** Use a **stack** 🍽️, like a pile of plates. Every **opening** bracket goes **on top** of the pile. When you see a **closing** bracket, the **top plate must match**. If it doesn't, it's invalid. At the end, the pile must be **empty**.

```
"{[()]}"
 {        push  → [ { ]
  [       push  → [ {, [ ]
   (      push  → [ {, [, ( ]
    )     pop ( ✅ → [ {, [ ]
     ]    pop [ ✅ → [ { ]
      }   pop { ✅ → [ ]   empty → valid!
```

::js-playground
```js
function isValid(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (stack.pop() !== pairs[ch]) {
      return false;
    }
  }
  return stack.length === 0;
}

console.log(isValid("()[]{}"));   // true
console.log(isValid("{[()]}"));   // true
console.log(isValid("(]"));       // false
console.log(isValid("([)]"));     // false
console.log(isValid("(("));       // false (never closed)
```
::

⏱️ **Time:** `O(n)`

---

## Problem 7: Group Anagrams Together

**Task:** Group words that are anagrams of each other.

**Example:** `["eat", "tea", "tan", "ate", "nat", "bat"]`
→ `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`

💡 **Idea:** Anagrams look **identical** when their letters are sorted: `"eat"`, `"tea"`, and `"ate"` all become `"aet"`. Use that sorted version as a **key** in an object, and collect the words under it.

::js-playground
```js
function groupAnagrams(words) {
  const groups = {};

  for (const word of words) {
    const key = word.split("").sort().join("");   // "tea" → "aet"
    groups[key] ??= [];
    groups[key].push(word);
  }

  return Object.values(groups);
}

console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
```
::

---

## Problem 8: First Non-Repeating Character

**Task:** Return the **index** of the first character that appears **only once**, or `-1` if there isn't one.

**Examples:**
- `"leetcode"` → `0` (`"l"`)
- `"loveleetcode"` → `2` (`"v"`)
- `"aabb"` → `-1`

💡 **Idea:** **Frequency map**, two passes. First, count everything. Then walk again and return the first character with a count of `1`.

::js-playground
```js
function firstUniqChar(s) {
  const count = {};
  for (const ch of s) count[ch] = (count[ch] || 0) + 1;

  for (let i = 0; i < s.length; i++) {
    if (count[s[i]] === 1) return i;
  }
  return -1;
}

console.log(firstUniqChar("leetcode"));       // 0
console.log(firstUniqChar("loveleetcode"));   // 2
console.log(firstUniqChar("aabb"));           // -1
```
::

---

## Problem 9: String Compression

**Task:** Compress repeated characters as *character + count*. If the result **isn't shorter**, return the original.

**Examples:**
- `"aabcccccaaa"` → `"a2b1c5a3"`
- `"abc"` → `"abc"` (compressed `"a1b1c1"` is longer)

💡 **Idea:** Walk through the string. Count how many times the **same character repeats in a row**. When it changes, save the character and its count. Build the result in an **array** and join once at the end, because strings are immutable.

::js-playground
```js
function compress(s) {
  const parts = [];
  let count = 1;

  for (let i = 0; i < s.length; i++) {
    if (s[i] === s[i + 1]) {
      count++;
    } else {
      parts.push(s[i] + count);
      count = 1;
    }
  }

  const result = parts.join("");
  return result.length < s.length ? result : s;
}

console.log(compress("aabcccccaaa"));   // a2b1c5a3
console.log(compress("abc"));           // abc
```
::

---

## Problem 10: Isomorphic Strings

**Task:** Two strings are **isomorphic** if the letters of one can be **replaced** to get the other, with each letter always mapping to the **same** letter.

**Examples:**
- `"egg"`, `"add"` → `true` (e→a, g→d)
- `"foo"`, `"bar"` → `false` (o can't be both a and r)
- `"paper"`, `"title"` → `true`

💡 **Idea:** Keep **two maps**: one from `s` to `t`, and one from `t` to `s`. If any letter tries to map to **two different** letters, it's not isomorphic. It's like a **secret code** 🔐: each letter must always have the same code letter.

::js-playground
```js
function isIsomorphic(s, t) {
  if (s.length !== t.length) return false;

  const sToT = new Map();
  const tToS = new Map();

  for (let i = 0; i < s.length; i++) {
    const a = s[i];
    const b = t[i];

    if ((sToT.has(a) && sToT.get(a) !== b) || (tToS.has(b) && tToS.get(b) !== a)) {
      return false;
    }
    sToT.set(a, b);
    tToS.set(b, a);
  }
  return true;
}

console.log(isIsomorphic("egg", "add"));       // true
console.log(isIsomorphic("foo", "bar"));       // false
console.log(isIsomorphic("paper", "title"));   // true
console.log(isIsomorphic("badc", "baba"));     // false
```
::

---

## Problem 11: Roman Numerals to Numbers 🏛️

**Task:** Convert a Roman numeral to a normal number.

| Symbol | I | V | X | L | C | D | M |
|--------|---|---|---|---|---|---|---|
| Value | 1 | 5 | 10 | 50 | 100 | 500 | 1000 |

**Examples:**
- `"III"` → `3`
- `"IX"` → `9`
- `"MCMXCIV"` → `1994`

💡 **Idea:** Usually you **add** each value. But when a **smaller** value comes **before** a bigger one (like `I` before `X` in `IX`), you **subtract** it instead.

::js-playground
```js
function romanToInt(s) {
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;

  for (let i = 0; i < s.length; i++) {
    const current = values[s[i]];
    const next = values[s[i + 1]] || 0;

    total += current < next ? -current : current;
  }
  return total;
}

console.log(romanToInt("III"));       // 3
console.log(romanToInt("IX"));        // 9
console.log(romanToInt("LVIII"));     // 58
console.log(romanToInt("MCMXCIV"));   // 1994
```
::

---

## Problem 12: Word Pattern

**Task:** Check if a sentence follows a pattern, where each **letter** matches exactly one **word**.

**Examples:**
- pattern `"abba"`, text `"dog cat cat dog"` → `true`
- pattern `"abba"`, text `"dog cat cat fish"` → `false`
- pattern `"aaaa"`, text `"dog cat cat dog"` → `false`

💡 **Idea:** This is **Problem 10** in disguise! 🎭 Instead of mapping letter → letter, map letter → word.

::js-playground
```js
function wordPattern(pattern, text) {
  const words = text.split(" ");
  if (pattern.length !== words.length) return false;

  const letterToWord = new Map();
  const wordToLetter = new Map();

  for (let i = 0; i < pattern.length; i++) {
    const letter = pattern[i];
    const word = words[i];

    if (letterToWord.has(letter) && letterToWord.get(letter) !== word) return false;
    if (wordToLetter.has(word) && wordToLetter.get(word) !== letter) return false;

    letterToWord.set(letter, word);
    wordToLetter.set(word, letter);
  }
  return true;
}

console.log(wordPattern("abba", "dog cat cat dog"));    // true
console.log(wordPattern("abba", "dog cat cat fish"));   // false
console.log(wordPattern("aaaa", "dog cat cat dog"));    // false
```
::

> 🧠 **Interview tip:** Spotting that a new problem is an **old problem in disguise** is a superpower. Always ask yourself, *"Have I seen something like this before?"*

---

# 🔴 Interview Favourites

## Problem 13: Longest Substring Without Repeating Characters ⭐⭐

This is one of the **most asked** string questions of all time!

**Task:** Find the length of the longest **continuous** part of the string with **no repeated** characters.

**Examples:**
- `"abcabcbb"` → `3` (`"abc"`)
- `"bbbbb"` → `1` (`"b"`)
- `"pwwkew"` → `3` (`"wke"`)

💡 **Idea:** **Sliding window** 🪟. Imagine a window sliding over the string.
- Move the **right** edge forward, one character at a time.
- If the new character is **already inside** the window, move the **left** edge just past its earlier position.
- Track the **biggest** window you've seen.

Think of a **train compartment** 🚃 where no two passengers can have the same name. When someone new boards with a name that's already inside, people at the front **get off** until the old one with that name has left.

```
"abcabcbb"
 [abc]abcbb     window "abc" → size 3
  [bca]bcbb     "a" repeated → left moves → size 3
   [cab]cbb     "b" repeated → left moves → size 3
   ...          best stays 3
```

::js-playground
```js
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();   // character → last index where it appeared
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];

    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
      left = lastSeen.get(ch) + 1;   // jump past the repeat
    }

    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(lengthOfLongestSubstring("abcabcbb"));   // 3
console.log(lengthOfLongestSubstring("bbbbb"));      // 1
console.log(lengthOfLongestSubstring("pwwkew"));     // 3
console.log(lengthOfLongestSubstring(""));           // 0
```
::

⏱️ **Time:** `O(n)`. Each character is visited only once. 🚀

---

## Problem 14: Longest Palindromic Substring ⭐⭐

**Task:** Find the longest part of the string that is a **palindrome**.

**Examples:**
- `"babad"` → `"bab"` (or `"aba"`)
- `"cbbd"` → `"bb"`
- `"forgeeksskeegfor"` → `"geeksskeeg"`

💡 **Idea:** **Expand around the centre.** Every palindrome has a **middle**. Try every position as a middle and **grow outward** while both sides match, like **ripples** 🌊 spreading out from a stone dropped in water.

There are **two kinds** of middles:
- **Odd length**, one centre character: `"aba"` → centre `b`
- **Even length**, the centre is between two characters: `"abba"` → centre between `b` and `b`

::js-playground
```js
function longestPalindrome(s) {
  let start = 0;
  let maxLen = 0;

  function expand(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    const length = right - left - 1;
    if (length > maxLen) {
      maxLen = length;
      start = left + 1;
    }
  }

  for (let i = 0; i < s.length; i++) {
    expand(i, i);       // odd-length palindromes
    expand(i, i + 1);   // even-length palindromes
  }

  return s.slice(start, start + maxLen);
}

console.log(longestPalindrome("babad"));              // bab
console.log(longestPalindrome("cbbd"));               // bb
console.log(longestPalindrome("forgeeksskeegfor"));   // geeksskeeg
```
::

⏱️ **Time:** `O(n²)`, which is the expected answer in most interviews.

---

## Problem 15: Count and Say 🗣️

**Task:** Each term **describes** the previous one out loud.

```
1          → "one 1"          → 11
11         → "two 1s"         → 21
21         → "one 2, one 1"   → 1211
1211       → "one 1, one 2, two 1s" → 111221
```

Find the `n`th term.

💡 **Idea:** It's **string compression** (Problem 9) again, just with the **count first** and the **character second**! Repeat it `n - 1` times.

::js-playground
```js
function countAndSay(n) {
  let term = "1";

  for (let step = 1; step < n; step++) {
    let next = "";
    let count = 1;

    for (let i = 0; i < term.length; i++) {
      if (term[i] === term[i + 1]) {
        count++;
      } else {
        next += count + term[i];
        count = 1;
      }
    }
    term = next;
  }
  return term;
}

for (let n = 1; n <= 6; n++) {
  console.log(`${n}: ${countAndSay(n)}`);
}
```
::

---

## Problem 16: Minimum Window Substring ⭐⭐⭐ (Challenge!)

This is a **hard** one, often asked at top companies. Don't worry if it takes a few tries! 💪

**Task:** Find the **smallest part** of `s` that contains **all the characters** of `t` (including duplicates).

**Examples:**
- `s = "ADOBECODEBANC"`, `t = "ABC"` → `"BANC"`
- `s = "a"`, `t = "aa"` → `""` (not enough `a`s)

💡 **Idea:** **Sliding window** again, but smarter.
1. Move the **right** edge to **grow** the window until it contains everything in `t`.
2. Then move the **left** edge to **shrink** it as small as possible, while it still contains everything.
3. Record the smallest valid window. Repeat.

It's like **packing a school bag** 🎒: first grab things until you have everything on the list, then take out anything extra you don't need.

::js-playground
```js
function minWindow(s, t) {
  if (t.length > s.length) return "";

  const need = {};
  for (const ch of t) need[ch] = (need[ch] || 0) + 1;

  let missing = t.length;   // how many characters we still need
  let left = 0;
  let bestStart = 0;
  let bestLen = Infinity;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (need[ch] > 0) missing--;          // this character was useful
    need[ch] = (need[ch] || 0) - 1;

    while (missing === 0) {               // window has everything → try to shrink
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const leftCh = s[left];
      need[leftCh]++;
      if (need[leftCh] > 0) missing++;    // we just removed a needed character
      left++;
    }
  }

  return bestLen === Infinity ? "" : s.slice(bestStart, bestStart + bestLen);
}

console.log(minWindow("ADOBECODEBANC", "ABC"));   // BANC
console.log(minWindow("a", "a"));                 // a
console.log(minWindow("a", "aa"));                // ""
```
::

⏱️ **Time:** `O(n)`. Each character enters and leaves the window at most once.

---

# 🎯 Practice Challenges (Try Yourself!)

No solutions this time. You've got this! 💪

1. **Reverse vowels only:** `"hello"` → `"holle"` *(Hint: two pointers)*
2. **Most frequent character:** `"programming"` → `"g"` (or `"r"` / `"m"` on a tie)
3. **Check if a string has all unique characters**, without using a `Set`.
4. **Longest word made of letters only:** ignore numbers and symbols.
5. **Valid palindrome II:** Can the string become a palindrome by removing **at most one** character? `"abca"` → `true`
6. **Integer to Roman:** `1994` → `"MCMXCIV"` (the reverse of Problem 11)
7. **Find all anagrams:** Find every starting index in `"cbaebabacd"` where an anagram of `"abc"` begins → `[0, 6]` *(Hint: sliding window of fixed size)*

::js-playground
```js
// ✍️ Write your solution here!
function reverseVowels(s) {
  // your code
  return s;
}

console.log(reverseVowels("hello"));   // expected: holle
```
::

---

## 🗣️ Interview Tips for String Questions

- **Ask questions first.** *"Is it case-sensitive? Can there be spaces? What about an empty string?"* Interviewers love this.
- **Start simple.** Give a working brute-force answer, then say *"Now let me make it faster."*
- **Test edge cases out loud:** empty string `""`, one character `"a"`, all the same `"aaaa"`, and spaces or symbols.
- **Remember that strings are immutable.** Building a big result with `+=` in a loop creates many new strings. Collecting pieces in an **array** and using `join()` once is a nice touch.
- **Name your pattern.** Saying *"I'll use a sliding window here"* shows real experience. 🏆

## Pattern Cheat Sheet

| If the problem says... | Think of... |
|------------------------|-------------|
| "same letters", "anagram", "count", "frequency" | **Frequency map** |
| "reads the same backwards", "compare both ends" | **Two pointers** |
| "longest / shortest substring with..." | **Sliding window** |
| "brackets", "matching", "nested" | **Stack** |
| "longest palindrome" | **Expand around the centre** |
| "each X maps to one Y" | **Two maps** (both directions) |
| "reverse words", "capitalise words" | **Split → change → join** |

## Key Takeaways

- Most string interview questions use a small set of **patterns**: frequency maps, two pointers, sliding windows, stacks, and expanding around the centre.
- **Frequency maps** solve anagram and uniqueness problems in `O(n)`, and a **stack** is the go-to tool for matching brackets.
- The **sliding window** pattern turns "longest/shortest substring" problems from `O(n²)` into `O(n)`.
- Many "new" problems are **old ones in disguise**, like Word Pattern (isomorphic strings) and Count and Say (compression).
- In interviews, **think out loud**, start simple, test **edge cases**, and then improve your solution. 🚀
