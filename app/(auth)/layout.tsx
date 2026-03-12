'tsx'
import { ReactNode } from 'react' // ReactNode is a TypeScript type representing anything that can be rendered (elements, strings, etc.)

/**
 * Functional Component: A JavaScript function that returns JSX (HTML-like code).
 * AuthLayout: The name of this component, used to wrap authentication-related pages.
 */
const AuthLayout = ({ children }: { children: ReactNode }) => {
  /**
   * Destructuring: { children } extracts the 'children' property from the props object.
   * Props: Short for "properties," these are arguments passed into React components.
   * children: A special prop used to display whatever is nested inside this component.
   */
  return (
    // JSX: A syntax extension for JavaScript that allows you to write HTML-like structures.
    <div className="min-h-screen flex items-center justify-center">
      {/* {children}: This expression injects the nested content into the layout */}
      {children}
    </div>
  )
}

// Default Export: Allows this component to be imported and used in other files.
```tsx
export default AuthLayout
```