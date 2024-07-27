## Project Rules/Coding Standards

<br/>

-   **NextJs Components**

    -   Import & use `api` to fetch & mutate data.

    ```
    import { api } from '~/common/utils/api';

    const users = api.user.getAll.useQuery()

    const createUser = api.user.createUser.useMutation();
    createUser.mutate({ name: 'John Doe' });

    ```

    -   Fetch data from the component that needs it [whenever possible](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#parallel-and-sequential-data-fetching).
    -   Avoid [request waterfalls](https://nextjs.org/learn/dashboard-app/fetching-data#what-are-request-waterfalls). If you’re fetching more than one thing, make sure you [fetch in parallel](https://medium.com/javascript-scene/javascript-quick-tip-avoid-serial-request-waterfalls-d03c4021d5fa) whenever you can.

<br/>

-   **Functions**

    -   Use named function declarations whenever possible.

        ```
             function doSomething() { ... }
        ```

    -   Use function expressions (arrow functions) for functions that usually require some kind of `closure`, `call()`, `apply()`, or `bind()` to ensure that the function is executed in the [proper scope](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#using_call_bind_and_apply). (ie event handlers)
        ```
            const handleOnClick = () => { ... }
            <AComponent onClick={handleOnClick} />
        ```
    -   Use arrow functions for functions that are passed as props to child components to avoid issues with `this` context.

<br />

### 2. ReactJs

1. **Component Structure and Organization:**

    - Use a consistent folder structure (e.g., separate folders for components, containers, styles, etc.).
    - Divide your UI into smaller, reusable components.
    - Follow a naming convention (PascalCase for components, camelCase for variables/functions).

2. **Functional Components:**

    - Use functional components with hooks (`useState`, `useEffect`, etc.) for managing state and side effects.
    - Avoid using class components unless necessary (for legacy code or specific use cases).

3. **Props and PropTypes:**

    - Use props to pass data from parent to child components.
    - Validate props using TypeScript to catch potential issues early.

4. **State Management:**

    - Use local state for component-specific state.
    - Use local state whenever possible. If your state is an object, use a combination of `useReducer` and `useState` to ensure state is always reconciled. For global state management, consider using libraries like the React Context API.

5. **Handling Events**:

    - Use arrow functions or function binding in the constructor to avoid issues with `this` context.
    - When passing functions as props, use memoization techniques (ie `useMemo`) to prevent unnecessary re-renders.

6. **Error Handling**:

    - Implement error boundaries (ErrorBoundary components) to gracefully handle errors. Display a toaster whenever an insert/update/delete api action is successful or fails.
    - Leverage NextJs `error.tsx` [file](https://nextjs.org/docs/app/api-reference/file-conventions/error).

7. **Separation Of Concerns**

    a. **Identify Logic Patterns**:
    Start by identifying logic patterns that are being repeated across different components. This could include API calls, data fetching, state management, and more.

    b. **Create Custom Hooks**: (client components)
    Once you've identified common logic, create custom hooks to encapsulate that logic.
    A custom hook is just a function that starts with the word "use" (this naming convention is crucial for hooks to work correctly).

    c. **Move Logic to Custom Hooks**:
    Transfer the relevant logic from your components to the custom hook.
    For instance, if you're fetching data using the useEffect hook, move that fetching logic into your useDataFetching custom hook.

    d. **Return Values**:
    Custom hooks can return values such as state, functions, and any other data required by the components using the hook. This allows you to abstract away complex logic and provide a simplified API for your components.

    e. **Reusable Logic:**
    The beauty of custom hooks is that you can reuse them across multiple components. This promotes code reuse, reduces duplication, and keeps your components focused on rendering.

    f. **Keep Components Clean:**
    With logic moved to custom hooks, your components become cleaner and more readable.
    They mainly focus on rendering UI and using the data and functions provided by the custom hooks.
    Aim to always put logic in a customHook, a customHook can exist in the same folder as a component. eg

    ```typescript
    folder > AddEditUser;
    Files > AddEditUser.tsx, useAddEditUser.ts;
    ```

    By following this approach, you're promoting modularity, reusability, and a cleaner separation of concerns in the codebase.

<br/>

#### Additional ReactJS Resources

-   [Thinking in react](https://react.dev/learn/thinking-in-react#step-3-find-the-minimal-but-complete-representation-of-ui-state)
-   [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect#caching-expensive-calculations).
