# Modal Blur Animation Pattern

## Overview
A subtle and elegant blur animation pattern for modals using Framer Motion. This creates a smooth focus effect where the modal blurs in/out, drawing attention naturally to the content.

## Implementation

### 1. Animation Variants

```typescript
// Backdrop animation variants
const backdropVariants = {
  hidden: { 
    opacity: 0
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  }
}

// Modal animation variants with subtle blur
const modalVariants = {
  hidden: { 
    scale: 0.95,
    opacity: 0,
    filter: "blur(10px)"
  },
  visible: { 
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      opacity: { duration: 0.2 },
      filter: { duration: 0.3 }
    }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    filter: "blur(10px)",
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  }
}
```

### 2. Component Structure

```tsx
import { motion, AnimatePresence } from 'framer-motion'

function ModalComponent({ isOpen, onClose, children }) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### 3. Usage Example

```tsx
function MyComponent() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Open Modal
      </button>

      <ModalComponent 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
      >
        <h2>Modal Title</h2>
        <p>Your modal content here...</p>
      </ModalComponent>
    </>
  )
}
```

## Key Features

### Animation Properties

| Property | Enter State | Exit State | Purpose |
|----------|------------|------------|---------|
| **scale** | 0.95 → 1 | 1 → 0.95 | Subtle zoom effect |
| **opacity** | 0 → 1 | 1 → 0 | Fade in/out |
| **filter** | blur(10px) → blur(0px) | blur(0px) → blur(10px) | Focus effect |

### Timing Configuration

- **Backdrop fade**: 200ms in, 150ms out
- **Modal blur**: 300ms with spring physics
- **Exit animation**: 150ms for snappy closure

### Spring Physics

```javascript
{
  type: "spring",
  stiffness: 300,  // Controls the "springiness"
  damping: 25,     // Controls the "bounciness"
}
```

## Customization Options

### 1. Adjust Blur Intensity

```typescript
// Stronger blur effect
const modalVariants = {
  hidden: { 
    filter: "blur(20px)"  // Increase blur radius
  },
  // ...
}
```

### 2. Modify Spring Animation

```typescript
// Bouncier animation
transition: {
  type: "spring",
  stiffness: 400,  // Higher = faster
  damping: 15,     // Lower = bouncier
}
```

### 3. Add Direction-Based Entry

```typescript
// Slide from bottom with blur
const modalVariants = {
  hidden: { 
    scale: 0.95,
    opacity: 0,
    y: 20,  // Start 20px below
    filter: "blur(10px)"
  },
  visible: { 
    scale: 1,
    opacity: 1,
    y: 0,   // Slide to position
    filter: "blur(0px)"
  }
}
```

## CSS Classes Required

### Tailwind Classes
- `backdrop-blur-sm` - Adds subtle backdrop blur
- `bg-black/50` - Semi-transparent black backdrop
- `shadow-xl` - Elevation shadow for modal

### Dark Mode Support
- `dark:bg-black/70` - Darker backdrop in dark mode
- `dark:bg-gray-800` - Dark modal background

## Best Practices

### 1. Performance
- Keep blur radius reasonable (10-20px max)
- Use `mode="wait"` in AnimatePresence to prevent overlap
- Avoid animating too many properties simultaneously

### 2. Accessibility
- Always include click-outside-to-close functionality
- Add proper ARIA attributes for screen readers
- Ensure sufficient color contrast

### 3. User Experience
- Keep animations under 300ms for responsiveness
- Use consistent timing across your app
- Provide immediate visual feedback on interaction

## Browser Compatibility

### Supported Features
- ✅ CSS filter blur (all modern browsers)
- ✅ Backdrop filter (Chrome 76+, Safari 9+, Firefox 103+)
- ✅ CSS transforms for scale
- ✅ CSS opacity

### Fallbacks
For older browsers, the modal will still function but without blur effects:
```css
@supports not (backdrop-filter: blur(1px)) {
  .backdrop {
    background-color: rgba(0, 0, 0, 0.6);
  }
}
```

## Common Issues & Solutions

### Issue: Blurry text during animation
**Solution**: Ensure filter returns to exactly `blur(0px)` in the visible state

### Issue: Janky animation on mobile
**Solution**: Reduce blur radius or use opacity-only animation for mobile:
```typescript
const isMobile = window.innerWidth < 768
const blurAmount = isMobile ? "5px" : "10px"
```

### Issue: Modal appears behind other elements
**Solution**: Ensure proper z-index hierarchy:
```css
z-50  /* Backdrop */
z-50  /* Modal (child of backdrop) */
```

## Complete Example

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BlurModal({ isOpen, onClose, title, children }: ModalProps) {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  }

  const modalVariants = {
    hidden: { 
      scale: 0.95,
      opacity: 0,
      filter: "blur(10px)"
    },
    visible: { 
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        opacity: { duration: 0.2 },
        filter: { duration: 0.3 }
      }
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      filter: "blur(10px)",
      transition: { duration: 0.15, ease: "easeIn" }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## Related Patterns

- **Scale & Fade**: Similar but without blur effect
- **Slide & Blur**: Combines directional movement with blur
- **Stagger Children**: Animate modal content after modal appears
- **Portal Pattern**: Render modal outside component tree

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [CSS Filter Effects](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)
- [Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [Spring Animations](https://www.framer.com/motion/transition/#spring)
