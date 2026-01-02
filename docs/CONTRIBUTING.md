# Contributing to GoTrotro

Thank you for your interest in contributing to GoTrotro! This guide will help you get started with contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members
- Accept constructive criticism gracefully

---

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/gotrotro.git
cd gotrotro

# Add upstream remote
git remote add upstream https://github.com/original/gotrotro.git
```

### 2. Set Up Development Environment

Follow the [Setup Guide](./SETUP.md) to configure your local environment.

### 3. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/my-feature
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

---

## Development Workflow

### 1. Make Your Changes

- Write clean, readable code
- Follow the code style guidelines (see below)
- Add tests for new functionality
- Update documentation as needed

### 2. Test Your Changes

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build the project
npm run build
```

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>

# Examples:
git commit -m "feat(routing): add OSRM adapter"
git commit -m "fix(map): resolve polyline decoding issue"
git commit -m "docs(setup): add OTP installation guide"
git commit -m "refactor(adapters): simplify error handling"
git commit -m "test(geocoding): add Nominatim adapter tests"
```

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build process or auxiliary tool changes

### 4. Keep Your Branch Updated

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# If you've already pushed, force push
git push origin feature/my-feature --force
```

---

## Code Style Guidelines

### TypeScript

- **Use TypeScript**: No plain JavaScript files
- **Strict mode**: All code must pass strict type checking
- **No `any`**: Avoid `any` type; use proper types or `unknown`
- **Interfaces over types**: Prefer `interface` for object shapes

**Good:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}
```

**Bad:**
```typescript
function getUser(id: any): any {
  // ...
}
```

### React Components

- **Functional components**: Use function components with hooks
- **TypeScript props**: Always type your props
- **Descriptive names**: Use clear, descriptive names
- **Single responsibility**: Each component should do one thing

**Good:**
```typescript
interface RouteInstructionsProps {
  itinerary: DisplayItinerary;
  onClose?: () => void;
}

export const RouteInstructions: React.FC<RouteInstructionsProps> = ({
  itinerary,
  onClose
}) => {
  // ... component logic
  return (
    // ... JSX
  );
};
```

### File Organization

```
src/
├── components/           # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.css
│   └── Map/
│       ├── MapComponent.tsx
│       └── MapComponent.test.tsx
├── adapters/            # External API adapters
├── hooks/               # Custom React hooks
├── services/            # Business logic
├── types/               # TypeScript types
└── utils/               # Utility functions
```

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
  - `MapComponent.tsx`
  - `polylineDecoder.ts`
- **Components**: PascalCase
  - `RouteInstructions`, `GeocoderInput`
- **Functions**: camelCase
  - `calculateRoute`, `decodePolyline`
- **Constants**: UPPER_SNAKE_CASE
  - `DEFAULT_MAX_WALK_DISTANCE`, `API_TIMEOUT`
- **Interfaces/Types**: PascalCase
  - `RoutingAdapter`, `LocationResult`

### Code Formatting

We use Prettier for consistent formatting:

```bash
# Format all files
npm run format

# Or configure your editor to format on save
```

**Settings**:
- Indent: 2 spaces
- Semicolons: Yes
- Single quotes: Yes
- Trailing comma: es5
- Print width: 100

### Comments

- **Write self-documenting code**: Good names reduce need for comments
- **TSDoc for public APIs**: Use JSDoc/TSDoc for exported functions

```typescript
/**
 * Searches for locations using the configured geocoder
 * @param query - The search query string
 * @param options - Optional search options
 * @returns Array of location results
 * @throws Error if geocoder is not configured
 */
export async function searchLocations(
  query: string,
  options?: GeocoderSearchOptions
): Promise<LocationResult[]> {
  // Implementation
}
```

- **Explain "why", not "what"**: Code shows what, comments explain why

```typescript
// Good: Explains reasoning
// Use exponential backoff to avoid overwhelming the API
const delay = 1000 * Math.pow(2, attemptIndex);

// Bad: States the obvious
// Set delay to 1000 times 2 to the power of attempt index
const delay = 1000 * Math.pow(2, attemptIndex);
```

---

## Testing

### Unit Tests

Write unit tests for:
- Utility functions
- Adapters
- Services
- Custom hooks

**Example**:
```typescript
// polylineDecoder.test.ts
import { decodePolyline } from './polylineDecoder';

describe('decodePolyline', () => {
  it('should decode a valid polyline', () => {
    const encoded = 'q|_a@~bZf`AgE';
    const decoded = decodePolyline(encoded);
    
    expect(decoded).toHaveLength(2);
    expect(decoded[0][0]).toBeCloseTo(-0.13888, 4);
    expect(decoded[0][1]).toBeCloseTo(5.57529, 4);
  });

  it('should throw error for invalid polyline', () => {
    expect(() => decodePolyline('invalid')).toThrow();
  });
});
```

### Component Tests

Use React Testing Library:

```typescript
// GeocoderInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GeocoderInput } from './GeocoderInput';

describe('GeocoderInput', () => {
  it('should render input field', () => {
    render(<GeocoderInput placeholder="Search" icon="origin" value="" onChange={() => {}} />);
    
    const input = screen.getByPlaceholderText('Search');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<GeocoderInput placeholder="Search" icon="origin" value="" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'Madina' } });
    
    expect(handleChange).toHaveBeenCalledWith('Madina');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- MapComponent.test.tsx
```

### Test Coverage

Aim for:
- **80%+ coverage** for utility functions and adapters
- **60%+ coverage** for components
- **100% coverage** for critical business logic

---

## Submitting Changes

### 1. Push Your Branch

```bash
git push origin feature/my-feature
```

### 2. Create a Pull Request

1. Go to the repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No linter errors

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Fixes #123
```

### 3. PR Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

### PR Guidelines

- **Keep PRs focused**: One feature or fix per PR
- **Write clear descriptions**: Explain what and why
- **Include tests**: All new code should have tests
- **Update documentation**: If you change behavior, update docs
- **Screenshots for UI changes**: Help reviewers see what changed

---

## Reporting Issues

### Before Creating an Issue

1. **Search existing issues**: Your issue might already exist
2. **Try the latest version**: Bug might already be fixed
3. **Check documentation**: Issue might be configuration-related

### Creating a Good Issue

Use the appropriate template:

**Bug Report**:
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 110]
- Node version: [e.g., 18.0.0]
- GoTrotro version: [e.g., 1.0.0]

## Screenshots
If applicable

## Additional Context
Any other relevant information
```

**Feature Request**:
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this work?

## Alternatives Considered
What other approaches did you think about?

## Additional Context
Any other relevant information
```

---

## Development Best Practices

### 1. Start Small

- Begin with small, focused contributions
- Fix typos, improve documentation
- Add tests for existing code
- Fix small bugs

### 2. Ask Questions

- Don't hesitate to ask for help
- Use GitHub Discussions for questions
- Tag maintainers if you're stuck

### 3. Be Patient

- Reviews take time
- Maintainers are volunteers
- Be open to feedback

### 4. Learn from Feedback

- Code reviews are learning opportunities
- Don't take feedback personally
- Ask for clarification if needed

---

## Areas Where We Need Help

### High Priority

- **Documentation**: Improve guides and add examples
- **Testing**: Increase test coverage
- **Accessibility**: Improve keyboard navigation and screen reader support
- **Performance**: Optimize map rendering and data loading

### Good First Issues

Look for issues labeled:
- `good first issue` - Great for beginners
- `help wanted` - We need community help
- `documentation` - Documentation improvements

---

## Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- README.md acknowledgments section

---

## Questions?

- **Documentation**: [docs/](./README.md)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gotrotro/discussions)
- **Issues**: [GitHub Issues](https://github.com/yourusername/gotrotro/issues)

Thank you for contributing to GoTrotro! 🚀

