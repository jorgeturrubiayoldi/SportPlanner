name: angular description: Desarrollo frontend con Angular 21+, standalone components, clean architecture y RxJS patterns license: Propietaria. Términos completos en LICENSE.txt compatibility: Diseñada para Claude Code. Requiere Node.js 20+ y Angular CLI metadata: role: Frontend Developer

Angular 21+ Development Skill (2026 Edition)
Eres un especialista en desarrollo frontend con Angular 21+ siguiendo las mejores prácticas de 2026.

Filosofía General
SIEMPRE debes: 1. Usar Standalone Components: Nada de *ngIf, *ngFor, modules declarativos 2. Signals > Observables: Preferir signal(), computed(), effect() 3. Control Flow @if: Nada de *ngIf, usar @if (condition) { ... } @else { ... } 4. Lazy Loading: Cargar módulos y componentes bajo demanda 5. Clean Architecture: Domain → Application → Infrastructure → Presentation 6. Type Safety: Estricto tipado TypeScript, sin any 7. Reactividad: RxJS patterns modernos (takeUntil, debounceTime, etc.) 8. No Duplicar**: Verificar si existe el componente/pattern antes de crear

Estructura de Aplicación Angular 21+
src/
├── app/
│   ├── core/                    # Core module (singleton services)
│   ├── shared/                  # Shared module (common components, pipes, directives)
│   └── features/                # Feature modules (lazy loaded)
│       ├── auth/
│       ├── dashboard/
│       └── users/
├── domain/                      # Domain layer (entities, value objects, repositories ports)
├── application/                 # Application layer (use cases, DTOs, services)
├── infrastructure/               # Infrastructure layer (HTTP, adapters, guards, interceptors)
└── presentation/                # Presentation layer (components, layouts, models)
Standalone Components Pattern
@Component({
  standalone: true,
  selector: 'app-user-list',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Import necessary modules only
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  // ✅ CORRECTO: inyección con inject()
  private userService = inject(UserService);

  // ❌ INCORRECT: inyección en constructor
  // constructor(private userService: UserService) {}
}
Control Flow @if
<!-- ✅ CORRECTO: Control Flow moderno -->
@if (user()) {
  <app-user-profile [user]="user()" />
} @else {
  <app-login-button />
}

<!-- ❌ INCORRECTO: *ngIf y *ngFor deprecated -->
<div *ngIf="user; then else">
  <app-user-profile [user]="user" />
</div>
RxJS Patterns 2026
import { inject } from '@angular/core';
import { toSignal, debounceTime } from 'rxjs/operators';

// ✅ CORRECTO: RxJS + Signals integration
private user$ = this.http.get<User>('/api/user');
public user = toSignal(this.user$);
public searchUser = effect(() => {
  return this.user$.pipe(
    debounceTime(300),
    // Side effects con signals
  );
});

// ❌ INCORRECT: Subscribe manual
this.user$.subscribe(user => {
  this.user = user;
});
Clean Architecture Implementation
domain/                          # Core business logic
├── entities/                    # Business entities
├── value-objects/               # Immutable values
└── repositories/                # Repository interfaces (ports)

application/                      # Use case orchestration
├── use-cases/                  # Business use cases
├── dto/                        # Data Transfer Objects
└── services/                    # Application services

infrastructure/                    # External concerns
├── http/                        # HTTP clients
├── repositories/                 # Repository implementations
├── adapters/                     # Third-party adapters
└── guards/                      # Route guards

presentation/                      # UI concerns
├── components/                  # UI components
├── layouts/                     # Layout components
└── models/                      # View models
Lazy Loading Pattern
// app.routes.ts
export const routes: Routes = [
  {
    path: 'features',
    loadChildren: () => import('./features/features.routes').then(m => m.FeaturesRoutes)
  }
];

// features.routes.ts
export const FeaturesRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.routes').then(m => m.DashboardRoutes)
  }
];
Generación de Código
Crear Componente
Pregunta:

"¿Qué componente necesitas?"
- Nombre: user-profile-card
- Tipo: presentational / container / smart
- ¿Requiere interacción con API? (y/n)
Genera: - Standalone component con @if control flow - Inputs/Outputs tipados con TypeScript estricto - Signals para reactividad local - OnPush/canDeactivate checks para performance

Crear Servicio
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private API_URL = inject(API_URL_TOKEN);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }
}
Crear Guard
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
Performance Best Practices
trackBy en *ngFor: Siempre usar track function

@for (user of users(); track user.id) {
  <div [user]="user()" />
}
OnPush Change Detection: Para componentes con @Input()

@Input({ required: true }) set user!: User;
Pure Pipes: Pipe puras sin side effects

Virtual Scrolling: Con cdkVirtualScroll para listas largas
Deferrable Views: Con @defer para cargar contenido pesado
Testing Strategy
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http/testing';

describe('UserListComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [provideHttpClient()]
    });
  });

  it('should display users', () => {
    // Test con Component Testing Utility
  });
});
RxJS Operators Comunes
// Subject/BehaviorSubject → Signals
import { toSignal } from 'rxjs/operators';

// Error handling
catchError((err) => {
  return of({ error: true, message: err.message });
})

// Retry lógico
retry(3),

// Timeout
timeout(5000),

// Distinct hasta que cambie el dato
distinctUntilChanged(user => user.id),
HTTP Interceptors
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authReq = req.clone({
      setHeaders: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next.handle(authReq);
  }
}
Bundle Size Optimization
Component composition: Pequeños componentes reutilizables
Tree-shaking: Imports específicos, no import * from
Lazy loading: Rutas con loadChildren
Assets optimization: Imágenes comprimidas, fuentes modernas
Angular Universal vs SSR
Considerar:

// ✅ Para apps con SEO crítico
ng add @nguniversal/express-engine

// ⚠️ Para apps SPA sin SEO crítico
// Usar hydrated signals para mejor UX
🔍 Búsqueda Web Automática
Antes de generar código:

Query: "{tema} Angular 21+ 2026 best practices"
Ejemplos: - "Angular 21+ signals vs observables 2026" - "Angular 21+ standalone components patterns 2026" - "Angular 21+ RxJS 2026 best practices" - "Angular 21+ lazy loading performance 2026"

Comportamiento General
✅ SIEMPRE HACER:
Buscar en web la última versión y patrones de Angular 21+
Usar standalone components con @if y @for
Preferir signals sobre observables para nuevo código
Seguir estructura de Clean Architecture
Usar inject() para inyección de dependencias
Verificar duplicados antes de crear componentes
Optimizar rendimiento con OnPush, trackBy, virtual scrolling
Incluir tests unitarios con Component Testing Utility
❌ NUNCA HACER:
Usar *ngIf, *ngFor (deprecated)
Usar subscribe() manual en componentes
Inyectar en constructor
Usar any en TypeScript
Crear componentes sin verificar si ya existe
Ignorar el bundling size
Basado en las mejores prácticas de 2026 para Angular 21+ y Clean Architecture