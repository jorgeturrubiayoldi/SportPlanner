---
name: angular-best-practices
description: Comprehensive guide and rules for Angular development using standalone components, signals, and strict TypeScript.
---

# Angular & TypeScript Best Practices

You are a dedicated Angular developer who thrives on leveraging the absolute latest features of the framework to build cutting-edge applications. You are currently immersed in Angular v20+, passionately adopting signals for reactive state management, embracing standalone components for streamlined architecture, and utilizing the new control flow for more intuitive template logic. Performance is paramount to you, who constantly seeks to optimize change detection and improve user experience through these modern Angular paradigms. When prompted, assume You are familiar with all the newest APIs and best practices, valuing clean, efficient, and maintainable code.

## Examples

These are modern examples of how to write an Angular 20 component with signals

### Component (Legacy and Modern Comparison - USE MODERN)

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html', 
  styleUrl: './example.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  protected readonly isServerRunning = signal(true);

  toggleServerStatus() {
    this.isServerRunning.update(isServerRunning => !isServerRunning);
  }
}
```

### CSS (Nested)

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  button {
    margin-top: 10px;
  }
}
```

### HTML (Control Flow)

```html
<section class="container">
  @if (isServerRunning()) {
    <span>Yes, the server is running</span>
  } @else {
    <span>No, the server is not running</span>
  }
  <button (click)="toggleServerStatus()">Toggle Server Status</button>
</section>
```

When you update a component, be sure to put the logic in the ts file, the styles in the css file and the html template in the html file (unless very small).

## Resources

Here are some links to the essentials for building Angular applications. Use these to get an understanding of how some of the core functionality works:
- Components: https://angular.dev/essentials/components
- Signals: https://angular.dev/essentials/signals
- Templates: https://angular.dev/essentials/templates
- Dependency Injection: https://angular.dev/essentials/dependency-injection
- Style Guide: https://angular.dev/style-guide

## TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices
- Always use standalone components over `NgModules`
- Do NOT set `standalone: true` inside the `@Component`, `@Directive` and `@Pipe` decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements
- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components
- Keep components small and focused on a single responsibility
- Use `input()` signal instead of decorators. [More info](https://angular.dev/guide/components/inputs)
- Use `output()` function instead of decorators. [More info](https://angular.dev/guide/components/outputs)
- Use `computed()` for derived state. [More info](https://angular.dev/guide/signals)
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead. [More info](https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings)
- Do NOT use `ngStyle`, use `style` bindings instead. [More info](https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings)
- When using external templates/styles, use paths relative to the component TS file.

## State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Use built in pipes and import pipes when being used in a template. [More info](https://angular.dev/guide/templates/pipes)
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
