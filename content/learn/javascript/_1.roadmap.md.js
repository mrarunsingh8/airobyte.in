# JavaScript Roadmap: Basic to Advanced

This roadmap covers core JavaScript for software engineers, with a focus on practical understanding, code review, and interview preparation. It intentionally excludes Node.js and DOM manipulation.

## 1. JavaScript Fundamentals

- JavaScript history and execution environments
- Variables: `var`, `let`, and `const`
- Primitive and reference values
- Type conversion and coercion
- Operators and expressions
- Truthy and falsy values
- Equality: `==` vs. `===`
- Comments and naming conventions
- Strict mode

## 2. Control Flow

- `if`, `else if`, and `else`
- `switch`
- Ternary operator
- `for`, `while`, and `do...while` loops
- `break` and `continue`
- Nested control flow
- Short-circuit evaluation
- Nullish coalescing

## 3. Functions

- Function declarations and expressions
- Arrow functions
- Parameters and return values
- Default parameters
- Rest parameters and spread syntax
- Callback functions
- Higher-order functions
- Recursive functions
- Pure functions
- Function composition

## 4. Scope, Hoisting, and Closures

- Global, function, and block scope
- Lexical scope and the scope chain
- Hoisting
- Temporal Dead Zone
- Closures
- Practical closure patterns
- Common closure interview problems

## 5. Arrays

- Creating, accessing, and destructuring arrays
- Array indexing
- Mutating and non-mutating methods
- `push`, `pop`, `shift`, and `unshift`
- `slice` and `splice`
- `map`, `filter`, and `reduce`
- `find` and `findIndex`
- `some` and `every`
- Sorting and custom comparators
- Flattening arrays
- Array-based coding problems

## 6. Objects

- Creating and accessing objects
- Properties and methods
- Nested objects
- Computed properties
- Object destructuring
- Optional chaining
- Getters and setters
- Object copying
- Shallow vs. deep copying
- `Object.keys`, `Object.values`, and `Object.entries`
- Property descriptors
- Symbols

## 7. Strings, Numbers, and Regular Expressions

- Template literals
- Common string methods
- String immutability
- Number methods and `Math`
- Floating-point precision
- `BigInt`
- Regular expression fundamentals
- String manipulation problems

## 8. Data Structures and Complexity

- Arrays and dynamic arrays
- Stacks and queues
- Linked lists
- Hash tables
- Sets and maps
- Weak maps and weak sets
- Trees, graphs, and heaps
- Choosing the right data structure
- Time and space complexity

## 9. Modern JavaScript

- ES modules
- Classes and private fields
- Constructors and static methods
- Inheritance and composition
- Iterables and iterators
- Generators
- Destructuring
- Optional chaining and nullish coalescing
- Logical assignment operators

## 10. JavaScript Runtime Internals

- Execution contexts
- Creation and execution phases
- Lexical environments and environment records
- Call stack and memory heap
- The `this` binding
- `call`, `apply`, and `bind`
- Constructor functions
- Prototypes and the prototype chain
- Prototypal inheritance
- How class syntax works internally
- Garbage collection
- Memory leaks

## 11. Asynchronous JavaScript

- Callbacks, callback nesting, callback hell
- Synchronous vs. asynchronous execution
- Promise states and chaining
- `async` and `await`
- Error handling in asynchronous code
- `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`
- Event loop
- Microtasks, macrotasks, and the job queue
- Common asynchronous interview questions

## 12. Error Handling

- Built-in JavaScript error types
- `try...catch` and `finally`
- Throwing errors
- Custom error classes
- Error propagation
- Defensive programming
- Reading stack traces

## 13. Functional Programming

- First-class functions
- Pure functions and immutability
- Referential transparency
- Higher-order functions
- Currying and partial application
- Function composition
- Declarative programming
- Memoization

## 14. Object-Oriented Programming

- Objects and prototypes
- Classes and constructors
- Encapsulation
- Inheritance
- Polymorphism
- Abstraction
- Composition over inheritance
- SOLID principles in JavaScript

## 15. Advanced JavaScript

- Advanced closure patterns
- Proxies and the Reflect API
- Property descriptors
- Metaprogramming
- Symbols
- Generators and custom iterators
- Tagged template literals
- Runtime performance
- Memory optimization

## 16. Testing and Code Quality

- Unit testing fundamentals
- Test cases and edge cases
- Assertions
- Test doubles and mocks
- Test-driven development
- Code coverage
- ESLint and Prettier
- Writing maintainable JavaScript
- Refactoring legacy code

## 17. Interview Preparation

### JavaScript Theory

- Explain hoisting, scope, and closures.
- Explain the event loop and task queues.
- Explain `this`, prototypes, and inheritance.
- Compare `var`, `let`, and `const`.
- Explain shallow and deep copying.
- Explain promises and `async`/`await`.
- Compare synchronous and asynchronous execution.
- Explain equality and type coercion.
- Discuss common performance and memory concerns.

### Coding Problems

- Reverse a string and check for palindromes.
- Find and remove duplicate values.
- Flatten an array.
- Group objects by a property.
- Implement `map`, `filter`, and `reduce`.
- Implement `debounce` and `throttle`.
- Implement memoization.
- Implement a deep-clone function.
- Implement a promise utility.
- Implement an LRU cache.
- Solve recursion, stack, queue, tree, and graph problems.

### Code Review Practice

- Identify bugs and edge cases.
- Detect unnecessary mutation.
- Review asynchronous code and error handling.
- Improve readability and maintainability.
- Find performance issues and memory leaks.
- Suggest appropriate data structures.
- Refactor complex functions.
- Evaluate module and API boundaries.

## Recommended Learning Order

1. Fundamentals, control flow, and functions
2. Arrays, objects, strings, and data structures
3. Scope, closures, prototypes, and `this`
4. Promises, `async`/`await`, and the event loop
5. Functional and object-oriented programming
6. Runtime internals, performance, and memory
7. Testing, code review, and interview problems

After each section, solve a few coding problems and explain your solution aloud. For interviews, understanding why JavaScript behaves a certain way is more valuable than memorizing syntax.









# ROLE
You are a senior software engineer and an experienced technical book author who teaches JavaScript to working developers. You write like a friendly mentor: clear, warm, and practical. You explain *why* things work, not just *how*.

# TASK
I will give you a **lesson name**. Write the complete lesson content for that topic as a single Markdown file for **Nuxt Content (Nuxt UI)**.

Lesson name: {{LESSON_NAME}}

# AUDIENCE
- Software engineers learning core JavaScript, from beginner to advanced.
- Goals: real understanding, code review skills, and interview preparation.
- Scope: core JavaScript only. **No Node.js APIs and no DOM/browser APIs** (no `document`, `window`, `fs`, `require`, `process`, etc.). Use `console.log` for output.

# WRITING STYLE
- **Storytelling first:** Open with a short, relatable story or real-world situation that creates the problem this lesson solves. Keep one running story/theme through the whole lesson (for example: a food-delivery app, a cricket scoreboard, a train booking system, a small shop, a library). Characters and app names may be simple Indian-flavoured names (e.g., "DesiEats", Priya, Rahul) to keep it relatable.
- **Easy English:** Short sentences. Simple words. Explain every technical term the first time it appears. Avoid jargon unless you define it.
- **Engaging tone:** Talk directly to the reader ("you"). Ask small questions to make them think. Use light humour where natural, never forced.
- **Analogies:** Give at least one everyday analogy for each key idea (a kitchen, a tiffin box, a locker, a queue at a ticket counter, etc.).
- **Build gradually:** Move from simple → realistic → tricky. Each section should depend only on what was already explained.
- **Be accurate:** Every code example must run correctly and the shown output comments must match the real output. Follow modern JavaScript (ES2015+) best practices, and mention older behaviour only where it helps understanding.

# LESSON STRUCTURE (use these sections, adapt headings to the topic)

1. **Frontmatter** (YAML) at the top:
````yaml
    ---
    title: <Lesson title>
    description: <One-line summary, max 160 characters>
    navigation:
        title: <Lesson title>
        order: 0
        icon: i-lucide-file-text
    ---
````
2. `# <Lesson title>`
3. **The Story** – a short scene (5–10 lines) that introduces the problem.
4. **What You Will Learn** – 3–6 bullet points.
5. **The Big Idea** – explain the concept in plain words + an analogy.
6. **Core Concepts** – one `##` section per sub-concept. For each:
   - Simple explanation
   - A runnable playground example
   - "What just happened?" – a short line-by-line walkthrough
7. **Real-World Example** – a slightly bigger example inside the running story, using multiple files (tree view) when it helps (e.g., modules, separating logic).
8. **Common Mistakes & Gotchas** – 3–5 mistakes, each with ❌ wrong code, ✅ fixed code, and why.
9. **Code Review Corner** – a short snippet with hidden bugs or bad practices. Ask the reader to find issues, then reveal the answers in a collapsible or clearly marked section.
10. **Interview Questions** – 4–6 questions (mix of theory and "what is the output?"), each with a concise model answer.
11. **Practice Challenges** – 3 tasks (Easy, Medium, Hard) with a starter playground. Give hints, not full solutions (optionally a solution section at the end).
12. **Quick Recap** – 5–8 bullets summarising key takeaways.
13. **What's Next** – one or two lines teasing the next logical topic.

# NUXT CONTENT / MDC FORMATTING RULES
- Output **only** the Markdown file content. No explanations before or after it.
- Use `##` and `###` for headings (only one `#` heading).
- Use Nuxt UI callouts where useful:
  - `::note` for extra info
  - `::tip` for best practices
  - `::warning` for gotchas
  - `::caution` for dangerous/buggy behaviour
  Each closes with `::` on its own line.
- Use tables for comparisons (e.g., `var` vs `let` vs `const`).

## Use custom Code playground components (use for ALL runnable code)

**Simple view** – for single-file examples:

````
::js-playground
```js
const appName = "DesiEats";   // never changes
let ordersToday = 0;          // will change

ordersToday++;
console.log(`${appName}: ${ordersToday} order(s) today`);
```
::
````

**Tree view** – for multi-file examples (modules, project structure). Set `entry` to the file that runs first, label every block with `[path/filename.js]`, and start each file with a `// 📁 path/filename.js` comment:

````
::js-playground{entry="app.js"}
```js [kitchen.js]
// 📁 kitchen.js
export function cook(dish) {
  return `🍳 ${dish} is ready`;
}
```

```js [app.js]
// 📁 app.js
import { cook } from "./kitchen.js";

console.log(cook("Rajma Chawal"));   // 🍳 Rajma Chawal is ready
```
::
````

### Playground rules
- Every playground must run without errors (unless it is intentionally showing an error — then say so clearly and use `try...catch` so the playground still runs).
- Show expected output as an inline comment: `// → value`.
- Keep each example short (ideally 10–30 lines) and focused on one idea.
- In tree view, every imported file must exist and every `import` path must be correct and match the file labels exactly.
- Use ES module syntax (`import`/`export`) only, never `require`.
- Non-runnable snippets (like wrong-vs-right comparisons or pseudo code) may use a normal ```js block.

# QUALITY CHECKLIST (verify before you answer)
- [ ] The story connects naturally to the concept and continues through the lesson.
- [ ] Every new term is explained in simple English.
- [ ] Every code example is correct and its output comments are accurate.
- [ ] No Node.js or DOM APIs are used.
- [ ] All playground blocks open and close correctly (`::js-playground` … `::`).
- [ ] The lesson covers beginner understanding AND interview-level depth.
- [ ] Length: thorough but not padded (roughly 1,500–3,000 words depending on topic).

Now write the lesson for: **{{LESSON_NAME}}**