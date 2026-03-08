name: origen-best-practices description: Buenas practicas de ingenieria de software, arquitectura, DDD, seguridad y testing license: Propietaria. Términos completos en LICENSE.txt compatibility: Diseñada para Claude Code metadata: role: Code Reviewer

Skill: Buenas Prácticas y Patrones de Arquitectura de Software
Descripcion
Referencia integral de buenas practicas de ingenieria de software moderno. Cubre arquitectura, DDD, seguridad, APIs, testing, CI/CD, gestion de secretos, containerizacion y principios de desarrollo. Enfoque agnostico de tecnologia con ejemplos en pseudocodigo aplicables a cualquier lenguaje y framework.

Contexto de Uso
Cuando usar este skill: Al inicio de un proyecto, refactorizacion, revision de calidad, o como referencia durante el desarrollo
Input esperado: Requisitos de negocio, restricciones, tamano estimado del equipo, contexto tecnologico
Output generado:
Decision de patron arquitectonico justificada
Estructura de modulos/capas
Patrones de comunicacion inter-modulos
Estrategia de separacion de responsabilidades
Guias de seguridad, testing, APIs y operaciones
Documento ARQUITECTURA-PATRONES.md
Patrones Arquitectonicos
1. Clean Architecture (Arquitectura Limpia)
Estado actual: Gold standard para aplicaciones empresariales de larga vida.

Principios fundamentales: - Independencia de frameworks: La logica de negocio NO depende de ningun framework especifico - Independencia de UI: La interfaz puede cambiar sin afectar las reglas de negocio - Independencia de base de datos: Se puede cambiar el motor de persistencia sin modificar el dominio - Independencia de agentes externos: La logica de negocio no conoce detalles de APIs externas - Testabilidad: Las reglas de negocio pueden probarse sin UI, BD, o servicios externos

Estructura de capas (de adentro hacia afuera):

+---------------------------------------------------+
|              Capa de Presentacion                  |  <- Controladores, Endpoints, Vistas
|              (API, Web, CLI)                       |
+---------------------------------------------------+
|           Capa de Infraestructura                  |  <- Persistencia, Clientes HTTP, Archivos
|  (BD, APIs externas, Email, Almacenamiento)        |
+---------------------------------------------------+
|            Capa de Aplicacion                      |  <- Casos de Uso, DTOs, Validadores
|     (Servicios de aplicacion, Mapeos)              |
+---------------------------------------------------+
|              Capa de Dominio                       |  <- Entidades, Value Objects, Agregados
|         (Nucleo de negocio)                        |  <- Interfaces de Repositorios
+---------------------------------------------------+
Cuando usar: - Aplicaciones empresariales de larga vida (5+ anos) - Dominios de negocio complejos - Equipos grandes (10+ desarrolladores) - Requisitos de alta testabilidad - Posibilidad de cambios de tecnologia

Desventajas: - Boilerplate alto (interfaces, DTOs, mappers en cada capa) - Curva de aprendizaje empinada para equipos nuevos - Sobrecarga para aplicaciones CRUD simples

2. Vertical Slice Architecture (Arquitectura de Rebanadas Verticales)
Estado actual: Tendencia creciente, especialmente popular para equipos agiles y desarrollo rapido.

Filosofia central:

"En lugar de organizar por capas tecnicas (Controladores, Servicios, Repositorios), organiza por features (Crear Producto, Aprobar Pedido, Generar Factura)."
Estructura por feature:

src/
+-- Features/
|   +-- CrearProducto/
|   |   +-- CrearProducto.Request      (DTO de entrada)
|   |   +-- CrearProducto.Handler      (Logica completa de la feature)
|   |   +-- CrearProducto.Validator    (Validacion)
|   |   +-- CrearProducto.Endpoint     (Endpoint API)
|   |   +-- CrearProducto.Response     (DTO de salida)
|   +-- ActualizarProducto/
|   |   +-- ... (misma estructura)
|   +-- EliminarProducto/
|       +-- ... (misma estructura)
+-- Common/
    +-- Database/
    +-- Exceptions/
    +-- Responses/
Patron tipico con Mediador:

// Definicion del Request
DEFINE CrearProductoRequest
    nombre: String
    precio: Decimal

// Handler que contiene TODA la logica de la feature
DEFINE CrearProductoHandler
    DEPENDS ON database, logger

    FUNCTION handle(request: CrearProductoRequest) -> ApiResponse<ProductoDto>
        producto = NEW Producto
            nombre = request.nombre
            precio = request.precio

        database.productos.add(producto)
        database.saveChanges()

        RETURN ApiResponse.success(NEW ProductoDto(producto.id, producto.nombre))
    END FUNCTION

// Endpoint que delega al handler via Mediador
DEFINE CrearProductoEndpoint
    ROUTE POST "/api/productos"
    FUNCTION invoke(request, mediator)
        RETURN mediator.send(request)
    END FUNCTION
Cuando usar: - Equipos pequenos/medianos (2-8 desarrolladores) - Desarrollo agil con entregas frecuentes - Aplicaciones con features independientes - Proyectos donde la velocidad de desarrollo es critica - APIs REST simples con operaciones CRUD predominantes

Ventajas: - Velocidad: Agregar una nueva feature no requiere tocar multiples capas - Aislamiento: Cambios en una feature no afectan otras - Simplicidad: Menos abstracciones, codigo mas directo - Escalabilidad de equipos: Diferentes equipos trabajan en features distintas sin conflictos

Desventajas: - Duplicacion de codigo entre features (puede ser intencional) - Menos enfasis en separacion de capas - Puede volverse caotico sin disciplina y convenciones claras

3. Modular Monolith (Monolito Modular)
Estado actual: Opcion recomendada para aplicaciones empresariales modernas.

Definicion:

"Un monolito modular es una aplicacion que se despliega como una sola unidad, pero esta internamente dividida en modulos independientes con fronteras claras."
Principios clave: 1. Modulos autonomos: Cada modulo tiene su propia base de datos logica (o esquema) 2. Comunicacion por contratos: Los modulos se comunican SOLO a traves de interfaces publicas 3. Sin acceso directo a datos: Un modulo NO puede hacer queries directos a las tablas de otro modulo 4. Posible evolucion a microservicios: Los modulos pueden extraerse como servicios independientes

Estructura de modulos:

src/
+-- Modules/
|   +-- Catalogo/                        (Modulo de catalogo)
|   |   +-- Catalogo.Api/               (Endpoints publicos)
|   |   +-- Catalogo.Application/       (Casos de uso)
|   |   +-- Catalogo.Domain/            (Entidades, Value Objects)
|   |   +-- Catalogo.Infrastructure/    (Persistencia, Repositorios)
|   |   +-- Catalogo.Contracts/         (DTOs publicos, eventos)
|   +-- Pedidos/                         (Modulo de pedidos)
|   |   +-- Pedidos.Api/
|   |   +-- Pedidos.Application/
|   |   +-- Pedidos.Domain/
|   |   +-- Pedidos.Infrastructure/
|   |   +-- Pedidos.Contracts/
|   +-- Facturacion/                     (Modulo de facturacion)
|       +-- ... (misma estructura)
+-- Common/
|   +-- Common.Application/              (Shared Kernel)
|   +-- Common.Infrastructure/
|   +-- Common.Domain/
+-- Host/
    +-- Api/                             (Punto de entrada unico)
        +-- Program (bootstrap)
Comunicacion entre modulos:

// --- MAL: Acceso directo a la base de datos de otro modulo ---
producto = catalogoDatabase.productos.find(productoId)  // NUNCA hacer esto

// --- BIEN: Comunicacion a traves de interfaz publica ---
DEFINE INTERFACE ICatalogoModulo
    FUNCTION obtenerProductoPorId(productoId: Integer) -> ProductoDto?
END INTERFACE

// En el modulo de Pedidos
DEFINE CrearPedidoHandler
    DEPENDS ON catalogoModulo: ICatalogoModulo

    FUNCTION handle(request: CrearPedidoRequest) -> Pedido
        // Llamada al modulo de catalogo a traves del contrato
        producto = catalogoModulo.obtenerProductoPorId(request.productoId)

        IF producto IS NULL
            THROW ProductoNoEncontradoException
        END IF

        RETURN NEW Pedido
            productoId = producto.id
            precio = producto.precio
    END FUNCTION
Patrones de comunicacion:

Llamadas directas (In-Process): Un modulo llama a la interfaz publica de otro
Eventos de dominio: Modulos se comunican mediante eventos
Bus de mensajes interno: Para comunicacion asincrona (Outbox pattern)
Cuando usar: - Aplicaciones empresariales grandes - Equipos distribuidos trabajando en dominios diferentes - Necesidad de escalabilidad futura a microservicios - Dominios de negocio complejos con multiples bounded contexts (DDD)

Ventajas: - Despliegue simple: Una sola aplicacion (sin complejidad de microservicios) - Aislamiento de dominios: Cambios en un modulo no afectan otros - Evolucion gradual: Puedes extraer modulos como microservicios cuando sea necesario - Performance: Comunicacion in-process (sin latencia de red)

4. Enfoque Hibrido: Clean Architecture + Vertical Slice + Modular Monolith
Estado actual: Recomendacion de la industria. Combina lo mejor de los tres enfoques.

Filosofia:

"No es Clean Architecture VS Vertical Slice VS Modular Monolith. Es Clean Architecture PARA la estructura de modulos + Vertical Slice PARA features dentro de cada modulo."
Estructura hibrida:

src/
+-- Modules/
|   +-- Catalogo/
|   |   +-- Catalogo.Api/
|   |   |   +-- Features/                    <- VERTICAL SLICES
|   |   |       +-- CrearProducto/
|   |   |       +-- ActualizarProducto/
|   |   |       +-- EliminarProducto/
|   |   +-- Catalogo.Application/            <- CLEAN ARCHITECTURE
|   |   |   +-- Common/
|   |   |   +-- Features/
|   |   +-- Catalogo.Domain/                 <- CLEAN ARCHITECTURE
|   |   |   +-- Entities/
|   |   |   +-- ValueObjects/
|   |   |   +-- Repositories/
|   |   +-- Catalogo.Infrastructure/         <- CLEAN ARCHITECTURE
|   |       +-- Persistence/
|   |       +-- Repositories/
|   +-- Pedidos/
|       +-- ... (misma estructura)
+-- Common/
    +-- BuildingBlocks/
Beneficios del hibrido: - Separacion de responsabilidades (de Clean Architecture) - Velocidad de desarrollo (de Vertical Slice) - Aislamiento de modulos (de Modular Monolith) - Escalabilidad de equipos (equipos por modulo, features paralelas)

Cuando usar: - Aplicaciones empresariales medianas-grandes - Equipos de 10+ desarrolladores - Proyectos con horizontes de 3-5+ anos - Necesidad de balance entre velocidad y mantenibilidad

5. Arquitectura Hexagonal (Ports & Adapters)
Estado actual: Cada vez mas adoptada. Formaliza la separacion entre logica de negocio y el mundo exterior.

Filosofia:

"La aplicacion no sabe si esta siendo controlada por un usuario, un test automatizado, o un batch. Tampoco sabe si persiste en PostgreSQL o en un archivo plano."
Estructura conceptual:

                    +------ Adaptadores Primarios ------+
                    |  (Driving / Input)                |
                    |  - API REST Controller             |
                    |  - CLI                             |
                    |  - Event Consumer                  |
                    |  - Tests                           |
                    +-----------------------------------+
                                   |
                          [Puertos de Entrada]
                          (Interfaces que la app EXPONE)
                                   |
              +--------------------------------------------+
              |            NUCLEO DE LA APLICACION          |
              |                                            |
              |   Dominio:    Entidades, Value Objects,    |
              |               Reglas de negocio            |
              |                                            |
              |   Aplicacion: Casos de uso,                |
              |               Orquestacion                 |
              |                                            |
              +--------------------------------------------+
                                   |
                          [Puertos de Salida]
                          (Interfaces que la app NECESITA)
                                   |
                    +------ Adaptadores Secundarios -----+
                    |  (Driven / Output)                 |
                    |  - Repositorio BD                   |
                    |  - Cliente HTTP externo             |
                    |  - Servicio de Email                |
                    |  - Sistema de archivos              |
                    +-----------------------------------+
Puertos y Adaptadores en pseudocodigo:

// === PUERTOS DE ENTRADA (lo que la app OFRECE) ===
DEFINE INTERFACE ICrearPedidoUseCase
    FUNCTION ejecutar(request: CrearPedidoRequest) -> PedidoDto

// === PUERTOS DE SALIDA (lo que la app NECESITA) ===
DEFINE INTERFACE IPedidoRepositorio        // Puerto de persistencia
    FUNCTION guardar(pedido: Pedido) -> Integer
    FUNCTION obtenerPorId(id: Integer) -> Pedido?

DEFINE INTERFACE INotificadorPedido        // Puerto de notificacion
    FUNCTION notificarCreacion(pedido: Pedido)

// === NUCLEO: Caso de uso (NO conoce adaptadores) ===
DEFINE CrearPedidoUseCase IMPLEMENTS ICrearPedidoUseCase
    DEPENDS ON repo: IPedidoRepositorio           // Puerto de salida
    DEPENDS ON notificador: INotificadorPedido    // Puerto de salida

    FUNCTION ejecutar(request: CrearPedidoRequest) -> PedidoDto
        pedido = NEW Pedido(request.cliente, request.lineas)
        repo.guardar(pedido)
        notificador.notificarCreacion(pedido)
        RETURN PedidoDto.from(pedido)

// === ADAPTADOR PRIMARIO (Input): REST Controller ===
DEFINE PedidoController                            // Adaptador de entrada
    DEPENDS ON useCase: ICrearPedidoUseCase

    ROUTE POST "/api/pedidos"
    FUNCTION crear(request)
        RETURN useCase.ejecutar(request)

// === ADAPTADORES SECUNDARIOS (Output): Implementaciones ===
DEFINE PostgresPedidoRepositorio IMPLEMENTS IPedidoRepositorio
    FUNCTION guardar(pedido) -> Integer
        // SQL real contra PostgreSQL
    FUNCTION obtenerPorId(id) -> Pedido?
        // SQL real contra PostgreSQL

DEFINE EmailNotificadorPedido IMPLEMENTS INotificadorPedido
    FUNCTION notificarCreacion(pedido)
        // Envio real de email via SMTP

// === ADAPTADOR PARA TESTS (sustituye sin cambiar nada) ===
DEFINE InMemoryPedidoRepositorio IMPLEMENTS IPedidoRepositorio
    PRIVATE almacen: Map<Integer, Pedido>

    FUNCTION guardar(pedido) -> Integer
        almacen.put(pedido.id, pedido)
        RETURN pedido.id
Cuando usar: - Aplicaciones con multiples canales de entrada (API, CLI, eventos, tests) - Proyectos que necesitan cambiar infraestructura sin tocar dominio - Equipos que practican TDD (los tests son un adaptador mas) - Microservicios con integraciones variadas

Diferencia con Clean Architecture: - Clean Architecture organiza en capas concentricas (Dominio > Aplicacion > Infraestructura > Presentacion) - Hexagonal organiza en dentro vs fuera (Nucleo vs Adaptadores) con puertos explícitos - En la practica, son complementarias — Clean Architecture define las capas internas, Hexagonal define como se conectan con el exterior

6. Domain-Driven Design (DDD)
Estado actual: Esencial para dominios de negocio complejos. Se combina naturalmente con Clean Architecture y Hexagonal.

Conceptos Estrategicos
Bounded Context (Contexto Delimitado): Un limite dentro del cual un modelo de dominio es valido. La misma palabra puede significar cosas diferentes en diferentes contextos.

+-------------------+     +-------------------+     +-------------------+
|     VENTAS        |     |    INVENTARIO     |     |    FACTURACION    |
|                   |     |                   |     |                   |
|  Producto:        |     |  Producto:        |     |  Producto:        |
|  - nombre         |     |  - sku            |     |  - concepto       |
|  - precio venta   |     |  - stock actual   |     |  - precio factura |
|  - descuento      |     |  - stock minimo   |     |  - impuesto       |
|  - categoria      |     |  - ubicacion      |     |  - retencion      |
|                   |     |                   |     |                   |
|  "Producto" aqui  |     |  "Producto" aqui  |     |  "Producto" aqui  |
|  es algo vendible |     |  es algo fisico   |     |  es un concepto   |
|                   |     |  en almacen       |     |  facturable       |
+-------------------+     +-------------------+     +-------------------+
Ubiquitous Language (Lenguaje Ubicuo): El codigo usa el mismo vocabulario que los expertos de negocio. No inventar nombres tecnicos cuando el negocio ya tiene un termino.

// --- MAL: Vocabulario tecnico inventado ---
DEFINE DataProcessor
    FUNCTION processRecord(record)
    FUNCTION updateStatus(record, status)

// --- BIEN: Vocabulario del negocio ---
DEFINE GestorDePolizas
    FUNCTION emitirPoliza(solicitud: SolicitudPoliza) -> Poliza
    FUNCTION renovarPoliza(polizaId: Integer) -> Poliza
    FUNCTION cancelarPoliza(polizaId: Integer, motivo: MotivoCancelacion)
Conceptos Tacticos
Entidades: Objetos con identidad unica que persiste a traves del tiempo.

DEFINE Pedido   // Entidad — tiene ID unico
    id: PedidoId (readonly)
    cliente: ClienteId
    lineas: List<LineaPedido>
    estado: EstadoPedido
    fechaCreacion: DateTime

    // La identidad es el ID, no los atributos
    FUNCTION equals(otro: Pedido) -> Boolean
        RETURN this.id == otro.id
Value Objects: Objetos sin identidad, definidos por sus atributos. Inmutables.

DEFINE Dinero (IMMUTABLE, VALUE OBJECT)
    monto: Decimal (readonly)
    moneda: String (readonly)    // "EUR", "USD"

    CONSTRUCTOR(monto, moneda)
        IF monto < 0
            THROW DomainException("Monto no puede ser negativo")
        IF moneda NOT IN ["EUR", "USD", "GBP"]
            THROW DomainException("Moneda no soportada")

    FUNCTION sumar(otro: Dinero) -> Dinero
        IF this.moneda != otro.moneda
            THROW DomainException("No se pueden sumar monedas diferentes")
        RETURN NEW Dinero(this.monto + otro.monto, this.moneda)

    FUNCTION multiplicar(factor: Decimal) -> Dinero
        RETURN NEW Dinero(this.monto * factor, this.moneda)

    // Igualdad por valor, no por referencia
    FUNCTION equals(otro: Dinero) -> Boolean
        RETURN this.monto == otro.monto AND this.moneda == otro.moneda

DEFINE Direccion (IMMUTABLE, VALUE OBJECT)
    calle: String (readonly)
    ciudad: String (readonly)
    codigoPostal: String (readonly)
    pais: String (readonly)
Agregados: Cluster de entidades y value objects tratados como una unidad de consistencia. Solo se accede a traves del Aggregate Root.

// Pedido es el AGGREGATE ROOT
// LineaPedido es una entidad interna del agregado
DEFINE Pedido   // AGGREGATE ROOT
    id: PedidoId (readonly)
    PRIVATE lineas: List<LineaPedido>
    PRIVATE estado: EstadoPedido
    PRIVATE total: Dinero

    // Solo el Aggregate Root expone operaciones
    FUNCTION agregarLinea(productoId: ProductoId, cantidad: Integer, precioUnitario: Dinero)
        IF estado != EstadoPedido.BORRADOR
            THROW DomainException("Solo se pueden agregar lineas a pedidos en borrador")
        IF cantidad <= 0
            THROW DomainException("Cantidad debe ser positiva")

        lineaExistente = lineas.find(l -> l.productoId == productoId)
        IF lineaExistente IS NOT NULL
            lineaExistente.incrementarCantidad(cantidad)
        ELSE
            lineas.add(NEW LineaPedido(productoId, cantidad, precioUnitario))

        recalcularTotal()

    FUNCTION confirmar()
        IF lineas.isEmpty()
            THROW DomainException("No se puede confirmar un pedido sin lineas")
        IF estado != EstadoPedido.BORRADOR
            THROW DomainException("Solo se pueden confirmar pedidos en borrador")
        estado = EstadoPedido.CONFIRMADO
        // Publicar evento de dominio
        agregarEvento(NEW PedidoConfirmadoEvent(this.id, this.total))

    // NO exponer la lista directamente — proteger invariantes
    FUNCTION obtenerLineas() -> List<LineaPedidoDto>  // Copia de solo lectura
        RETURN lineas.map(l -> l.toDto())

// REGLA: Un repositorio POR agregado
DEFINE INTERFACE IPedidoRepositorio
    guardar(pedido: Pedido)
    obtenerPorId(id: PedidoId) -> Pedido?
    // NO: obtenerLineaPorId() — las lineas solo se acceden via Pedido
Reglas de Agregados: 1. Mantener agregados pequenos — solo incluir entidades que DEBEN ser consistentes juntas 2. Referenciar otros agregados por ID — nunca contener el objeto completo de otro agregado 3. Una transaccion = un agregado — no modificar multiples agregados en la misma transaccion 4. Consistencia eventual entre agregados — usar eventos de dominio

// --- MAL: Agregado gigante ---
DEFINE Pedido
    cliente: Cliente              // Objeto completo de otro agregado
    lineas: List<LineaPedido>
    factura: Factura              // Otro agregado embebido
    envio: Envio                  // Otro agregado embebido

// --- BIEN: Referencias por ID ---
DEFINE Pedido
    clienteId: ClienteId          // Solo el ID
    lineas: List<LineaPedido>     // Entidades internas del agregado
    // Factura y Envio son agregados separados que referencian PedidoId
Servicios de Dominio: Logica de negocio que involucra multiples agregados.

// Logica que no pertenece a ningun agregado individual
DEFINE ServicioTransferencia   // Domain Service
    FUNCTION transferir(cuentaOrigenId: CuentaId, cuentaDestinoId: CuentaId, monto: Dinero)
        // Esta logica involucra DOS agregados — no cabe en ninguno solo
        cuentaOrigen = cuentaRepo.obtenerPorId(cuentaOrigenId)
        cuentaDestino = cuentaRepo.obtenerPorId(cuentaDestinoId)

        cuentaOrigen.debitar(monto)
        cuentaDestino.acreditar(monto)

        cuentaRepo.guardar(cuentaOrigen)
        cuentaRepo.guardar(cuentaDestino)
Eventos de Dominio: Comunicacion desacoplada entre agregados/modulos.

DEFINE PedidoConfirmadoEvent   // Evento de dominio
    pedidoId: PedidoId
    montoTotal: Dinero
    fechaConfirmacion: DateTime

// Modulo de Inventario escucha el evento
DEFINE ReservarStockHandler
    FUNCTION handle(evento: PedidoConfirmadoEvent)
        pedido = pedidoRepo.obtenerPorId(evento.pedidoId)
        FOR EACH linea IN pedido.obtenerLineas()
            inventario.reservar(linea.productoId, linea.cantidad)

// Modulo de Facturacion escucha el mismo evento
DEFINE GenerarFacturaHandler
    FUNCTION handle(evento: PedidoConfirmadoEvent)
        facturacion.generar(evento.pedidoId, evento.montoTotal)
Decisiones Arquitectonicas Clave
Decision 1: Endpoints livianos o Controladores?
Recomendacion: - Endpoints livianos (funcionales): Para proyectos pequenos/medianos con Vertical Slice - Controladores (orientados a objetos): Para proyectos empresariales grandes con Clean Architecture - Hibrido: Endpoints livianos en modulos simples, Controladores en modulos complejos

// --- Endpoint liviano (funcional) ---
ROUTE POST "/api/productos"
FUNCTION crearProducto(request, mediator)
    resultado = mediator.send(request)
    RETURN Response.ok(resultado)
END FUNCTION

// --- Controlador (orientado a objetos) ---
DEFINE ProductosController
    DEPENDS ON servicio: IProductoServicio

    ROUTE POST "/api/v1/productos"
    FUNCTION crear(dto: CrearProductoDto) -> Response<ProductoDto>
        resultado = servicio.crear(dto)
        RETURN Response.created(resultado)
    END FUNCTION
Decision 2: CQRS (Command Query Responsibility Segregation)?
Recomendacion: SI, con patron Mediador, especialmente en Vertical Slice y Modular Monolith.

CQRS + Mediador permite: - Separacion clara entre operaciones de escritura (Commands) y lectura (Queries) - Pipeline behaviors para cross-cutting concerns (validacion, logging, transacciones) - Handlers con responsabilidad unica

// --- Commands (escritura) ---
DEFINE CrearProductoCommand
    nombre: String
    precio: Decimal

DEFINE CrearProductoCommandHandler
    DEPENDS ON database

    FUNCTION handle(command: CrearProductoCommand) -> ApiResponse<Integer>
        producto = NEW Producto(command.nombre, command.precio)
        database.productos.add(producto)
        database.saveChanges()
        RETURN ApiResponse.success(producto.id)
    END FUNCTION

// --- Queries (lectura) ---
DEFINE ObtenerProductoPorIdQuery
    id: Integer

DEFINE ObtenerProductoPorIdQueryHandler
    DEPENDS ON database

    FUNCTION handle(query: ObtenerProductoPorIdQuery) -> ApiResponse<ProductoDto>
        producto = database.productos
            .noTracking()
            .findById(query.id)
        RETURN ApiResponse.success(ProductoDto.from(producto))
    END FUNCTION

// --- Pipeline Behavior para validacion automatica ---
DEFINE ValidationBehavior<TRequest, TResponse>
    DEPENDS ON validators: List<Validator<TRequest>>

    FUNCTION handle(request: TRequest, next: Function) -> TResponse
        errors = []
        FOR EACH validator IN validators
            result = validator.validate(request)
            errors.addAll(result.errors)
        END FOR

        IF errors.isNotEmpty()
            THROW ValidationException(errors)
        END IF

        RETURN next()
    END FUNCTION
Decision 3: Patron Repository o acceso directo a datos?
Recomendacion: Depende del contexto.

Acceso directo (recomendado para simplicidad): - En aplicaciones simples con Vertical Slice - Cuando NO necesitas cambiar de motor de persistencia - Para consultas de solo lectura

Patron Repository (recomendado para abstraccion): - En Clean Architecture estricta - Cuando necesitas testabilidad extrema (mockear repositorios) - En Modular Monolith (para encapsular acceso a datos del modulo) - Cuando aplicas DDD con agregados complejos

// --- Acceso directo (simple) ---
DEFINE ObtenerProductosHandler
    DEPENDS ON database

    FUNCTION handle(query) -> List<ProductoDto>
        RETURN database.productos
            .noTracking()
            .map(p -> NEW ProductoDto(p.id, p.nombre, p.precio))
            .toList()
    END FUNCTION

// --- Patron Repository (abstraccion) ---
DEFINE INTERFACE IProductoRepositorio
    FUNCTION obtenerPorId(id: Integer) -> Producto?
    FUNCTION obtenerTodos() -> List<Producto>
    FUNCTION crear(producto: Producto) -> Integer
END INTERFACE

DEFINE ProductoRepositorio IMPLEMENTS IProductoRepositorio
    DEPENDS ON database

    FUNCTION crear(producto: Producto) -> Integer
        database.productos.add(producto)
        database.saveChanges()
        RETURN producto.id
    END FUNCTION
Decision 4: Comunicacion entre modulos en Modular Monolith?
Recomendacion: Eventos de dominio con patron Mediador o Bus de mensajes In-Memory.

Opcion 1: Notificaciones del Mediador (In-Process)

// Definicion del evento de dominio
DEFINE ProductoCreadoEvent
    productoId: Integer
    nombre: String
    precio: Decimal

// Handler que publica el evento
DEFINE CrearProductoHandler
    DEPENDS ON mediator, database

    FUNCTION handle(command: CrearProductoCommand) -> Integer
        producto = NEW Producto(command.nombre, command.precio)
        database.productos.add(producto)
        database.saveChanges()

        // Publicar evento de dominio
        mediator.publish(NEW ProductoCreadoEvent(producto.id, producto.nombre, producto.precio))

        RETURN producto.id
    END FUNCTION

// Otro modulo escucha el evento
DEFINE ProductoCreadoEventHandler  // En modulo de Pedidos
    DEPENDS ON logger

    FUNCTION handle(event: ProductoCreadoEvent)
        logger.info("Producto {id} creado: {nombre}", event.productoId, event.nombre)
        // Logica adicional en el modulo de Pedidos
    END FUNCTION
Opcion 2: Bus de mensajes In-Memory (preparado para microservicios)

// Configuracion del bus
messageBus.configure(
    transport = IN_MEMORY,        // Cambiable a RabbitMQ, Kafka, etc.
    consumers = [
        CatalogoModule.consumers,
        PedidosModule.consumers
    ]
)

// Handler que publica al bus
DEFINE CrearProductoHandler
    DEPENDS ON messageBus, database

    FUNCTION handle(command) -> Integer
        producto = NEW Producto(command.nombre)
        database.productos.add(producto)
        database.saveChanges()

        // Publicar evento al bus
        messageBus.publish(NEW ProductoCreadoEvent(producto.id))

        RETURN producto.id
    END FUNCTION

// Consumer en otro modulo
DEFINE ProductoCreadoConsumer  // En modulo de Pedidos
    FUNCTION consume(event: ProductoCreadoEvent)
        // Procesar evento en el modulo de Pedidos
    END FUNCTION
Ventaja del Bus: Si migras a microservicios, solo cambias IN_MEMORY por RABBITMQ o KAFKA.

Antipatrones Comunes (Que NO Hacer)
Antipatrones en Clean Architecture
1. Modelo de Dominio Anemico
Problema: Entidades sin logica de negocio, solo getters/setters. El dominio se convierte en un contenedor de datos sin comportamiento.

// --- MAL: Modelo anemico ---
DEFINE Pedido
    id: Integer           // Solo datos
    total: Decimal
    estado: String
    fecha: DateTime

// La logica esta en el servicio, no en el dominio
DEFINE PedidoServicio
    FUNCTION aprobarPedido(pedido: Pedido)
        IF pedido.total < 0
            THROW Exception("Total invalido")
        END IF
        pedido.estado = "Aprobado"
    END FUNCTION

// --- BIEN: Modelo rico con comportamiento ---
DEFINE Pedido
    id: Integer (readonly)
    total: Decimal (readonly)
    estado: EstadoPedido (readonly)
    fecha: DateTime (readonly)

    CONSTRUCTOR(lineas: List<LineaPedido>)
        IF lineas IS EMPTY
            THROW DomainException("Un pedido debe tener al menos una linea")
        END IF
        total = lineas.sum(l -> l.subtotal)
        estado = EstadoPedido.PENDIENTE
        fecha = DateTime.now()
    END CONSTRUCTOR

    FUNCTION aprobar()
        IF estado != EstadoPedido.PENDIENTE
            THROW DomainException("Solo se pueden aprobar pedidos pendientes")
        END IF
        IF total <= 0
            THROW DomainException("No se puede aprobar un pedido con total invalido")
        END IF
        estado = EstadoPedido.APROBADO
    END FUNCTION

    FUNCTION cancelar(motivo: String)
        IF estado == EstadoPedido.ENTREGADO
            THROW DomainException("No se puede cancelar un pedido ya entregado")
        END IF
        estado = EstadoPedido.CANCELADO
    END FUNCTION
Por que es malo: Viola el principio de orientacion a objetos. La logica de negocio debe estar en el dominio, no dispersa en servicios.

2. Abstracciones con Fugas (Leaky Abstractions)
Problema: Exponer detalles de implementacion de infraestructura en capas superiores.

// --- MAL: Interfaz expone detalles de implementacion ---
DEFINE INTERFACE IProductoRepositorio
    FUNCTION obtenerProductos() -> DatabaseResultSet  // Expone tipo de BD
    FUNCTION query() -> QueryBuilder                  // Expone implementacion
END INTERFACE

// --- BIEN: Interfaz agnostica de la implementacion ---
DEFINE INTERFACE IProductoRepositorio
    FUNCTION obtenerTodos() -> List<Producto>
    FUNCTION obtenerPorId(id: Integer) -> Producto?
    FUNCTION buscarPorCriterio(spec: ProductoSpecification) -> List<Producto>
END INTERFACE
Por que es malo: Si cambias de motor de persistencia, tienes que cambiar las interfaces en Domain, rompiendo la independencia de infraestructura.

3. Servicios Dios (God Services)
Problema: Servicios con demasiadas responsabilidades que hacen de todo.

// --- MAL: Servicio con 30+ metodos ---
DEFINE UsuarioServicio
    crearUsuario()
    actualizarUsuario()
    eliminarUsuario()
    autenticarUsuario()
    generarToken()
    validarToken()
    cambiarPassword()
    recuperarPassword()
    enviarEmailBienvenida()
    enviarEmailRecuperacion()
    asignarRol()
    removerRol()
    obtenerPermisos()
    // ... 20 metodos mas

// --- BIEN: Dividir en servicios con responsabilidad unica ---
DEFINE UsuarioRegistroServicio
    registrar(dto: RegistroDto) -> Usuario
    enviarEmailBienvenida(usuarioId: Integer)

DEFINE UsuarioAutenticacionServicio
    autenticar(dto: LoginDto) -> TokenDto
    refrescarToken(refreshToken: String) -> TokenDto
    validarToken(token: String) -> Boolean

DEFINE UsuarioPasswordServicio
    cambiarPassword(usuarioId: Integer, dto: CambiarPasswordDto)
    iniciarRecuperacion(email: String)
    completarRecuperacion(dto: RecuperacionDto)

DEFINE UsuarioRolServicio
    asignarRol(usuarioId: Integer, rolId: Integer)
    removerRol(usuarioId: Integer, rolId: Integer)
    obtenerRoles(usuarioId: Integer) -> List<RolDto>
Por que es malo: Dificulta el testing, viola Single Responsibility Principle, crea acoplamiento excesivo.

4. Violacion de Inversion de Dependencias
Problema: Capas de Aplicacion o Dominio dependen de Infraestructura directamente.

// --- MAL: Aplicacion depende de implementacion concreta ---
MODULE MiApp.Application.Services
    IMPORT MiApp.Infrastructure.Persistence   // Referencia directa a Infraestructura

    DEFINE ProductoServicio
        DEPENDS ON repo: ProductoRepositorio   // Implementacion concreta, no interfaz

// --- BIEN: Dependencia de abstraccion definida en Dominio ---
MODULE MiApp.Domain.Repositories
    DEFINE INTERFACE IProductoRepositorio
        obtenerPorId(id: Integer) -> Producto?

MODULE MiApp.Application.Services
    IMPORT MiApp.Domain.Repositories           // Depende de interfaz en Dominio

    DEFINE ProductoServicio
        DEPENDS ON repo: IProductoRepositorio  // Interfaz

MODULE MiApp.Infrastructure.Persistence
    IMPORT MiApp.Domain.Repositories           // Implementa interfaz de Dominio

    DEFINE ProductoRepositorio IMPLEMENTS IProductoRepositorio
        // Implementacion con motor de persistencia
Por que es malo: Rompe Clean Architecture. Dominio/Aplicacion NO deben conocer Infraestructura.

5. Infraestructura en el Dominio
Problema: Usar atributos o librerias de infraestructura en entidades de dominio.

// --- MAL: Entidad de dominio con anotaciones de persistencia ---
DEFINE Producto
    @Table("Productos")                 // Anotacion de persistencia
    @PrimaryKey                         // Anotacion de persistencia
    id: Integer
    @Required @MaxLength(200)           // Anotacion de validacion de framework
    nombre: String

// --- BIEN: Entidad pura, configuracion en Infraestructura ---
DEFINE Producto   // En capa de Dominio
    id: Integer (readonly)
    nombre: String (readonly)

    CONSTRUCTOR(nombre: String)
        IF nombre IS EMPTY
            THROW DomainException("Nombre requerido")
        END IF
        IF nombre.length > 200
            THROW DomainException("Nombre muy largo")
        END IF
        this.nombre = nombre
    END CONSTRUCTOR

// Configuracion de persistencia (en capa de Infraestructura)
DEFINE ProductoMapping
    table = "Productos"
    primaryKey = "id"
    property("nombre").required().maxLength(200)
Por que es malo: El dominio debe ser agnostico de persistencia. Si cambias de motor de datos, no deberias tocar el dominio.

Antipatrones en Vertical Slice Architecture
1. Duplicacion Excesiva Sin Abstraer
Problema: Copiar-pegar codigo identico entre features sin crear abstracciones comunes.

// --- MAL: Validacion identica en 10 handlers ---
DEFINE CrearProductoHandler
    FUNCTION handle(request)
        IF request.nombre IS EMPTY
            THROW ValidationException("Nombre requerido")    // Duplicado
        IF request.precio <= 0
            THROW ValidationException("Precio invalido")     // Duplicado
        // ... logica

DEFINE ActualizarProductoHandler
    FUNCTION handle(request)
        IF request.nombre IS EMPTY
            THROW ValidationException("Nombre requerido")    // MISMA validacion
        IF request.precio <= 0
            THROW ValidationException("Precio invalido")     // MISMA validacion
        // ... logica

// --- BIEN: Usar Pipeline Behaviors (cross-cutting) ---
DEFINE ValidationBehavior<TRequest, TResponse>
    DEPENDS ON validators: List<Validator<TRequest>>

    FUNCTION handle(request, next)
        errors = validators.flatMap(v -> v.validate(request).errors)
        IF errors.isNotEmpty()
            THROW ValidationException(errors)
        RETURN next()

// Validadores especificos por feature
DEFINE CrearProductoValidator
    RULES
        "nombre" -> notEmpty().maxLength(200)
        "precio" -> greaterThan(0)

DEFINE ActualizarProductoValidator
    RULES
        "nombre" -> notEmpty().maxLength(200)
        "precio" -> greaterThan(0)
Por que es malo: DRY (Don't Repeat Yourself) sigue siendo valido. Pipeline behaviors son perfectos para cross-cutting concerns.

2. Features Acopladas
Problema: Una feature llama directamente a otra feature, creando dependencias ocultas.

// --- MAL: CrearPedidoHandler instancia CrearFacturaHandler directamente ---
DEFINE CrearPedidoHandler
    DEPENDS ON database, facturaHandler: CrearFacturaHandler   // Acoplamiento directo

    FUNCTION handle(request)
        pedido = NEW Pedido(...)
        database.pedidos.add(pedido)
        database.saveChanges()

        // Llamada directa a otra feature
        facturaHandler.handle(NEW CrearFacturaCommand(pedidoId = pedido.id))
        RETURN pedido.id

// --- BIEN: Usar eventos de dominio ---
DEFINE CrearPedidoHandler
    DEPENDS ON database, mediator

    FUNCTION handle(request)
        pedido = NEW Pedido(...)
        database.pedidos.add(pedido)
        database.saveChanges()

        // Publicar evento (desacoplado)
        mediator.publish(NEW PedidoCreadoEvent(pedido.id))
        RETURN pedido.id

// Handler independiente que escucha el evento
DEFINE PedidoCreadoEventHandler
    DEPENDS ON mediator

    FUNCTION handle(event: PedidoCreadoEvent)
        mediator.send(NEW CrearFacturaCommand(pedidoId = event.pedidoId))
Por que es malo: Crea dependencias ocultas entre features. Si eliminas una feature, rompes otra.

3. Falta de Convenciones Consistentes
Problema: Cada feature tiene estructura diferente, dificultando la navegacion y mantenimiento.

// --- MAL: Sin convenciones ---
Features/
+-- CrearProducto/
|   +-- Endpoint           // Nombre generico
|   +-- Dto                // Sin sufijo especifico
|   +-- Logic              // Nombre ambiguo
+-- UpdateProduct/          // Ingles (inconsistente)
|   +-- UpdateHandler
|   +-- UpdateRequest
+-- BorrarProducto/         // Espanol (inconsistente)
    +-- TodoEnUnArchivo     // Sin separacion

// --- BIEN: Convencion consistente ---
Features/
+-- CrearProducto/
|   +-- CrearProductoCommand       // Convencion: {Feature}Command
|   +-- CrearProductoHandler       // Convencion: {Feature}Handler
|   +-- CrearProductoValidator     // Convencion: {Feature}Validator
|   +-- CrearProductoEndpoint      // Convencion: {Feature}Endpoint
+-- ActualizarProducto/            // Idioma consistente
|   +-- ActualizarProductoCommand
|   +-- ActualizarProductoHandler
|   +-- ActualizarProductoValidator
|   +-- ActualizarProductoEndpoint
+-- EliminarProducto/              // Idioma consistente
    +-- EliminarProductoCommand
    +-- EliminarProductoHandler
    +-- EliminarProductoEndpoint
Por que es malo: Sin convenciones, cada desarrollador hace las cosas de manera diferente, dificultando la colaboracion.

4. Handlers con Logica de Negocio Compleja
Problema: Meter toda la logica de negocio compleja directamente en el handler.

// --- MAL: Handler con 200 lineas de logica de negocio ---
DEFINE CrearPedidoHandler
    FUNCTION handle(request)
        // 50 lineas de validacion compleja
        IF request.lineas.any(l -> l.cantidad <= 0) THEN ...
        IF request.lineas.sum(l -> l.subtotal) != request.total THEN ...

        // 30 lineas de calculos complejos
        descuento = calcularDescuento(request)
        impuestos = calcularImpuestos(request)
        envio = calcularEnvio(request)

        // 40 lineas de reglas de negocio
        IF cliente.esVIP AND pedido.total > 1000 THEN ...
        // 80 lineas mas...

// --- BIEN: Extraer logica a entidades o servicios de dominio ---
DEFINE CrearPedidoHandler
    DEPENDS ON database, factory: IPedidoFactory, calculadora: ICalculadoraPrecios

    FUNCTION handle(request)
        cliente = database.clientes.find(request.clienteId)

        // Factory encapsula logica de creacion
        pedido = factory.crear(request.lineas, cliente)

        // Calculadora encapsula reglas de negocio
        pedido.aplicarDescuentos(calculadora.calcularDescuentos(pedido, cliente))
        pedido.calcularTotal()

        database.pedidos.add(pedido)
        database.saveChanges()
        RETURN pedido.id
Por que es malo: Handlers deben ser delgados, coordinando operaciones. La logica compleja va en dominio o servicios de dominio.

Antipatrones en Modular Monolith
1. Modulos Acoplados por Base de Datos
Problema: Acceso directo a tablas de otros modulos.

// --- MAL: Pedidos hace queries directos a tabla de Catalogo ---
DEFINE CrearPedidoHandler
    DEPENDS ON pedidosDb, catalogoDb    // Acceso directo a otro modulo

    FUNCTION handle(request)
        // Query directo a tabla de otro modulo
        producto = catalogoDb.productos.find(request.productoId)

// --- BIEN: Comunicacion a traves de contrato publico ---
DEFINE INTERFACE ICatalogoModulo   // En Catalogo.Contracts
    obtenerProductoPorId(productoId: Integer) -> ProductoDto?

DEFINE CrearPedidoHandler
    DEPENDS ON pedidosDb, catalogoModulo: ICatalogoModulo   // Interfaz publica

    FUNCTION handle(request)
        producto = catalogoModulo.obtenerProductoPorId(request.productoId)
Por que es malo: Rompe la autonomia de modulos. Si cambias el esquema de un modulo, puedes romper otros.

2. Base de Datos Compartida Sin Fronteras
Problema: Un solo contexto de datos con todas las entidades de todos los modulos.

// --- MAL: Un solo contexto gigante ---
DEFINE ApplicationDatabase
    productos       // Catalogo
    categorias      // Catalogo
    pedidos         // Pedidos
    lineasPedido    // Pedidos
    facturas        // Facturacion
    pagos           // Facturacion
    // ... 50 entidades mas de todos los modulos

// --- BIEN: Contexto de datos por modulo ---
DEFINE CatalogoDatabase
    productos
    categorias
    // Solo entidades del modulo de Catalogo

DEFINE PedidosDatabase
    pedidos
    lineasPedido
    // Solo entidades del modulo de Pedidos

DEFINE FacturacionDatabase
    facturas
    pagos
    // Solo entidades del modulo de Facturacion
Por que es malo: No hay fronteras claras. Cualquier modulo puede acceder a datos de cualquier otro.

3. Eventos Sincronos Bloqueantes
Problema: Esperar respuesta de eventos de dominio, bloqueando el flujo.

// --- MAL: Esperar que otro modulo procese el evento ---
DEFINE CrearProductoHandler
    FUNCTION handle(request)
        producto = NEW Producto(request.nombre)
        database.productos.add(producto)
        database.saveChanges()

        // Espera a que TODOS los handlers terminen
        mediator.publish(NEW ProductoCreadoEvent(producto.id))
        // Si un handler falla o es lento, TODO falla/bloquea

        RETURN producto.id

// --- BIEN: Fire-and-forget con Outbox Pattern ---
DEFINE CrearProductoHandler
    FUNCTION handle(request)
        producto = NEW Producto(request.nombre)
        database.productos.add(producto)

        // Guardar evento en tabla Outbox (transaccion atomica)
        outboxMessage = NEW OutboxMessage
            eventType = "ProductoCreadoEvent"
            payload = serialize(NEW ProductoCreadoEvent(producto.id))
            createdAt = DateTime.now()
        database.outboxMessages.add(outboxMessage)

        database.saveChanges()   // Ambos en misma transaccion
        RETURN producto.id

// Worker en background procesa Outbox de manera asincrona
DEFINE OutboxProcessor (background)
    FUNCTION execute()
        LOOP
            messages = database.outboxMessages.where(NOT processed)
            FOR EACH message IN messages
                messageBus.publish(deserialize(message.payload))
                message.processed = TRUE
            END FOR
            database.saveChanges()
            WAIT 1 second
        END LOOP
Por que es malo: Crea acoplamiento temporal. Si otro modulo esta caido o lento, afecta al modulo que publica.

4. Compartir Entidades de Dominio Entre Modulos
Problema: Multiples modulos referenciando la misma clase de entidad.

// --- MAL: Entidad compartida entre modulos ---
DEFINE Producto   // Shared, usada por Catalogo, Pedidos, Inventario
    id: Integer
    nombre: String
    precio: Decimal
    stock: Integer
    categoriaId: Integer
    // ... 20 propiedades usadas por diferentes modulos

// --- BIEN: Cada modulo tiene su propia representacion ---
MODULE Catalogo.Domain
    DEFINE Producto
        id, nombre, precio, categoriaId
        // Solo propiedades relevantes para Catalogo

MODULE Pedidos.Domain
    DEFINE ProductoPedido    // Nombre diferente, concepto diferente
        productoId: Integer
        nombreAlMomentoDeCompra: String
        precioAlMomentoDeCompra: Decimal
        // Snapshot del producto al momento de crear el pedido

MODULE Inventario.Domain
    DEFINE ItemInventario
        productoId: Integer
        stock: Integer
        stockMinimo: Integer
        // Solo propiedades relevantes para Inventario
Por que es malo: Crea acoplamiento de dominio. Cambios en un modulo requieren cambios en todos los demas.

5. Referencias Directas a Implementaciones de Otros Modulos
Problema: Modulos referenciando las capas internas de otros modulos.

// --- MAL: Pedidos referencia la Infraestructura de Catalogo ---
MODULE Pedidos.Application
    IMPORT Catalogo.Infrastructure.Repositories    // Acceso directo

    DEFINE CrearPedidoHandler
        DEPENDS ON productoRepo: ProductoRepositorio   // Implementacion concreta

// --- BIEN: Pedidos solo referencia los Contratos de Catalogo ---
MODULE Pedidos.Application
    IMPORT Catalogo.Contracts                          // Solo interfaz publica

    DEFINE CrearPedidoHandler
        DEPENDS ON catalogoModulo: ICatalogoModulo     // Interfaz
Por que es malo: Crea dependencias fuertes entre modulos. Rompe la inversion de dependencias a nivel de modulos.

Principios SOLID (Recordatorio)
S - Single Responsibility Principle (SRP)
Una clase debe tener una unica razon para cambiar.

// --- MAL: Clase con multiples responsabilidades ---
DEFINE ReporteServicio
    FUNCTION generarReporte(datos) -> Reporte
        // Logica de generacion
    FUNCTION formatearPdf(reporte) -> Bytes
        // Logica de formateo
    FUNCTION enviarPorEmail(reporte, destinatario)
        // Logica de envio

// --- BIEN: Una responsabilidad por clase ---
DEFINE GeneradorReporte
    FUNCTION generar(datos) -> Reporte

DEFINE FormateadorPdf
    FUNCTION formatear(reporte) -> Bytes

DEFINE NotificadorReporte
    FUNCTION enviar(reporte, destinatario)
O - Open/Closed Principle (OCP)
Las entidades deben estar abiertas para extension, cerradas para modificacion.

// --- MAL: Modificar la clase cada vez que se agrega un tipo ---
DEFINE CalculadorDescuento
    FUNCTION calcular(cliente)
        IF cliente.tipo == "VIP"
            RETURN 0.20
        ELSE IF cliente.tipo == "Mayorista"
            RETURN 0.15
        ELSE IF cliente.tipo == "Nuevo"     // Cada tipo nuevo = modificar esta clase
            RETURN 0.05

// --- BIEN: Extension sin modificar la clase base ---
DEFINE INTERFACE IEstrategiaDescuento
    FUNCTION calcular(cliente) -> Decimal

DEFINE DescuentoVip IMPLEMENTS IEstrategiaDescuento
    FUNCTION calcular(cliente) -> Decimal
        RETURN 0.20

DEFINE DescuentoMayorista IMPLEMENTS IEstrategiaDescuento
    FUNCTION calcular(cliente) -> Decimal
        RETURN 0.15

DEFINE CalculadorDescuento
    DEPENDS ON estrategias: Map<TipoCliente, IEstrategiaDescuento>

    FUNCTION calcular(cliente) -> Decimal
        estrategia = estrategias.get(cliente.tipo)
        RETURN estrategia.calcular(cliente)
L - Liskov Substitution Principle (LSP)
Los objetos de una clase derivada deben poder sustituir a los de la clase base sin alterar el comportamiento.

// --- MAL: Subclase que rompe el contrato de la clase base ---
DEFINE Rectangulo
    ancho: Decimal
    alto: Decimal

    FUNCTION setAncho(valor)
        ancho = valor
    FUNCTION setAlto(valor)
        alto = valor
    FUNCTION area() -> Decimal
        RETURN ancho * alto

DEFINE Cuadrado EXTENDS Rectangulo
    FUNCTION setAncho(valor)
        ancho = valor
        alto = valor        // Efecto colateral inesperado
    FUNCTION setAlto(valor)
        ancho = valor
        alto = valor        // Viola el contrato de Rectangulo

// --- BIEN: Jerarquia correcta ---
DEFINE INTERFACE IFigura
    FUNCTION area() -> Decimal

DEFINE Rectangulo IMPLEMENTS IFigura
    CONSTRUCTOR(ancho, alto)
    FUNCTION area() -> Decimal
        RETURN ancho * alto

DEFINE Cuadrado IMPLEMENTS IFigura
    CONSTRUCTOR(lado)
    FUNCTION area() -> Decimal
        RETURN lado * lado
I - Interface Segregation Principle (ISP)
Ninguna clase deberia depender de metodos que no usa. Preferir interfaces pequenas y especificas.

// --- MAL: Interfaz monolitica ---
DEFINE INTERFACE IRepositorio<T>
    crear(entity: T) -> Integer
    actualizar(entity: T)
    eliminar(id: Integer)
    obtenerPorId(id: Integer) -> T
    obtenerTodos() -> List<T>
    buscarPorFiltro(filtro) -> List<T>
    contarPorFiltro(filtro) -> Integer
    existePorId(id: Integer) -> Boolean

// Una clase de solo lectura se ve forzada a implementar crear/actualizar/eliminar

// --- BIEN: Interfaces segregadas ---
DEFINE INTERFACE ILector<T>
    obtenerPorId(id: Integer) -> T
    obtenerTodos() -> List<T>

DEFINE INTERFACE IEscritor<T>
    crear(entity: T) -> Integer
    actualizar(entity: T)
    eliminar(id: Integer)

DEFINE INTERFACE IBuscador<T>
    buscarPorFiltro(filtro) -> List<T>
    contarPorFiltro(filtro) -> Integer
D - Dependency Inversion Principle (DIP)
Depender de abstracciones, no de implementaciones concretas. Las capas superiores definen interfaces, las inferiores las implementan.

// --- MAL: Dependencia directa de implementacion ---
DEFINE PedidoServicio
    DEPENDS ON repo: PostgresProductoRepositorio   // Implementacion concreta

// --- BIEN: Dependencia de abstraccion ---
DEFINE PedidoServicio
    DEPENDS ON repo: IProductoRepositorio          // Interfaz

// La implementacion se inyecta en tiempo de ejecucion
container.register(IProductoRepositorio, PostgresProductoRepositorio)
Principios de Programacion Orientada a Objetos (POO)
Encapsulamiento
Ocultar el estado interno y exponer solo operaciones validas. Los objetos protegen su invariante.

// --- MAL: Estado expuesto sin proteccion ---
DEFINE CuentaBancaria
    saldo: Decimal          // Publico, cualquiera puede modificarlo
    transacciones: List     // Publico, se puede manipular externamente

cuenta.saldo = -5000        // Estado invalido permitido

// --- BIEN: Estado protegido con operaciones controladas ---
DEFINE CuentaBancaria
    PRIVATE saldo: Decimal
    PRIVATE transacciones: List<Transaccion>

    FUNCTION depositar(monto: Decimal)
        IF monto <= 0
            THROW DomainException("Monto debe ser positivo")
        saldo = saldo + monto
        transacciones.add(NEW Transaccion("DEPOSITO", monto))

    FUNCTION retirar(monto: Decimal)
        IF monto <= 0
            THROW DomainException("Monto debe ser positivo")
        IF monto > saldo
            THROW DomainException("Fondos insuficientes")
        saldo = saldo - monto
        transacciones.add(NEW Transaccion("RETIRO", monto))

    FUNCTION obtenerSaldo() -> Decimal
        RETURN saldo    // Solo lectura
Composicion sobre Herencia
Preferir composicion de comportamientos sobre jerarquias de herencia profundas. La herencia crea acoplamiento rigido; la composicion permite flexibilidad.

// --- MAL: Herencia profunda y rigida ---
DEFINE Animal
DEFINE Mamifero EXTENDS Animal
DEFINE MamiferoAcuatico EXTENDS Mamifero
DEFINE MamiferoVolador EXTENDS Mamifero
// Problema: Que pasa con un murcielago que vuela Y es mamifero?
// Que pasa con un ornitorrinco que nada, pone huevos Y es mamifero?

// --- BIEN: Composicion de comportamientos ---
DEFINE INTERFACE IPuedeNadar
    nadar()

DEFINE INTERFACE IPuedeVolar
    volar()

DEFINE INTERFACE IPuedeCaminar
    caminar()

DEFINE ComportamientoNado IMPLEMENTS IPuedeNadar
    FUNCTION nadar()
        // Logica de nado

DEFINE Murcielago
    DEPENDS ON vuelo: IPuedeVolar, caminata: IPuedeCaminar

DEFINE Pato
    DEPENDS ON vuelo: IPuedeVolar, nado: IPuedeNadar, caminata: IPuedeCaminar
Regla practica: Si te encuentras creando jerarquias de mas de 2 niveles, es una senal para usar composicion.

Polimorfismo
Objetos de diferentes tipos responden al mismo mensaje de forma diferente.

// --- Polimorfismo con interfaces ---
DEFINE INTERFACE INotificador
    FUNCTION enviar(destinatario: String, mensaje: String)

DEFINE NotificadorEmail IMPLEMENTS INotificador
    FUNCTION enviar(destinatario, mensaje)
        emailClient.send(destinatario, mensaje)

DEFINE NotificadorSms IMPLEMENTS INotificador
    FUNCTION enviar(destinatario, mensaje)
        smsGateway.send(destinatario, mensaje)

DEFINE NotificadorPush IMPLEMENTS INotificador
    FUNCTION enviar(destinatario, mensaje)
        pushService.send(destinatario, mensaje)

// Uso polimorfico — el cliente no sabe (ni le importa) la implementacion
DEFINE ServicioAlertas
    DEPENDS ON notificadores: List<INotificador>

    FUNCTION alertar(destinatario, mensaje)
        FOR EACH notificador IN notificadores
            notificador.enviar(destinatario, mensaje)
Inmutabilidad
Preferir objetos inmutables cuando sea posible. Reducen bugs, simplifican concurrencia y facilitan el razonamiento.

// --- MAL: Objeto mutable ---
DEFINE Direccion
    calle: String
    ciudad: String
    codigoPostal: String

direccion.ciudad = "Madrid"   // Mutacion puede causar efectos colaterales

// --- BIEN: Value Object inmutable ---
DEFINE Direccion (IMMUTABLE)
    calle: String (readonly)
    ciudad: String (readonly)
    codigoPostal: String (readonly)

    CONSTRUCTOR(calle, ciudad, codigoPostal)
        // Validaciones
        this.calle = calle
        this.ciudad = ciudad
        this.codigoPostal = codigoPostal

    FUNCTION conCiudad(nuevaCiudad: String) -> Direccion
        RETURN NEW Direccion(this.calle, nuevaCiudad, this.codigoPostal)
Seguridad en el Desarrollo (OWASP Top 10 - 2025)
A01 - Control de Acceso Roto (Broken Access Control)
Riesgo: Usuarios acceden a recursos o acciones no autorizadas.

// --- MAL: Sin verificacion de pertenencia ---
DEFINE ObtenerPedidoEndpoint
    ROUTE GET "/api/pedidos/{id}"
    FUNCTION invoke(pedidoId, usuarioActual)
        pedido = database.pedidos.find(pedidoId)
        RETURN pedido   // Cualquier usuario ve cualquier pedido

// --- BIEN: Verificar que el recurso pertenece al usuario ---
DEFINE ObtenerPedidoEndpoint
    ROUTE GET "/api/pedidos/{id}"
    FUNCTION invoke(pedidoId, usuarioActual)
        pedido = database.pedidos.find(pedidoId)
        IF pedido IS NULL
            RETURN Response.notFound()
        IF pedido.usuarioId != usuarioActual.id AND NOT usuarioActual.esAdmin()
            RETURN Response.forbidden()
        RETURN Response.ok(pedido)
Controles: - Denegar por defecto — el acceso debe ser explicitamente concedido - Verificar pertenencia del recurso (no solo autenticacion, sino autorizacion) - Tokens de acceso con minimos privilegios - Rate limiting en endpoints sensibles

A02 - Configuracion de Seguridad Incorrecta (Security Misconfiguration)
// --- MAL: Configuracion por defecto insegura ---
DEFINE AppConfig
    debugMode = TRUE                // Expone informacion interna
    corsAllowOrigin = "*"           // Permite cualquier origen
    defaultAdminPassword = "admin"  // Credencial por defecto

// --- BIEN: Configuracion segura por defecto ---
DEFINE AppConfig
    debugMode = env.get("DEBUG", FALSE)           // Desactivado por defecto
    corsAllowOrigin = env.get("CORS_ORIGINS")     // Origenes explicitos
    // Sin credenciales por defecto — forzar configuracion manual

    FUNCTION validar()
        IF debugMode AND env.isProduction()
            THROW ConfigException("Debug no permitido en produccion")
        IF corsAllowOrigin == "*" AND env.isProduction()
            THROW ConfigException("CORS wildcard no permitido en produccion")
A03 - Fallos en la Cadena de Suministro (Supply Chain Failures)
Controles: - Verificar integridad de dependencias (checksums, firmas) - Auditar dependencias periodicamente (herramientas de analisis de vulnerabilidades) - Fijar versiones de dependencias (no usar rangos abiertos en produccion) - Mantener un inventario de dependencias actualizado (SBOM)

A04 - Fallos Criptograficos (Cryptographic Failures)
// --- MAL: Almacenar datos sensibles sin proteccion ---
DEFINE UsuarioRepositorio
    FUNCTION crear(usuario)
        database.execute(
            "INSERT INTO usuarios (email, password, tarjeta_credito) VALUES (?, ?, ?)",
            usuario.email,
            usuario.password,            // Password en texto plano
            usuario.tarjetaCredito       // Datos sensibles sin cifrar
        )

// --- BIEN: Proteger datos sensibles ---
DEFINE UsuarioRepositorio
    DEPENDS ON hasher: IPasswordHasher, cipher: ICipher

    FUNCTION crear(usuario)
        passwordHash = hasher.hash(usuario.password)     // Hash con salt (bcrypt/argon2)
        tarjetaCifrada = cipher.encrypt(usuario.tarjeta)  // Cifrado AES-256

        database.execute(
            "INSERT INTO usuarios (email, password_hash, tarjeta_cifrada) VALUES (?, ?, ?)",
            usuario.email,
            passwordHash,
            tarjetaCifrada
        )
Controles: - Passwords: hash con bcrypt, scrypt o argon2 (NUNCA MD5, SHA-1) - Datos en transito: TLS 1.2+ obligatorio - Datos en reposo: cifrado AES-256 para datos sensibles - No almacenar datos sensibles innecesarios

A05 - Inyeccion (Injection)
// --- MAL: Concatenacion de consultas (SQL Injection) ---
DEFINE BuscarUsuario
    FUNCTION buscar(nombre)
        query = "SELECT * FROM usuarios WHERE nombre = '" + nombre + "'"
        RETURN database.execute(query)
        // Input: ' OR '1'='1  -> Devuelve todos los usuarios

// --- BIEN: Consultas parametrizadas ---
DEFINE BuscarUsuario
    FUNCTION buscar(nombre)
        RETURN database.execute(
            "SELECT * FROM usuarios WHERE nombre = ?",
            nombre    // Parametro separado — nunca se interpreta como SQL
        )

// --- MAL: Inyeccion de comandos ---
DEFINE GenerarReporte
    FUNCTION generar(nombreArchivo)
        shell.execute("convert " + nombreArchivo + " output.pdf")
        // Input: "; rm -rf /"  -> Desastre

// --- BIEN: Sanitizar y usar APIs seguras ---
DEFINE GenerarReporte
    FUNCTION generar(nombreArchivo)
        IF NOT matches(nombreArchivo, PATTERN_ALFANUMERICO)
            THROW ValidationException("Nombre de archivo invalido")
        converter.toPdf(nombreArchivo, "output.pdf")   // API segura, sin shell
Tipos de inyeccion: SQL, NoSQL, OS Command, LDAP, XSS (Cross-Site Scripting), Template Injection.

A06 - Diseno Inseguro (Insecure Design)
// --- MAL: Sin limite de intentos ---
DEFINE LoginEndpoint
    FUNCTION login(email, password)
        usuario = buscarPorEmail(email)
        IF usuario AND verificarPassword(password, usuario.passwordHash)
            RETURN generarToken(usuario)
        RETURN Response.unauthorized()
        // Sin limite — permite fuerza bruta infinita

// --- BIEN: Diseno seguro desde el inicio ---
DEFINE LoginEndpoint
    DEPENDS ON rateLimiter, auditLog

    FUNCTION login(email, password, ipAddress)
        // Rate limiting por IP y por cuenta
        IF rateLimiter.excedeLimite(ipAddress, maxIntentos = 5, ventana = 15.minutos)
            auditLog.registrar("LOGIN_BLOQUEADO", email, ipAddress)
            RETURN Response.tooManyRequests("Demasiados intentos. Intente en 15 minutos")

        usuario = buscarPorEmail(email)
        IF usuario AND verificarPassword(password, usuario.passwordHash)
            rateLimiter.reiniciar(ipAddress)
            auditLog.registrar("LOGIN_EXITOSO", email, ipAddress)
            RETURN generarToken(usuario)

        auditLog.registrar("LOGIN_FALLIDO", email, ipAddress)
        RETURN Response.unauthorized("Credenciales invalidas")
        // Mensaje generico — no revelar si el email existe
A07 - Fallos de Autenticacion (Authentication Failures)
Controles: - Autenticacion multi-factor (MFA) para operaciones sensibles - Tokens con expiracion corta (access token: 15-30 min, refresh token: 7-30 dias) - Invalidar sesiones en cambio de password - No exponer tokens en URLs (usar headers Authorization) - Rotacion de secretos y claves

A08 - Fallos de Integridad de Software y Datos
Controles: - Verificar firmas digitales de dependencias y actualizaciones - Proteger pipelines CI/CD con permisos minimos - Validar integridad de datos deserializados (no deserializar datos no confiables sin validacion)

A09 - Fallos en Logging y Monitoreo
// --- MAL: Sin logging de eventos de seguridad ---
DEFINE TransferenciaServicio
    FUNCTION transferir(origen, destino, monto)
        // Ejecuta la transferencia sin dejar rastro
        cuentaOrigen.retirar(monto)
        cuentaDestino.depositar(monto)

// --- BIEN: Logging de eventos criticos ---
DEFINE TransferenciaServicio
    DEPENDS ON logger, auditLog

    FUNCTION transferir(origen, destino, monto, usuarioActual)
        auditLog.registrar(
            evento = "TRANSFERENCIA_INICIADA",
            usuario = usuarioActual.id,
            datos = { origen, destino, monto },
            timestamp = DateTime.now()
        )

        TRY
            cuentaOrigen.retirar(monto)
            cuentaDestino.depositar(monto)
            auditLog.registrar("TRANSFERENCIA_COMPLETADA", ...)
        CATCH exception
            auditLog.registrar("TRANSFERENCIA_FALLIDA", ..., error = exception.message)
            THROW exception
Que loguear: Logins exitosos/fallidos, cambios de permisos, operaciones financieras, acceso a datos sensibles, errores de autorizacion.

Que NO loguear: Passwords, tokens, numeros de tarjeta, datos personales sensibles.

A10 - Manejo Incorrecto de Excepciones
// --- MAL: Exponer informacion interna en errores ---
DEFINE ProductoEndpoint
    FUNCTION obtener(id)
        TRY
            RETURN database.productos.find(id)
        CATCH exception
            RETURN Response.error(500, exception.stackTrace)  // Expone internos

// --- BIEN: Errores genericos para el cliente, detallados internamente ---
DEFINE ProductoEndpoint
    DEPENDS ON logger

    FUNCTION obtener(id)
        TRY
            RETURN database.productos.find(id)
        CATCH exception
            errorId = generateUuid()
            logger.error("Error {errorId}: {exception}")     // Detalle interno
            RETURN Response.error(500, ProblemDetails(
                title = "Error interno",
                detail = "Referencia: " + errorId,            // Solo el ID para soporte
                status = 500
            ))
Concurrencia y Paralelismo
Thread Safety (Seguridad en Hilos)
// --- MAL: Estado compartido mutable sin proteccion ---
DEFINE Contador
    valor: Integer = 0

    FUNCTION incrementar()
        valor = valor + 1     // Race condition: dos hilos leen el mismo valor

// --- BIEN: Proteccion del estado compartido ---

// Opcion 1: Mutex/Lock
DEFINE Contador
    PRIVATE valor: Integer = 0
    PRIVATE lock: Mutex

    FUNCTION incrementar()
        lock.acquire()
        TRY
            valor = valor + 1
        FINALLY
            lock.release()

// Opcion 2: Operaciones atomicas (preferido para contadores simples)
DEFINE Contador
    PRIVATE valor: AtomicInteger = 0

    FUNCTION incrementar()
        valor.incrementAndGet()    // Operacion atomica, sin lock

// Opcion 3: Inmutabilidad (eliminar el problema de raiz)
DEFINE Contador (IMMUTABLE)
    valor: Integer (readonly)

    FUNCTION incrementar() -> Contador
        RETURN NEW Contador(valor + 1)   // Nuevo objeto, sin mutacion
Prevencion de Deadlocks
// --- MAL: Orden de locks inconsistente ---
// Hilo 1:
lock(recursoA)
lock(recursoB)    // Espera recursoB...

// Hilo 2:
lock(recursoB)
lock(recursoA)    // Espera recursoA... DEADLOCK!

// --- BIEN: Orden de locks consistente (siempre el mismo orden) ---
// Hilo 1:
lock(recursoA)    // Siempre primero A
lock(recursoB)    // Luego B

// Hilo 2:
lock(recursoA)    // Siempre primero A (mismo orden)
lock(recursoB)    // Luego B

// --- MEJOR: Timeout en locks ---
FUNCTION transferir(cuentaOrigen, cuentaDestino, monto)
    // Ordenar locks por ID para garantizar orden consistente
    primero = min(cuentaOrigen.id, cuentaDestino.id)
    segundo = max(cuentaOrigen.id, cuentaDestino.id)

    IF NOT lock.tryAcquire(primero, timeout = 5.segundos)
        THROW TimeoutException("No se pudo adquirir lock")
    TRY
        IF NOT lock.tryAcquire(segundo, timeout = 5.segundos)
            THROW TimeoutException("No se pudo adquirir lock")
        TRY
            ejecutarTransferencia(cuentaOrigen, cuentaDestino, monto)
        FINALLY
            lock.release(segundo)
    FINALLY
        lock.release(primero)
Patron Productor-Consumidor
DEFINE ColaMensajes
    PRIVATE cola: BlockingQueue<Mensaje>(capacidad = 100)

    // Productor: agrega mensajes
    FUNCTION publicar(mensaje: Mensaje)
        cola.put(mensaje)    // Bloquea si la cola esta llena

    // Consumidor: procesa mensajes
    FUNCTION procesar()
        LOOP
            mensaje = cola.take()    // Bloquea si la cola esta vacia
            procesarMensaje(mensaje)
Patron Actor (Alternativa a Locks)
// Cada actor tiene su propio estado y solo se comunica via mensajes
DEFINE CuentaActor
    PRIVATE saldo: Decimal

    FUNCTION recibirMensaje(mensaje)
        MATCH mensaje
            CASE Depositar(monto):
                saldo = saldo + monto
                responder(SaldoActualizado(saldo))
            CASE Retirar(monto):
                IF monto > saldo
                    responder(FondosInsuficientes())
                ELSE
                    saldo = saldo - monto
                    responder(SaldoActualizado(saldo))
            CASE ConsultarSaldo:
                responder(SaldoActual(saldo))

// Los actores nunca comparten estado — sin locks, sin race conditions
cuentaActor.enviar(Depositar(1000))
cuentaActor.enviar(Retirar(500))
Convenciones de Base de Datos
Nomenclatura de Tablas y Columnas
REGLAS GENERALES:
- Usar snake_case para todo (tablas, columnas, indices, restricciones)
- Tablas en SINGULAR (usuario, pedido, producto — NO usuarios, pedidos)
- Columnas descriptivas con contexto (fecha_creacion, NOT creado)
- Evitar abreviaturas ambiguas (cantidad, NOT cant; descripcion, NOT desc)
- Booleanos con prefijo: es_activo, tiene_descuento, puede_editar

NOMBRES DE TABLAS:
  usuario                    (NO: Usuarios, tbl_usuarios, User)
  pedido
  linea_pedido               (tabla de relacion: entidad1_entidad2)
  producto_categoria         (tabla de union M:N)

COLUMNAS:
  id                         (PK: siempre "id", simple)
  usuario_id                 (FK: tabla_referenciada + _id)
  nombre
  email
  fecha_creacion             (timestamps: fecha_ o momento_)
  fecha_actualizacion
  es_activo                  (booleanos: es_, tiene_, puede_)
  monto_total                (montos: monto_, precio_, costo_)
  codigo_postal              (codigos: codigo_)
Nomenclatura de Restricciones e Indices
PRIMARY KEY:
  pk_usuario                 (pk_ + tabla)

FOREIGN KEY:
  fk_pedido_usuario          (fk_ + tabla_origen + _ + tabla_destino)

UNIQUE:
  uq_usuario_email           (uq_ + tabla + _ + columna)

INDEX:
  idx_pedido_fecha_creacion  (idx_ + tabla + _ + columna(s))
  idx_producto_nombre_precio (indice compuesto)

CHECK:
  ck_pedido_monto_positivo   (ck_ + tabla + _ + descripcion)

DEFAULT:
  df_usuario_es_activo       (df_ + tabla + _ + columna)
Buenas Practicas de Esquema
// --- Tabla bien disenada ---
CREATE TABLE pedido (
    id              SERIAL PRIMARY KEY,              -- PK autoincrementable
    usuario_id      INTEGER NOT NULL,                -- FK explicita
    estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    monto_total     DECIMAL(18,2) NOT NULL,          -- Precision monetaria
    moneda          CHAR(3) NOT NULL DEFAULT 'EUR',  -- ISO 4217
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP,
    es_eliminado    BOOLEAN NOT NULL DEFAULT FALSE,  -- Soft delete

    CONSTRAINT pk_pedido PRIMARY KEY (id),
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    CONSTRAINT ck_pedido_monto_positivo CHECK (monto_total >= 0)
)

CREATE INDEX idx_pedido_usuario_id ON pedido(usuario_id)
CREATE INDEX idx_pedido_fecha_creacion ON pedido(fecha_creacion)
CREATE INDEX idx_pedido_estado ON pedido(estado) WHERE es_eliminado = FALSE
Reglas adicionales: - Siempre definir precision en DECIMAL para montos (18,2 minimo) - Usar TIMESTAMP WITH TIME ZONE para fechas - Soft delete (es_eliminado) sobre DELETE fisico para datos criticos - Indices en columnas usadas en WHERE, JOIN y ORDER BY - No indexar columnas de baja cardinalidad (ej: booleanos solos) - Migraciones versionadas y reversibles

Diseno de APIs REST
Convenciones de Endpoints
RECURSOS (sustantivos, plural):
  GET    /api/v1/productos              (listar)
  GET    /api/v1/productos/{id}         (obtener uno)
  POST   /api/v1/productos              (crear)
  PUT    /api/v1/productos/{id}         (reemplazar completo)
  PATCH  /api/v1/productos/{id}         (actualizar parcial)
  DELETE /api/v1/productos/{id}         (eliminar)

RELACIONES (anidadas max 2 niveles):
  GET    /api/v1/pedidos/{id}/lineas    (lineas de un pedido)
  POST   /api/v1/pedidos/{id}/lineas    (agregar linea a pedido)

ACCIONES (verbos solo cuando no es CRUD):
  POST   /api/v1/pedidos/{id}/aprobar   (accion de negocio)
  POST   /api/v1/pedidos/{id}/cancelar

MAL:
  GET    /api/v1/obtenerProductos       (verbo en recurso)
  POST   /api/v1/productos/crear        (redundante)
  GET    /api/v1/pedidos/{id}/lineas/{lineaId}/producto/{productoId}/variantes  (demasiado anidado)
Versionado
OPCIONES (de mas a menos recomendado):
1. URL Path:     /api/v1/productos       (mas visible, mas facil)
2. Header:       Accept: application/vnd.miapi.v1+json
3. Query Param:  /api/productos?version=1 (menos recomendado)
Paginacion
// Request
GET /api/v1/productos?page=2&pageSize=20&sortBy=nombre&sortDir=asc

// Response
{
    "data": [...],
    "pagination": {
        "currentPage": 2,
        "pageSize": 20,
        "totalItems": 150,
        "totalPages": 8,
        "hasNext": true,
        "hasPrevious": true
    }
}
Respuestas Estandarizadas
// Exito
{
    "success": true,
    "data": { "id": 1, "nombre": "Producto A" },
    "message": null
}

// Error (RFC 7807 - Problem Details)
{
    "type": "https://api.ejemplo.com/errores/validacion",
    "title": "Error de validacion",
    "status": 422,
    "detail": "Uno o mas campos son invalidos",
    "errors": {
        "nombre": ["El nombre es requerido"],
        "precio": ["El precio debe ser mayor que 0"]
    },
    "traceId": "abc-123-def-456"
}
Codigos HTTP Correctos
EXITO:
  200 OK              (GET exitoso, PUT/PATCH exitoso)
  201 Created         (POST exitoso — incluir Location header)
  204 No Content      (DELETE exitoso)

ERROR CLIENTE:
  400 Bad Request     (Request malformado, parametros invalidos)
  401 Unauthorized    (No autenticado)
  403 Forbidden       (Autenticado pero sin permiso)
  404 Not Found       (Recurso no existe)
  409 Conflict        (Conflicto de estado, ej: duplicado)
  422 Unprocessable   (Validacion de negocio fallida)
  429 Too Many Req    (Rate limiting)

ERROR SERVIDOR:
  500 Internal Error  (Error no esperado)
  502 Bad Gateway     (Servicio externo fallo)
  503 Unavailable     (Servicio temporalmente caido)
Idempotencia
// PUT y DELETE son idempotentes por naturaleza.
// POST NO es idempotente — usar Idempotency-Key para hacerlo seguro.

// Request con clave de idempotencia
POST /api/v1/pagos
Headers:
    Idempotency-Key: "uuid-unico-por-operacion"

// Servidor:
DEFINE PagoEndpoint
    DEPENDS ON cache

    FUNCTION crear(request, idempotencyKey)
        // Verificar si ya se proceso esta operacion
        resultadoPrevio = cache.get(idempotencyKey)
        IF resultadoPrevio IS NOT NULL
            RETURN resultadoPrevio                  // Devolver resultado anterior

        resultado = procesarPago(request)
        cache.set(idempotencyKey, resultado, ttl = 24.horas)
        RETURN resultado
Paginacion Avanzada: Cursor vs Offset
// === OFFSET (clasico) — bueno para datasets pequenos/estaticos ===
// GET /api/v1/productos?page=2&pageSize=20
// SQL: SELECT * FROM producto ORDER BY id LIMIT 20 OFFSET 20
// Problema: En pagina 500, la BD debe leer y descartar 10,000 filas

// === CURSOR (moderno) — 17x mas rapido en datasets grandes ===
// GET /api/v1/productos?cursor=eyJpZCI6MTAwfQ&pageSize=20
// SQL: SELECT * FROM producto WHERE id > 100 ORDER BY id LIMIT 20
// La BD salta directamente al cursor — rendimiento constante

// Request con cursor
GET /api/v1/productos?pageSize=20&cursor=eyJpZCI6MTAwfQ

// Response con cursor
{
    "data": [...],
    "pagination": {
        "pageSize": 20,
        "nextCursor": "eyJpZCI6MTIwfQ",    // Cursor codificado (base64)
        "previousCursor": "eyJpZCI6MTAxfQ",
        "hasNext": true,
        "hasPrevious": true
    }
}

// Implementacion
DEFINE CursorPaginacion
    FUNCTION paginar(query, cursor, pageSize)
        IF cursor IS NOT NULL
            decoded = base64Decode(cursor)     // { "id": 100 }
            query = query.WHERE(id > decoded.id)

        resultados = query.ORDER_BY(id).LIMIT(pageSize + 1)  // +1 para saber si hay mas

        hasNext = resultados.size() > pageSize
        IF hasNext
            resultados = resultados.take(pageSize)   // Quitar el extra

        nextCursor = hasNext ? base64Encode({ id: resultados.last().id }) : NULL
        RETURN PaginatedResult(resultados, nextCursor, hasNext)
Cuando usar cada uno: - Offset: Dashboards con "Ir a pagina X", datasets < 10,000 registros, datos estaticos - Cursor: Feeds infinitos, datasets grandes, datos que cambian frecuentemente, APIs publicas

Filtrado y Ordenamiento
// Convenciones de query params
GET /api/v1/productos?
    categoria=electronica&               // Filtro exacto
    precioMin=100&precioMax=500&         // Filtro de rango
    nombre=*laptop*&                     // Busqueda parcial
    sortBy=precio&sortDir=desc&          // Ordenamiento
    fields=id,nombre,precio              // Seleccion de campos (sparse fieldsets)

// Implementacion segura (evitar SQL injection en sortBy)
DEFINE ProductoFiltro
    PRIVATE CAMPOS_PERMITIDOS = ["nombre", "precio", "fecha_creacion", "categoria"]

    FUNCTION aplicarOrdenamiento(query, sortBy, sortDir)
        IF sortBy NOT IN CAMPOS_PERMITIDOS
            THROW ValidationException("Campo de ordenamiento no permitido: " + sortBy)
        IF sortDir NOT IN ["asc", "desc"]
            sortDir = "asc"    // Default seguro
        RETURN query.ORDER_BY(sortBy, sortDir)
HATEOAS (Hypermedia as the Engine of Application State)
El cliente descubre acciones disponibles a traves de links en la respuesta — no necesita conocer las URLs de antemano.

// Response con hypermedia links
GET /api/v1/pedidos/42

{
    "data": {
        "id": 42,
        "estado": "pendiente",
        "total": 250.00
    },
    "_links": {
        "self":     { "href": "/api/v1/pedidos/42", "method": "GET" },
        "aprobar":  { "href": "/api/v1/pedidos/42/aprobar", "method": "POST" },
        "cancelar": { "href": "/api/v1/pedidos/42/cancelar", "method": "POST" },
        "lineas":   { "href": "/api/v1/pedidos/42/lineas", "method": "GET" }
    }
}

// Si el pedido ya esta aprobado, los links cambian dinamicamente
GET /api/v1/pedidos/42   (estado: "aprobado")

{
    "data": {
        "id": 42,
        "estado": "aprobado",
        "total": 250.00
    },
    "_links": {
        "self":     { "href": "/api/v1/pedidos/42", "method": "GET" },
        "factura":  { "href": "/api/v1/pedidos/42/factura", "method": "GET" },
        // "aprobar" ya NO aparece — el cliente sabe que no puede aprobar
    }
}
Beneficio: El cliente no tiene logica hardcodeada sobre que acciones estan disponibles — la API se lo dice.

Seguridad de APIs
Autenticacion: OAuth2 + JWT
// Flujo OAuth2 con JWT
// 1. Cliente solicita token
POST /auth/token
Body: { "grant_type": "client_credentials", "client_id": "...", "client_secret": "..." }

// 2. Servidor responde con tokens
{
    "access_token": "eyJhbGci...",       // JWT — vida corta (15-30 min)
    "refresh_token": "dGhpcyBpcyB...",   // Opaco — vida larga (7-30 dias)
    "token_type": "Bearer",
    "expires_in": 900                     // Segundos
}

// 3. Cliente usa el token en cada request
GET /api/v1/productos
Headers:
    Authorization: Bearer eyJhbGci...

// --- Estructura de un JWT ---
// Header:  { "alg": "RS256", "typ": "JWT" }
// Payload: { "sub": "user123", "roles": ["admin"], "exp": 1700000000, "aud": "mi-api" }
// Signature: RSASHA256(base64(header) + "." + base64(payload), privateKey)

// --- Validacion de JWT en el servidor ---
DEFINE JwtMiddleware
    DEPENDS ON publicKey

    FUNCTION handle(request, next)
        token = request.headers.get("Authorization")?.removePrefix("Bearer ")
        IF token IS NULL
            RETURN Response.unauthorized("Token requerido")

        TRY
            claims = jwt.verify(token, publicKey)

            // Validaciones criticas
            IF claims.exp < DateTime.now()
                RETURN Response.unauthorized("Token expirado")
            IF claims.aud != "mi-api"
                RETURN Response.unauthorized("Audiencia invalida")

            request.usuario = claims
            RETURN next(request)
        CATCH InvalidTokenException
            RETURN Response.unauthorized("Token invalido")
CORS (Cross-Origin Resource Sharing)
// --- MAL: CORS permisivo ---
cors.configure(
    allowOrigins = ["*"],                    // Cualquier origen
    allowMethods = ["*"],                    // Cualquier metodo
    allowHeaders = ["*"]                     // Cualquier header
)

// --- BIEN: CORS restrictivo ---
cors.configure(
    allowOrigins = [
        "https://miapp.com",
        "https://admin.miapp.com"
    ],
    allowMethods = ["GET", "POST", "PUT", "DELETE"],
    allowHeaders = ["Authorization", "Content-Type", "X-Correlation-ID"],
    allowCredentials = TRUE,
    maxAge = 3600                            // Cache de preflight (1 hora)
)

// --- PRODUCCION: CORS por entorno ---
cors.configure(
    allowOrigins = env.get("CORS_ALLOWED_ORIGINS").split(","),  // Configurable
    // NUNCA hardcodear "*" en produccion
)
Rate Limiting
DEFINE RateLimiter
    // Algoritmo: Sliding Window
    CONFIG limitePorMinuto = 100
    CONFIG limitePorHora = 1000

    FUNCTION verificar(clienteId: String) -> Boolean
        requestsUltimoMinuto = cache.count(clienteId + ":min", ventana = 1.minuto)
        requestsUltimaHora = cache.count(clienteId + ":hora", ventana = 1.hora)

        IF requestsUltimoMinuto >= limitePorMinuto OR requestsUltimaHora >= limitePorHora
            RETURN FALSE
        cache.increment(clienteId + ":min")
        cache.increment(clienteId + ":hora")
        RETURN TRUE

// Headers de rate limiting en la respuesta
Response.headers:
    X-RateLimit-Limit: 100
    X-RateLimit-Remaining: 73
    X-RateLimit-Reset: 1700000060     // Timestamp UNIX
    Retry-After: 30                   // Si se excede el limite (429)
Headers de Seguridad
HEADERS OBLIGATORIOS EN PRODUCCION:
  Strict-Transport-Security: max-age=31536000; includeSubDomains  (HSTS)
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'
  X-XSS-Protection: 0                   (desactivar — CSP lo reemplaza)
  Cache-Control: no-store                (para respuestas con datos sensibles)
  Referrer-Policy: strict-origin-when-cross-origin
Clean Code y Convenciones de Nombres
Convencion por Defecto: PascalCase en Espanol
Decision: Por defecto, todo el codigo se escribe en espanol con PascalCase para variables, metodos, clases y propiedades. Esto facilita la comprension por equipos hispanohablantes y alinea el codigo con el lenguaje ubicuo del dominio (DDD).

+---------------------+------------------+-----------------------------+
| Elemento            | Convencion       | Ejemplo                     |
+---------------------+------------------+-----------------------------+
| Variables locales   | PascalCase       | PrecioTotal, FechaCreacion  |
| Parametros          | PascalCase       | NombreUsuario, MontoTotal   |
| Propiedades         | PascalCase       | Nombre, FechaNacimiento     |
| Metodos/Funciones   | PascalCase+verbo | CalcularTotal()             |
|                     |                  | ObtenerUsuarioPorId()       |
|                     |                  | ValidarPedido()             |
| Clases              | PascalCase+sust  | PedidoServicio              |
|                     |                  | UsuarioRepositorio          |
|                     |                  | CalculadoraPrecios          |
| Interfaces          | I + PascalCase   | IRepositorio, INotificador  |
|                     |                  | IPedidoServicio             |
| Constantes          | UPPER_SNAKE_CASE | MAX_INTENTOS_LOGIN          |
|                     |                  | TASA_IVA_ESTANDAR           |
|                     |                  | TIEMPO_EXPIRACION_TOKEN     |
| Enumeraciones       | PascalCase       | EstadoPedido, TipoUsuario   |
| Valores de enum     | PascalCase       | Pendiente, Aprobado, Activo |
| Booleanos           | Es/Tiene/Puede   | EsActivo, TieneDescuento    |
|                     |                  | PuedeEditar, DebeNotificar  |
| Colecciones         | Plural           | Productos, LineasPedido     |
|                     |                  | UsuariosActivos             |
| DTOs                | PascalCase+Dto   | PedidoDto, UsuarioDto       |
| Commands            | PascalCase+Cmd   | CrearPedidoCommand          |
| Queries             | PascalCase+Query | ObtenerPedidoPorIdQuery     |
| Eventos             | PascalCase+Event | PedidoCreadoEvent           |
| Excepciones         | PascalCase+Exc   | PedidoNoEncontradoException |
| Tests               | Metodo_Escenario | CalcularTotal_ClienteVip_*  |
+---------------------+------------------+-----------------------------+

EXCEPCIONES AL ESPANOL (mantener en ingles):
- Palabras tecnicas universales: Id, Dto, Query, Command, Event, Handler
- Sufijos de patron: Service, Repository, Factory, Controller, Endpoint
- Infraestructura: Database, Cache, Logger, Config
- O segun decision del equipo (documentar en ARQUITECTURA-PATRONES.md)
Variables y Funciones
// --- MAL: Nombres ambiguos o cripticos ---
D = 5                          // Que es "D"?
Tp = CalcTp(Lst)               // Que es "Tp"? Que es "Lst"?
Flag = true                    // Flag de que?
Temp = GetData()               // "Temp" para que? Y en ingles por que?
X = Users.Filter(U -> U.A)    // Que es "A"?

// --- BIEN: Nombres descriptivos en espanol ---
DiasHastaExpiracion = 5
PrecioTotal = CalcularPrecioTotal(ListaProductos)
EsUsuarioActivo = true
UsuariosPendientes = ObtenerUsuariosPendientes()
UsuariosActivos = Usuarios.Filter(U -> U.EsActivo)
Funciones
// --- MAL: Funcion que hace demasiado ---
FUNCTION ProcesarPedido(Pedido, EnviarEmail, ActualizarStock, GenerarFactura)
    // 200 lineas de logica mezclada

// --- BIEN: Funciones pequenas con responsabilidad unica ---
FUNCTION ValidarPedido(Pedido) -> ResultadoValidacion
FUNCTION CalcularTotalPedido(Pedido) -> Decimal
FUNCTION ReservarStock(Pedido)
FUNCTION GenerarFactura(Pedido) -> Factura
FUNCTION NotificarCliente(Pedido)

// Orquestacion limpia
FUNCTION ProcesarPedido(Pedido)
    Validacion = ValidarPedido(Pedido)
    IF NOT Validacion.EsValido
        THROW ValidationException(Validacion.Errores)
    CalcularTotalPedido(Pedido)
    ReservarStock(Pedido)
    GenerarFactura(Pedido)
    NotificarCliente(Pedido)
Nombres de Metodos por Tipo de Operacion
CONSULTA (obtener datos):
  ObtenerPorId(Id)                    ObtenerTodos()
  ObtenerPedidosPendientes()          BuscarPorFiltro(Filtro)
  ListarProductosPorCategoria(Id)     ContarPedidosPorEstado(Estado)

CREACION:
  Crear(Dto)                          Registrar(Dto)
  GenerarFactura(PedidoId)            Emitir(Poliza)

MODIFICACION:
  Actualizar(Id, Dto)                 Modificar(Id, Dto)
  CambiarEstado(Id, NuevoEstado)      AsignarResponsable(Id, UsuarioId)

ELIMINACION:
  Eliminar(Id)                        DesactivarUsuario(Id)
  AnularFactura(Id, Motivo)           MarcarComoEliminado(Id)

VALIDACION:
  Validar(Dto) -> Resultado           EsValido(Valor) -> Boolean
  ExistePorId(Id) -> Boolean          TienePermisos(UsuarioId, Recurso)

ACCIONES DE NEGOCIO:
  AprobarPedido(Id)                   RechazarSolicitud(Id, Motivo)
  TransferirFondos(Origen, Destino)   CancelarReserva(Id)
  ConfirmarEntrega(Id)                ProcesarPago(PagoDto)
Codigo Limpio - Reglas Generales
Funciones de max 20-30 lineas — si necesita mas, extraer subfunciones
Max 3 parametros por funcion — si necesita mas, crear un objeto Request/DTO
Un nivel de abstraccion por funcion — no mezclar logica de alto y bajo nivel
No usar numeros magicos — usar constantes con nombre
No comentar codigo muerto — eliminarlo (el control de versiones lo preserva)
Evitar negaciones dobles — EsValido en vez de NoEsInvalido
Nombres en espanol por defecto — alineados con el lenguaje ubicuo del dominio
PascalCase uniforme — variables, metodos, clases, propiedades
// --- MAL: Numero magico ---
IF Intentos > 3
    BloquearCuenta()

// --- BIEN: Constante con nombre ---
MAX_INTENTOS_LOGIN = 3
IF Intentos > MAX_INTENTOS_LOGIN
    BloquearCuenta()

// --- MAL: Mezcla de idiomas sin criterio ---
DEFINE PedidoService
    FUNCTION GetTotal(OrderId)       // Mezcla ingles/espanol
    FUNCTION fetchData(UserId)       // camelCase mezclado

// --- BIEN: Espanol consistente ---
DEFINE PedidoServicio
    FUNCTION ObtenerTotal(PedidoId)
    FUNCTION ObtenerDatos(UsuarioId)
Testing y Calidad
Piramide de Testing
         /  E2E  \                 ~10% — Pocos, lentos, costosos
        /----------\
       / Integracion \             ~20% — Interacciones entre componentes
      /----------------\
     /     Unitarios     \         ~70% — Muchos, rapidos, baratos
    /______________________\
Tests Unitarios
// Estructura AAA (Arrange-Act-Assert)
TEST "calcularTotal aplica descuento VIP correctamente"
    // Arrange (Preparar)
    cliente = NEW Cliente(tipo = "VIP")
    pedido = NEW Pedido(
        lineas = [
            NEW LineaPedido(precio = 100, cantidad = 2),
            NEW LineaPedido(precio = 50, cantidad = 1)
        ]
    )
    calculadora = NEW CalculadoraPrecios()

    // Act (Actuar)
    total = calculadora.calcularTotal(pedido, cliente)

    // Assert (Verificar)
    ASSERT total == 200.0    // 250 - 20% descuento VIP = 200

TEST "retirar de cuenta con fondos insuficientes lanza excepcion"
    // Arrange
    cuenta = NEW CuentaBancaria(saldoInicial = 100)

    // Act & Assert
    ASSERT_THROWS DomainException WHEN
        cuenta.retirar(500)

    ASSERT cuenta.obtenerSaldo() == 100    // Saldo no cambio
Tests de Integracion
// Verifican interaccion real entre componentes
TEST "CrearPedidoHandler persiste pedido en base de datos"
    // Arrange
    database = crearBaseDeDatosTemporal()
    handler = NEW CrearPedidoHandler(database)
    command = NEW CrearPedidoCommand(productoId = 1, cantidad = 5)

    // Act
    resultado = handler.handle(command)

    // Assert
    pedidoGuardado = database.pedidos.find(resultado.id)
    ASSERT pedidoGuardado IS NOT NULL
    ASSERT pedidoGuardado.cantidad == 5
    ASSERT pedidoGuardado.estado == "pendiente"
Buenas Practicas de Testing
Un assert logico por test — testear un comportamiento, no multiples
Tests independientes — ningun test debe depender de otro
Nombres descriptivos — "calcularDescuento_clienteVIP_retorna20Porciento" no "test1"
No testear implementacion — testear comportamiento y resultados
Tests deterministas — sin dependencias de hora, red o estado global
Usar fakes/mocks solo en unitarios — en integracion, usar componentes reales
Cobertura como guia, no como meta — 80% es buen objetivo, 100% no es practico
TDD cuando aporte valor — Red-Green-Refactor para logica de negocio compleja
// TDD: Red-Green-Refactor
// 1. RED: Escribir test que falla
TEST "aplicarDescuento no permite descuento mayor al 50%"
    ASSERT_THROWS WHEN calculadora.aplicarDescuento(producto, 0.60)

// 2. GREEN: Escribir codigo minimo para que pase
FUNCTION aplicarDescuento(producto, porcentaje)
    IF porcentaje > 0.50
        THROW DomainException("Descuento maximo es 50%")
    RETURN producto.precio * (1 - porcentaje)

// 3. REFACTOR: Mejorar sin romper tests
MAX_DESCUENTO = 0.50
FUNCTION aplicarDescuento(producto, porcentaje)
    IF porcentaje > MAX_DESCUENTO
        THROW DomainException("Descuento maximo es {MAX_DESCUENTO * 100}%")
    RETURN producto.precio * (1 - porcentaje)
Manejo de Errores y Resiliencia
Estrategia de Manejo de Excepciones
// Jerarquia de excepciones del dominio
DEFINE DomainException EXTENDS Exception
    // Base para errores de logica de negocio

DEFINE ValidationException EXTENDS DomainException
    errors: List<ValidationError>

DEFINE NotFoundException EXTENDS DomainException
    recurso: String
    id: Any

DEFINE ConflictException EXTENDS DomainException
    // Conflicto de estado (ej: recurso ya existe)

DEFINE UnauthorizedException EXTENDS DomainException
    // Falta de autorizacion de negocio

// Handler global de excepciones (capa de presentacion)
DEFINE GlobalExceptionHandler
    DEPENDS ON logger

    FUNCTION handle(exception) -> Response
        MATCH exception
            CASE ValidationException:
                RETURN Response(422, ProblemDetails(
                    title = "Error de validacion",
                    errors = exception.errors
                ))
            CASE NotFoundException:
                RETURN Response(404, ProblemDetails(
                    title = "Recurso no encontrado",
                    detail = "{exception.recurso} con ID {exception.id} no existe"
                ))
            CASE ConflictException:
                RETURN Response(409, ProblemDetails(title = "Conflicto"))
            CASE UnauthorizedException:
                RETURN Response(403, ProblemDetails(title = "No autorizado"))
            DEFAULT:
                errorId = generateUuid()
                logger.error("Error no manejado {errorId}: {exception}")
                RETURN Response(500, ProblemDetails(
                    title = "Error interno",
                    detail = "Referencia: " + errorId
                ))
Patron Circuit Breaker
Previene llamadas repetidas a un servicio que esta fallando.

DEFINE CircuitBreaker
    PRIVATE estado: Estado = CERRADO     // CERRADO, ABIERTO, SEMI_ABIERTO
    PRIVATE contadorFallos: Integer = 0
    PRIVATE ultimoFallo: DateTime
    CONFIG umbralFallos = 5
    CONFIG tiempoEspera = 30.segundos

    FUNCTION ejecutar(operacion: Function) -> Result
        IF estado == ABIERTO
            IF DateTime.now() - ultimoFallo > tiempoEspera
                estado = SEMI_ABIERTO    // Permitir un intento
            ELSE
                THROW CircuitOpenException("Servicio no disponible")

        TRY
            resultado = operacion()
            IF estado == SEMI_ABIERTO
                estado = CERRADO         // Servicio recuperado
                contadorFallos = 0
            RETURN resultado
        CATCH exception
            contadorFallos = contadorFallos + 1
            ultimoFallo = DateTime.now()
            IF contadorFallos >= umbralFallos
                estado = ABIERTO         // Abrir circuito
            THROW exception

// Uso
circuitBreaker = NEW CircuitBreaker()
TRY
    resultado = circuitBreaker.ejecutar(() -> servicioExterno.llamar())
CATCH CircuitOpenException
    resultado = obtenerDatosDeFallback()   // Respuesta alternativa
Patron Retry con Backoff Exponencial
DEFINE RetryPolicy
    CONFIG maxIntentos = 3
    CONFIG baseDelay = 1.segundo
    CONFIG maxDelay = 30.segundos

    FUNCTION ejecutar(operacion: Function) -> Result
        FOR intento = 1 TO maxIntentos
            TRY
                RETURN operacion()
            CATCH exception
                IF intento == maxIntentos
                    THROW exception    // Ultimo intento, propagar error

                // Backoff exponencial con jitter
                delay = min(baseDelay * 2^(intento - 1), maxDelay)
                jitter = random(0, delay * 0.1)   // 10% de variacion
                WAIT delay + jitter

                logger.warn("Intento {intento} fallido. Reintentando en {delay}s")

// Uso
retryPolicy = NEW RetryPolicy(maxIntentos = 3)
resultado = retryPolicy.ejecutar(() -> apiExterna.consultar(parametros))
Patron Bulkhead (Mampara)
Aisla recursos para que el fallo de un componente no afecte a otros.

DEFINE Bulkhead
    PRIVATE semaforo: Semaphore

    CONSTRUCTOR(maxConcurrencia: Integer)
        semaforo = NEW Semaphore(maxConcurrencia)

    FUNCTION ejecutar(operacion: Function) -> Result
        IF NOT semaforo.tryAcquire(timeout = 5.segundos)
            THROW BulkheadFullException("Demasiadas solicitudes concurrentes")
        TRY
            RETURN operacion()
        FINALLY
            semaforo.release()

// Aislar llamadas a servicios externos con limites independientes
bulkheadPagos = NEW Bulkhead(maxConcurrencia = 10)
bulkheadInventario = NEW Bulkhead(maxConcurrencia = 20)

// Si el servicio de pagos esta saturado, no afecta al de inventario
bulkheadPagos.ejecutar(() -> servicioPagos.procesar(pago))
bulkheadInventario.ejecutar(() -> servicioInventario.reservar(items))
Patron Timeout
DEFINE TimeoutPolicy
    CONFIG timeout: Duration

    FUNCTION ejecutar(operacion: Function) -> Result
        future = ejecutarAsync(operacion)
        TRY
            RETURN future.get(timeout)
        CATCH TimeoutException
            future.cancel()
            THROW ServiceTimeoutException("Operacion excedio {timeout}")

// Uso combinado: Timeout + Retry + Circuit Breaker
DEFINE ResiliencePolicy
    DEPENDS ON circuitBreaker, retryPolicy, timeoutPolicy

    FUNCTION ejecutar(operacion)
        RETURN circuitBreaker.ejecutar(() ->
            retryPolicy.ejecutar(() ->
                timeoutPolicy.ejecutar(operacion)
            )
        )
Logging y Observabilidad
Logging Estructurado
// --- MAL: Logging no estructurado ---
logger.info("Usuario " + userId + " creo pedido " + pedidoId + " por $" + total)
// Dificil de parsear, filtrar y analizar

// --- BIEN: Logging estructurado (key-value) ---
logger.info("Pedido creado", {
    usuarioId = userId,
    pedidoId = pedidoId,
    montoTotal = total,
    moneda = "EUR",
    correlationId = requestContext.correlationId
})
// Output: {"level":"INFO","message":"Pedido creado","usuarioId":42,"pedidoId":1001,"montoTotal":250.00,...}
Niveles de Log
TRACE  — Detalle extremo (solo desarrollo)
DEBUG  — Informacion de diagnostico (desarrollo, staging)
INFO   — Eventos de negocio normales (produccion)
WARN   — Situaciones anormales pero no criticas
ERROR  — Errores que requieren atencion
FATAL  — Error catastrofico, la aplicacion no puede continuar
Correlation ID (Trazabilidad)
// Cada request recibe un ID unico que se propaga por todo el sistema
DEFINE CorrelationIdMiddleware
    FUNCTION handle(request, next)
        correlationId = request.headers.get("X-Correlation-ID")
            OR generateUuid()

        requestContext.set("correlationId", correlationId)

        response = next(request)
        response.headers.set("X-Correlation-ID", correlationId)
        RETURN response

// Todos los logs incluyen el correlationId automaticamente
// Permite rastrear una operacion a traves de multiples servicios/modulos
Metricas Clave
METRICAS DE APLICACION:
  - request_duration_seconds       (latencia por endpoint)
  - request_total                  (contador de requests)
  - error_total                    (contador de errores por tipo)
  - active_connections             (conexiones activas)

METRICAS DE NEGOCIO:
  - pedidos_creados_total          (KPI de negocio)
  - pagos_procesados_total
  - tiempo_procesamiento_pedido

METRICAS DE INFRAESTRUCTURA:
  - cpu_usage_percent
  - memory_usage_bytes
  - db_connection_pool_active
  - db_query_duration_seconds
Ciclo de Vida del Desarrollo (SDLC)
Vision General del Proceso
+-------------+     +----------+     +----------+     +---------+     +----------+     +-----------+
|  DESCUBRIR  | --> |  DEFINIR | --> | DISENAR  | --> | CONSTRUIR| --> | VERIFICAR | --> | DESPLEGAR |
|             |     |          |     |          |     |          |     |           |     |           |
| Entender el |     | User     |     | Arquitec |     | Implemen |     | Testing   |     | Release   |
| problema    |     | Stories  |     | tura y   |     | tacion   |     | QA        |     | Monitoreo |
|             |     | Backlog  |     | Diseno   |     | Codigo   |     | Code Rev  |     | Feedback  |
+-------------+     +----------+     +----------+     +----------+     +-----------+     +-----------+
       |                                                                                       |
       +<<<<<<<<<<<<<<<<<<<< Feedback continuo / Iteraciones <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<+
Metodologia Agile / Scrum
Roles
PRODUCT OWNER:
  - Define la vision del producto
  - Prioriza el backlog
  - Acepta o rechaza incrementos
  - Representa al negocio/usuario

SCRUM MASTER:
  - Facilita las ceremonias
  - Remueve impedimentos
  - Protege al equipo de interrupciones
  - Promueve mejora continua

EQUIPO DE DESARROLLO:
  - Auto-organizado y cross-funcional
  - Estima y compromete trabajo
  - Disenha, construye y prueba
  - 3-9 personas (recomendado 5-7)
Ceremonias Scrum (Sprint de 2 semanas)
+-------------------+------------------+-----------+---------------------------+
| Ceremonia         | Duracion         | Frecuencia| Participantes             |
+-------------------+------------------+-----------+---------------------------+
| Sprint Planning   | 2-4 horas        | Inicio    | PO + SM + Equipo          |
| Daily Stand-up    | 15 min max       | Diario    | Equipo (+ SM)             |
| Refinamiento      | 1-2 horas        | 1-2x sem  | PO + Equipo               |
| Sprint Review     | 1-2 horas        | Fin       | PO + Equipo + Stakeholders|
| Retrospectiva     | 1-1.5 horas      | Fin       | SM + Equipo               |
+-------------------+------------------+-----------+---------------------------+

Regla: max 10% del sprint en ceremonias (~8h de 80h en sprint de 2 semanas)
Sprint Planning:

AGENDA:
1. PO presenta el Sprint Goal (objetivo de negocio del sprint)
2. Equipo revisa items del backlog (priorizados por PO)
3. Equipo estima y selecciona items que puede completar
4. Equipo descompone items en tareas tecnicas

OUTPUT:
- Sprint Goal (1 frase clara)
- Sprint Backlog (items comprometidos)
- Plan de tareas
Daily Stand-up (NO es un reporte de estado):

CADA PERSONA RESPONDE (max 2 min):
1. Que hice ayer que contribuye al Sprint Goal?
2. Que hare hoy para contribuir al Sprint Goal?
3. Tengo algun impedimento?

REGLAS:
- 15 minutos MAX — sin excepciones
- De pie (promueve brevedad)
- No resolver problemas — solo identificarlos
- Conversaciones detalladas DESPUES del standup
Refinamiento de Backlog:

ACTIVIDADES:
1. Clarificar requisitos (PO explica, equipo pregunta)
2. Descomponer items grandes en mas pequenos
3. Definir criterios de aceptacion
4. Estimar esfuerzo (story points)
5. Identificar dependencias y riesgos

REGLA DE ORO:
Un item esta "listo" para sprint planning cuando CUALQUIER
miembro del equipo puede leerlo y llegar al MISMO modelo mental.
Sprint Review (demo):

AGENDA:
1. Equipo demuestra el incremento funcionando
2. Stakeholders dan feedback directo
3. PO actualiza backlog segun feedback
4. Discusion sobre proximos pasos

NO ES: una presentacion de PowerPoint
SI ES: software funcionando con interaccion real
Sprint Retrospective:

FORMATO CLASICO:
  Que hicimos BIEN?       (seguir haciendo)
  Que hicimos MAL?        (dejar de hacer)
  Que podemos MEJORAR?    (experimentar)

OUTPUT:
  1-3 acciones concretas de mejora para el proximo sprint
  (no 10 acciones que nadie cumple — pocas y realizables)

OTROS FORMATOS:
  - Start/Stop/Continue
  - Mad/Sad/Glad
  - 4L's (Liked, Learned, Lacked, Longed for)
  - Sailboat (viento a favor, ancla, rocas, isla)
User Stories
Formato
COMO [tipo de usuario]
QUIERO [accion/funcionalidad]
PARA [beneficio/valor de negocio]

EJEMPLO:
  Como gerente de ventas
  Quiero ver un dashboard con las ventas del mes actual
  Para tomar decisiones de stock en tiempo real
Criterio INVEST
I — Independent   La historia no depende de otras para completarse
N — Negotiable    Los detalles se negocian entre PO y equipo
V — Valuable      Entrega valor al usuario o al negocio
E — Estimable     El equipo puede estimar el esfuerzo
S — Small         Completable en un sprint (idealmente 1-3 dias)
T — Testable      Se puede verificar con criterios claros de aceptacion
Criterios de Aceptacion (Given-When-Then)
FORMATO:
  DADO QUE [contexto/precondicion]
  CUANDO [accion del usuario]
  ENTONCES [resultado esperado]

EJEMPLO — Historia: "Como usuario quiero iniciar sesion"

  Criterio 1: Login exitoso
    DADO QUE el usuario tiene una cuenta activa
    CUANDO ingresa email y password correctos y presiona "Iniciar sesion"
    ENTONCES es redirigido al dashboard
    Y ve un mensaje "Bienvenido, [nombre]"

  Criterio 2: Login fallido
    DADO QUE el usuario ingresa credenciales incorrectas
    CUANDO presiona "Iniciar sesion"
    ENTONCES ve un mensaje "Credenciales invalidas"
    Y el campo de password se limpia
    Y NO se revela si el email existe o no

  Criterio 3: Cuenta bloqueada
    DADO QUE el usuario ha fallado 5 intentos de login en 15 minutos
    CUANDO intenta iniciar sesion nuevamente
    ENTONCES ve un mensaje "Cuenta bloqueada temporalmente. Intente en 15 minutos"
    Y se registra un evento de seguridad en el log

REGLAS:
- 3-7 criterios por historia (si necesita mas, la historia es muy grande)
- Cubrir happy path, errores y casos borde
- Ser especifico y verificable (no "funciona correctamente")
- NO describir implementacion (el "que", no el "como")
Definition of Ready (DoR) y Definition of Done (DoD)
DEFINITION OF READY (DoR) — Un item esta listo para entrar al sprint cuando:

  [ ] Tiene titulo y descripcion clara (formato User Story)
  [ ] Criterios de aceptacion definidos (Given-When-Then)
  [ ] Estimado por el equipo (story points)
  [ ] Es lo suficientemente pequeno para completar en un sprint
  [ ] Sin dependencias externas bloqueantes
  [ ] Mockups/wireframes disponibles (si aplica UI)
  [ ] API contracts definidos (si aplica integracion)
  [ ] Datos de prueba identificados

  SI NO CUMPLE DoR: NO entra al Sprint Planning
DEFINITION OF DONE (DoD) — Un item esta terminado cuando:

  CODIGO:
  [ ] Codigo implementado segun criterios de aceptacion
  [ ] Codigo revisado por al menos 1 peer (Code Review aprobado)
  [ ] Sin warnings del linter/compilador
  [ ] Sin deuda tecnica intencional no documentada

  TESTING:
  [ ] Tests unitarios escritos y pasando
  [ ] Tests de integracion escritos y pasando (si aplica)
  [ ] Cobertura de tests >= umbral del proyecto (80%+)
  [ ] Tests de regresion pasando

  SEGURIDAD:
  [ ] Sin vulnerabilidades criticas (SAST/DAST)
  [ ] Inputs validados
  [ ] Sin secretos en el codigo

  DOCUMENTACION:
  [ ] API documentada (si se creo/modifico un endpoint)
  [ ] README actualizado (si cambio la configuracion o setup)
  [ ] Migraciones de BD incluidas (si aplica)

  DESPLIEGUE:
  [ ] Pipeline CI pasa (build + tests + security scan)
  [ ] Desplegable en staging
  [ ] PO acepta el incremento (Sprint Review)

  SI NO CUMPLE DoD: NO se considera terminado y vuelve al backlog
Estimacion
Story Points (Fibonacci)
ESCALA:       1    2    3    5    8    13   21
              |    |    |    |    |    |    |
ESFUERZO:   Trivial  Pequeno  Medio  Grande  Muy Grande  Epica
              |    |    |    |    |    |    |
EJEMPLO:    Fix   CRUD  Feature Feature  Feature  NO cabe
            typo  simple con     con     compleja en 1
                        validac. integr.  + risk   sprint
                                externa

REGLAS:
- Story points miden ESFUERZO RELATIVO, no horas
- Usar Planning Poker para consenso del equipo
- Si un item es 13+, descomponer en items mas pequenos
- Un item de 21 es una epica — NUNCA entra a un sprint sin descomponer
- Calibrar con una historia de referencia (ej: "CRUD simple = 3 puntos")

VELOCIDAD:
- Velocidad = story points completados por sprint
- Usar promedio de ultimos 3-5 sprints para prediccion
- NO comparar velocidad entre equipos (las escalas son internas)
T-Shirt Sizing (alternativa para alto nivel)
XS  = 1-2 dias     (1 persona)
S   = 3-5 dias     (1 persona)
M   = 1-2 semanas  (1-2 personas)
L   = 2-4 semanas  (2-3 personas)
XL  = 1-2 meses    (equipo completo)
XXL = 3+ meses     (multiples equipos — requiere descomposicion)

USO: Estimacion rapida en roadmap, sin necesidad de detalle fino
Gestion de Deuda Tecnica
Cuadrante de Deuda Tecnica (Martin Fowler)
                    DELIBERADA                    INADVERTIDA
              (Sabemos que lo hacemos)      (No sabemos que lo hicimos)
         +----------------------------+----------------------------+
         |                            |                            |
PRUDENTE |  "No tenemos tiempo para   |  "Ahora sabemos como      |
         |   hacer la abstraccion,    |   deberiamos haberlo       |
         |   la haremos despues"      |   hecho"                   |
         |                            |                            |
         |  Accion: Registrar y       |  Accion: Refactorizar     |
         |  planificar pago           |  al descubrir              |
         |                            |                            |
         +----------------------------+----------------------------+
         |                            |                            |
TEMERARIA|  "No tenemos tiempo        |  "Que son las capas?"     |
         |   para disenar"            |                            |
         |                            |  (Falta de conocimiento)   |
         |  Accion: Priorizar pago    |                            |
         |  URGENTE — riesgo alto     |  Accion: Formacion +      |
         |                            |  refactorizacion profunda   |
         +----------------------------+----------------------------+
Gestion Practica
// --- Registro de deuda tecnica ---
DEFINE DeudaTecnica
    id: String
    titulo: String
    descripcion: String
    impacto: ALTO | MEDIO | BAJO         // En productividad o estabilidad
    esfuerzo: ALTO | MEDIO | BAJO        // Para resolver
    cuadrante: String                     // Prudente-Deliberada, etc.
    fechaCreacion: DateTime
    moduloAfectado: String

// --- Priorizacion: Impacto vs Esfuerzo ---
//
//  IMPACTO ALTO  |  Planificar    |  HACER PRIMERO
//                |  (Sprint +1)   |  (Este sprint)
//  --------------|----------------|------------------
//  IMPACTO BAJO  |  Ignorar       |  Quick wins
//                |  (aceptar)     |  (si hay tiempo)
//                |                |
//                  ESFUERZO ALTO    ESFUERZO BAJO

// --- Regla del 15-20% ---
// Reservar 15-20% de la capacidad de cada sprint para pagar deuda tecnica
// No acumular — la deuda tecnica crece con interes compuesto

EJEMPLO_SPRINT_BACKLOG:
  - Feature nueva:          60% de la capacidad (6 de 10 items)
  - Bugs:                   20% de la capacidad (2 de 10 items)
  - Deuda tecnica:          20% de la capacidad (2 de 10 items)
Gestion de Incidentes
Niveles de Severidad
+------+------------------+-------------------+-------------------+---------------------+
| SEV  | Impacto          | Ejemplo           | Tiempo Respuesta  | Tiempo Resolucion   |
+------+------------------+-------------------+-------------------+---------------------+
| SEV1 | Sistema caido    | App en produccion | < 15 minutos      | < 4 horas           |
|      | (critico)        | no responde       |                   |                     |
+------+------------------+-------------------+-------------------+---------------------+
| SEV2 | Funcionalidad    | Pagos no se       | < 30 minutos      | < 8 horas           |
|      | critica afectada | procesan          |                   |                     |
+------+------------------+-------------------+-------------------+---------------------+
| SEV3 | Funcionalidad    | Reportes con      | < 2 horas         | < 24 horas          |
|      | no critica       | datos incorrectos |                   |                     |
+------+------------------+-------------------+-------------------+---------------------+
| SEV4 | Menor / cosmetico| Typo en UI,       | < 24 horas        | Proximo sprint      |
|      |                  | color incorrecto  |                   |                     |
+------+------------------+-------------------+-------------------+---------------------+
Proceso de Respuesta a Incidentes
FASE 1 — DETECCION
  - Alerta de monitoreo (automatica)
  - Reporte de usuario
  - Deteccion manual
  -> Clasificar severidad
  -> Asignar Incident Commander (IC)

FASE 2 — RESPUESTA
  - IC coordina el equipo de respuesta
  - Comunicacion a stakeholders (cada 30 min en SEV1/2)
  - Prioridad: RESTAURAR servicio primero, investigar despues
  - Documentar timeline en tiempo real

FASE 3 — MITIGACION
  - Aplicar fix temporal si es necesario (rollback, feature flag off, etc.)
  - Verificar que el servicio esta restaurado
  - Comunicar resolucion a stakeholders

FASE 4 — POST-MORTEM (dentro de 48 horas)
  - Documento de post-mortem (ver template abajo)
  - Reunion blameless con todos los involucrados
  - Definir action items con responsables y fechas
Post-Mortem Blameless (Template)
# Post-Mortem: [Titulo del Incidente]
Fecha: [YYYY-MM-DD]
Severidad: [SEV1-4]
Duracion: [inicio - fin]
Incident Commander: [nombre]

## Resumen Ejecutivo
[1-2 parrafos describiendo que paso, impacto y resolucion]

## Timeline
- HH:MM — [Evento o accion]
- HH:MM — [Evento o accion]
- HH:MM — [Servicio restaurado]

## Causa Raiz
[Descripcion tecnica de la causa raiz — SIN culpar a personas]
"El sistema fallo porque..." NO "Juan hizo mal el deploy..."

## Impacto
- Usuarios afectados: [numero o porcentaje]
- Duracion del impacto: [minutos/horas]
- Perdida de datos: [si/no — detalle]
- Impacto financiero estimado: [si aplica]

## Que funciono bien
- [Alerta detecto el problema en X minutos]
- [Rollback fue rapido gracias a Blue/Green]
- [Comunicacion con stakeholders fue fluida]

## Que podemos mejorar
- [No habia alerta para este tipo de fallo]
- [El runbook estaba desactualizado]
- [El deploy no tenia canary]

## Action Items
| # | Accion                          | Responsable | Fecha limite | Prioridad |
|---|--------------------------------|-------------|-------------|-----------|
| 1 | Agregar alerta para X           | [nombre]    | [fecha]     | Alta      |
| 2 | Actualizar runbook de Y         | [nombre]    | [fecha]     | Media     |
| 3 | Implementar canary en pipeline  | [nombre]    | [fecha]     | Alta      |

## Lecciones Aprendidas
[Conclusiones clave que el equipo debe recordar]

REGLA FUNDAMENTAL:
  "Post-mortem blameless NO significa sin responsabilidad.
   Significa que buscamos CAUSAS SISTEMICAS, no culpables individuales.
   La pregunta no es 'quien la cago' sino 'que fallo en el sistema
   que permitio que esto pasara'."
Gestion de Configuracion
// --- Jerarquia de configuracion (de menor a mayor prioridad) ---
// 1. Defaults en codigo
// 2. Archivo de configuracion base
// 3. Archivo de configuracion por entorno
// 4. Variables de entorno
// 5. Argumentos de linea de comandos

DEFINE ConfigManager
    FUNCTION cargar(entorno: String) -> Config
        config = cargarDefaults()
        config.merge(cargarArchivo("config.base"))
        config.merge(cargarArchivo("config." + entorno))
        config.merge(cargarVariablesEntorno())
        config.merge(cargarArgumentos())
        config.validar()    // Fallar temprano si falta algo critico
        RETURN config

// --- NUNCA en el codigo fuente ---
// Passwords, API keys, connection strings, secretos
// Usar: variables de entorno, vault de secretos, key management service
Estrategia de Ramas (GitFlow + Entornos + Pull Requests)
Ramas y Entornos
RAMA                ENTORNO         DESPLIEGUE          PROPOSITO
─────────────────── ─────────────── ─────────────────── ──────────────────────
main                PRO (Produccion) Automatico (tag)   Codigo en produccion
release/*           UAT (Pre-prod)   Automatico (merge) Validacion de negocio
develop             DEV (Desarrollo) Automatico (merge) Integracion continua
feature/*           Local / CI       Solo CI pipeline   Desarrollo de features
hotfix/*            Local / CI       Solo CI pipeline   Correcciones urgentes
bugfix/*            Local / CI       Solo CI pipeline   Correcciones de bugs
Flujo Completo con Pull Requests
FEATURE (nueva funcionalidad):

  1. Crear rama desde develop
     git checkout develop
     git checkout -b feature/JIRA-123-crear-modulo-facturacion

  2. Desarrollar + commits (Semantic Commits — ver seccion abajo)
     git commit -m "feat(facturacion): agregar endpoint de creacion de facturas"
     git commit -m "test(facturacion): agregar tests unitarios para GenerarFactura"

  3. Pull Request: feature/* -> develop
     - Titulo: "feat(facturacion): Modulo de facturacion - creacion de facturas"
     - Descripcion: que cambia, por que, como probar
     - Revisores: minimo 1 peer
     - CI: pipeline DEBE pasar (build + tests + lint + security)
     - Merge: Squash merge (1 commit limpio por feature)
     -> DESPLIEGA automaticamente a DEV

  4. Pull Request: develop -> release/v1.2.0
     - Cuando hay suficientes features para release
     - Solo PO o Tech Lead puede aprobar
     -> DESPLIEGA automaticamente a UAT

  5. Validacion en UAT
     - PO y QA validan en entorno UAT
     - Bugs encontrados: bugfix/* desde release/*
     - Si OK: aprobar merge a main

  6. Pull Request: release/* -> main
     - Aprobacion de PO + Tech Lead
     - Tag de version (v1.2.0)
     -> DESPLIEGA automaticamente a PRO


HOTFIX (correccion urgente en produccion):

  1. Crear rama desde main
     git checkout main
     git checkout -b hotfix/JIRA-456-corregir-calculo-iva

  2. Fix + commit
     git commit -m "fix(facturacion): corregir calculo de IVA en facturas internacionales"

  3. Pull Request: hotfix/* -> main
     - Review urgente (minimo 1 revisor)
     - Tag de version (v1.2.1 — PATCH)
     -> DESPLIEGA a PRO

  4. Cherry-pick o merge a develop
     git checkout develop
     git merge hotfix/JIRA-456-corregir-calculo-iva
     -> Asegurar que el fix tambien esta en DEV
Diagrama de Flujo
                    PR + Review + CI                PR + QA                 PR + Tag
feature/* ──────────────────────> develop ──────────────────> release/* ──────────────> main
                                    |         (DEV)     |        (UAT)        |       (PRO)
                                    |                   |                     |
                                    |    bugfix/* ──────+                     |
                                    |    (fixes en UAT)                       |
                                    |                                         |
                                    +<──────────── hotfix/* <─────────────────+
                                    (merge back)          (fix urgente desde PRO)
Entornos y Proposito
+----------+------------------+-----------------------+------------------------+
| Entorno  | Rama fuente      | Datos                 | Quien valida           |
+----------+------------------+-----------------------+------------------------+
| LOCAL    | feature/*        | Datos de desarrollo   | Desarrollador          |
|          |                  | (docker-compose)      |                        |
+----------+------------------+-----------------------+------------------------+
| DEV      | develop          | Datos sinteticos      | Equipo de desarrollo   |
|          |                  | (seed automatico)     | Tests automaticos      |
+----------+------------------+-----------------------+------------------------+
| UAT      | release/*        | Datos de prueba       | PO, QA, Stakeholders   |
|          |                  | (copia anonimizada    | Tests de aceptacion    |
|          |                  |  de produccion)       |                        |
+----------+------------------+-----------------------+------------------------+
| PRO      | main             | Datos reales          | Usuarios finales       |
|          |                  |                       | Monitoreo automatico   |
+----------+------------------+-----------------------+------------------------+

REGLAS DE ENTORNOS:
- NUNCA usar datos reales de produccion en DEV/UAT sin anonimizar
- Cada entorno tiene su propia configuracion (.env, vault, secretos)
- Las migraciones de BD se ejecutan automaticamente en cada despliegue
- Rollback automatico si el health check falla despues del deploy
Nombrado de Ramas
FORMATO: tipo/TICKET-descripcion-corta

EJEMPLOS:
  feature/JIRA-123-crear-modulo-facturacion
  feature/JIRA-456-agregar-dashboard-ventas
  bugfix/JIRA-789-corregir-calculo-iva
  hotfix/JIRA-012-fix-login-produccion
  release/v1.2.0

REGLAS:
- Siempre incluir numero de ticket (trazabilidad)
- Descripcion corta en kebab-case (minusculas, guiones)
- Prefijo segun tipo: feature/, bugfix/, hotfix/, release/
- Max 50 caracteres de descripcion
Semantic Commits (Conventional Commits)
Cada commit sigue un formato estandar que permite generar changelogs automaticamente, determinar la version semantica y facilitar la navegacion del historial.

Formato
<tipo>(<ambito>): <descripcion>

[cuerpo opcional]

[notas de pie opcionales]
Tipos de Commit
+----------+--------------------------+--------------------+---------------------------+
| Tipo     | Descripcion              | SemVer             | Ejemplo                   |
+----------+--------------------------+--------------------+---------------------------+
| feat     | Nueva funcionalidad      | MINOR (x.Y.x)     | feat(pedidos): agregar     |
|          |                          |                    | endpoint de cancelacion    |
+----------+--------------------------+--------------------+---------------------------+
| fix      | Correccion de bug        | PATCH (x.x.Y)     | fix(facturacion): corregir |
|          |                          |                    | calculo de IVA             |
+----------+--------------------------+--------------------+---------------------------+
| docs     | Solo documentacion       | (sin release)      | docs: actualizar README    |
|          |                          |                    | con instrucciones de setup |
+----------+--------------------------+--------------------+---------------------------+
| style    | Formato, espacios,       | (sin release)      | style: aplicar formato     |
|          | sin cambio de logica     |                    | PascalCase en modulo ventas|
+----------+--------------------------+--------------------+---------------------------+
| refactor | Reestructuracion sin     | (sin release)      | refactor(catalogo):        |
|          | cambiar funcionalidad    |                    | extraer validacion a clase |
+----------+--------------------------+--------------------+---------------------------+
| test     | Agregar o corregir       | (sin release)      | test(pedidos): agregar     |
|          | tests                    |                    | tests para CalcularTotal   |
+----------+--------------------------+--------------------+---------------------------+
| chore    | Tareas de mantenimiento  | (sin release)      | chore: actualizar          |
|          | (deps, config, CI)       |                    | dependencias de seguridad  |
+----------+--------------------------+--------------------+---------------------------+
| perf     | Mejora de rendimiento    | PATCH (x.x.Y)     | perf(consultas): optimizar |
|          |                          |                    | query de listado productos |
+----------+--------------------------+--------------------+---------------------------+
| ci       | Cambios en CI/CD         | (sin release)      | ci: agregar stage de       |
|          |                          |                    | security scan al pipeline  |
+----------+--------------------------+--------------------+---------------------------+
| build    | Cambios en build system  | (sin release)      | build: migrar a version    |
|          | o dependencias externas  |                    | 8.0 del runtime            |
+----------+--------------------------+--------------------+---------------------------+
| revert   | Revertir commit anterior | Depende del commit | revert: feat(pedidos):     |
|          |                          | revertido          | agregar endpoint cancel.   |
+----------+--------------------------+--------------------+---------------------------+

BREAKING CHANGE (incrementa MAJOR):
  Agregar "!" despues del tipo, o nota "BREAKING CHANGE:" en el pie

  feat(api)!: cambiar formato de respuesta de pedidos

  BREAKING CHANGE: El campo "total" ahora es un objeto con "monto" y "moneda"
  en lugar de un decimal simple.
Ejemplos Completos
// Simple (solo titulo)
feat(facturacion): agregar generacion automatica de factura PDF

// Con cuerpo explicativo
fix(pedidos): corregir calculo de descuento para clientes VIP

El descuento se aplicaba sobre el subtotal en lugar del total
incluyendo impuestos. Ahora se calcula correctamente sobre
el monto antes de impuestos.

Closes: JIRA-789

// Con breaking change
feat(api)!: migrar paginacion de offset a cursor

BREAKING CHANGE: Los endpoints de listado ahora usan cursor pagination.
El parametro "page" ha sido reemplazado por "cursor".
Los clientes deben actualizar sus integraciones.

Migration guide: docs/migracion-paginacion-v2.md
Closes: JIRA-456
Reglas de Mensajes de Commit
REGLAS:
1. Tipo OBLIGATORIO — siempre empezar con tipo (feat, fix, etc.)
2. Ambito RECOMENDADO — modulo o area afectada entre parentesis
3. Descripcion en IMPERATIVO — "agregar", no "agregado" ni "agregando"
4. Descripcion en MINUSCULAS — sin punto final
5. Primera linea max 72 caracteres
6. Cuerpo separado por linea en blanco
7. Referenciar ticket/issue al final (Closes, Refs, Fixes)
8. Un commit = un cambio logico (no mezclar feature + fix en un commit)
9. En ESPANOL por defecto (alineado con convenciones del proyecto)

HERRAMIENTAS:
- commitlint: valida formato automaticamente (pre-commit hook)
- commitizen: CLI interactivo para crear commits con formato correcto
- standard-version / release-please: genera changelog + version automatica
Trunk-Based Development (alternativa para equipos maduros)
main     ───●──●──●──●──●──●──●──●──●──●──── (integracion continua)
             |        |        |
feature/x   ●──●     ●       ●──●              (vida corta: 1-2 dias max)

REGLAS:
- Feature branches de CORTA duracion (max 1-2 dias)
- Merge a main frecuente (minimo 1x al dia)
- Feature flags para features incompletas
- CI/CD robusto obligatorio (tests automaticos en cada push)
- Ideal para equipos con alta madurez y buena cobertura de tests

CUANDO USAR:
- Equipos pequenos/medianos con alta disciplina
- Proyectos con CI/CD maduro y buena cobertura
- Cuando se necesita velocidad de entrega maxima
Code Review Checklist
FUNCIONALIDAD:
  [ ] Cumple con los requisitos del ticket/historia
  [ ] Maneja casos borde y errores
  [ ] No introduce regresiones

CALIDAD:
  [ ] Nombres claros y descriptivos
  [ ] Funciones pequenas con responsabilidad unica
  [ ] Sin codigo duplicado innecesario
  [ ] Sin numeros magicos ni strings hardcodeados

SEGURIDAD:
  [ ] Sin inyecciones (SQL, XSS, Command)
  [ ] Validacion de inputs
  [ ] Control de acceso verificado
  [ ] Sin datos sensibles en logs o respuestas

TESTING:
  [ ] Tests unitarios para logica nueva
  [ ] Tests de integracion si aplica
  [ ] Tests pasan en CI

RENDIMIENTO:
  [ ] Sin queries N+1
  [ ] Paginacion en listados
  [ ] Indices de BD si se agregan consultas nuevas
Buenas Practicas de Code Review
PARA EL AUTOR:
- PRs pequenos (max 400 lineas — ideal < 200)
- Descripcion clara del PR: que cambia, por que, como probar
- Self-review antes de pedir revision
- Responder a todos los comentarios
- No tomar feedback como critica personal

PARA EL REVISOR:
- Revisar en < 24 horas (no bloquear al equipo)
- Diferenciar entre "debe cambiar" y "sugerencia"
- Ser especifico: "Renombra esto a X porque Y" no "esto esta mal"
- Preguntar antes de asumir: "Por que elegiste X?" no "X esta mal"
- Aprobar cuando es "suficientemente bueno" — no buscar perfeccion
Migraciones de Base de Datos
// --- Migracion versionada y reversible ---
MIGRATION "2024_01_15_crear_tabla_pedido"

    FUNCTION up()
        CREATE TABLE pedido (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER NOT NULL REFERENCES usuario(id),
            monto_total DECIMAL(18,2) NOT NULL,
            estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
            fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
        )
        CREATE INDEX idx_pedido_usuario_id ON pedido(usuario_id)

    FUNCTION down()
        DROP INDEX idx_pedido_usuario_id
        DROP TABLE pedido

// REGLAS:
// - Una migracion por cambio logico
// - Siempre escribir up() Y down()
// - NUNCA modificar migraciones ya ejecutadas en produccion
// - Para cambios en tablas existentes, crear nueva migracion
// - Probar down() antes de merge (rollback debe funcionar)
Gestion de Secretos y Configuracion Sensible
El Problema: Secretos en el Codigo
// === NUNCA HACER ESTO ===

// --- MAL: Secretos hardcodeados en el codigo ---
DEFINE DatabaseConfig
    connectionString = "Server=prod-db;User=admin;Password=S3cr3t!"   // EN EL CODIGO
    apiKey = "sk-1234567890abcdef"                                     // EN EL CODIGO
    jwtSecret = "mi-super-secreto-jwt"                                 // EN EL CODIGO

// --- MAL: Secretos en archivos de configuracion versionados ---
// settings.json (comiteado a git)
{
    "Database": {
        "ConnectionString": "Server=prod-db;Password=S3cr3t!"
    },
    "Jwt": {
        "Secret": "mi-super-secreto-jwt"
    }
}
// RIESGO: Cualquiera con acceso al repositorio ve los secretos
// RIESGO: Los secretos quedan en el historial de git PARA SIEMPRE
Jerarquia de Seguridad (de menos a mas seguro)
NIVEL 1 — INACEPTABLE:
  Secretos hardcodeados en el codigo fuente
  Secretos en settings.json/appsettings.json comiteados a git

NIVEL 2 — MINIMO ACEPTABLE (desarrollo local):
  Archivos .env (NO comiteados a git)
  Archivos de secretos locales (user-secrets)

NIVEL 3 — RECOMENDADO (staging/produccion):
  Variables de entorno inyectadas en runtime
  Secretos en el sistema de orquestacion (Docker secrets, K8s secrets)

NIVEL 4 — GOLD STANDARD (produccion critica):
  Vault de secretos (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault)
  Credenciales efimeras (Just-In-Time, rotacion automatica)
  Zero-trust: la app nunca ve el secreto directamente
Patron .env (Desarrollo Local)
# .env (NUNCA comitear — debe estar en .gitignore)
DATABASE_URL=postgresql://user:password@localhost:5432/miapp
JWT_SECRET=dev-secret-solo-para-desarrollo
API_KEY_PAGOS=sk-test-1234567890
SMTP_PASSWORD=test-password
REDIS_URL=redis://localhost:6379

# .env.example (SI comitear — template sin valores reales)
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=
API_KEY_PAGOS=
SMTP_PASSWORD=
REDIS_URL=redis://host:port
// --- .gitignore (OBLIGATORIO) ---
.env
.env.local
.env.*.local
*.key
*.pem
credentials.json
secrets/

// --- Cargar .env de forma segura ---
DEFINE ConfigLoader
    FUNCTION cargar() -> Config
        // 1. Cargar .env si existe (solo en desarrollo)
        IF fileExists(".env") AND env.get("ENVIRONMENT") != "production"
            cargarArchivoEnv(".env")

        // 2. Validar que todas las variables requeridas existen
        variablesRequeridas = ["DATABASE_URL", "JWT_SECRET", "API_KEY_PAGOS"]
        faltantes = variablesRequeridas.filter(v -> env.get(v) IS NULL)

        IF faltantes.isNotEmpty()
            THROW ConfigException(
                "Variables de entorno faltantes: " + faltantes.join(", ") +
                "\nCopia .env.example a .env y configura los valores"
            )

        RETURN Config(
            databaseUrl = env.get("DATABASE_URL"),
            jwtSecret = env.get("JWT_SECRET"),
            apiKeyPagos = env.get("API_KEY_PAGOS")
        )
Patron Vault (Produccion)
// --- Vault de secretos (HashiCorp Vault, AWS Secrets Manager, etc.) ---
DEFINE SecretManager
    DEPENDS ON vaultClient

    // Obtener secreto con cache corto
    FUNCTION obtenerSecreto(path: String) -> String
        cached = cache.get(path)
        IF cached IS NOT NULL AND NOT cached.expirado()
            RETURN cached.valor

        secreto = vaultClient.read(path)
        cache.set(path, secreto, ttl = 5.minutos)   // Cache corto
        RETURN secreto.valor

    // Rotacion automatica de credenciales
    FUNCTION obtenerCredencialBD() -> DatabaseCredential
        // Vault genera credenciales efimeras (lease de 1 hora)
        lease = vaultClient.generateDatabaseCredential(
            role = "app-readonly",
            ttl = "1h"
        )
        RETURN DatabaseCredential(
            username = lease.username,    // Usuario temporal
            password = lease.password,    // Password temporal
            expiresAt = lease.expiresAt
        )

// Configuracion de la app en produccion
DEFINE AppStartup
    FUNCTION configurar()
        // NO hay archivos .env en produccion
        // Los secretos se inyectan via:
        // 1. Variables de entorno del orquestador (Docker/K8s)
        // 2. Vault de secretos leido en startup
        // 3. Sidecar/init container que inyecta secretos

        secretManager = NEW SecretManager(vaultUrl = env.get("VAULT_URL"))
        dbCredential = secretManager.obtenerCredencialBD()
        database.connect(dbCredential)
Reglas de Gestion de Secretos
REGLAS ABSOLUTAS:
1. NUNCA comitear secretos a git (usar .gitignore + pre-commit hooks)
2. NUNCA poner secretos en settings.json, appsettings.json, config.yaml versionados
3. NUNCA loguear secretos (ni parcialmente — ni "Password: S3***")
4. NUNCA enviar secretos por chat, email, o canales no cifrados
5. NUNCA usar el mismo secreto en desarrollo y produccion

BUENAS PRACTICAS:
1. .env solo para desarrollo local — SIEMPRE en .gitignore
2. .env.example como template — SI comitear (sin valores reales)
3. Variables de entorno para staging — inyectadas por CI/CD
4. Vault de secretos para produccion — con rotacion automatica
5. Pre-commit hooks para detectar secretos accidentales
6. Auditar acceso a secretos (quien, cuando, desde donde)
7. Rotacion periodica de todos los secretos (90 dias maximo)
8. Principio de minimo privilegio: cada app solo accede a SUS secretos
Twelve-Factor App (Principios de Aplicaciones Modernas)
Los 12 factores son principios para construir aplicaciones SaaS modernas, escalables y mantenibles. Aplicables a cualquier lenguaje, framework o plataforma de despliegue.

Los 12 Factores
FACTOR              PRINCIPIO                                           PRACTICA

I.   Codebase       Un repositorio, multiples deploys                   Un repo git = una app
                                                                        Multiples entornos desde el mismo codigo

II.  Dependencies   Declarar y aislar dependencias                      Archivo de dependencias explicito
                    explicitamente                                      No depender de paquetes del sistema

III. Config         Almacenar configuracion en                          Variables de entorno
                    el entorno                                          NUNCA en el codigo fuente

IV.  Backing        Tratar servicios externos como                      BD, colas, cache = recursos adjuntos
     Services       recursos adjuntos (intercambiables)                 Cambiar via configuracion, no codigo

V.   Build,         Separar estrictamente las etapas                    Build: compilar + dependencias
     Release, Run   de build, release y ejecucion                       Release: build + config de entorno
                                                                        Run: ejecutar en el entorno

VI.  Processes      Ejecutar la app como procesos                       Sin estado en memoria entre requests
                    sin estado (stateless)                              Estado en BD, cache o almacen externo

VII. Port Binding   Exportar servicios via binding                      La app es auto-contenida
                    de puertos                                          No depende de un servidor web externo

VIII.Concurrency    Escalar horizontalmente via                         Escalar agregando instancias (procesos)
                    el modelo de procesos                               No escalar verticalmente (mas RAM/CPU)

IX.  Disposability  Maximizar robustez con arranque                     Startup rapido (segundos, no minutos)
                    rapido y shutdown gracioso                          Shutdown limpio (terminar requests en curso)

X.   Dev/Prod       Mantener desarrollo, staging y                      Mismas dependencias en todos los entornos
     Parity         produccion lo mas similar posible                   Deploys frecuentes (horas, no semanas)

XI.  Logs           Tratar logs como flujos de eventos                  No escribir en archivos
                                                                        Stdout/stderr — el entorno los captura

XII. Admin          Ejecutar tareas de administracion                   Migraciones, scripts de mantenimiento
     Processes      como procesos puntuales                             Misma release, mismo entorno
Aplicacion Practica
// --- Factor III: Configuracion en el entorno ---
// MAL:
DEFINE Config
    databaseUrl = "postgresql://prod-server/mydb"    // Hardcodeado

// BIEN:
DEFINE Config
    databaseUrl = env.get("DATABASE_URL")            // Del entorno

// --- Factor IV: Backing Services intercambiables ---
// La app no sabe si usa Redis local o ElastiCache en AWS
DEFINE CacheConfig
    cacheUrl = env.get("CACHE_URL")    // redis://localhost:6379 o redis://elasticache:6379

// --- Factor VI: Procesos sin estado ---
// MAL: Almacenar sesion en memoria
sessions = InMemoryMap()    // Se pierde al reiniciar, no funciona con multiples instancias

// BIEN: Almacenar sesion en servicio externo
sessions = RedisSessionStore(env.get("REDIS_URL"))

// --- Factor IX: Shutdown gracioso ---
DEFINE AppServer
    FUNCTION onShutdownSignal()
        logger.info("Shutdown signal recibida, terminando requests en curso...")
        server.stopAcceptingNewRequests()
        server.waitForCurrentRequests(timeout = 30.segundos)
        database.closeConnections()
        logger.info("Shutdown completo")
        exit(0)

// --- Factor XI: Logs como flujo ---
// MAL: Escribir a archivo
logger.setOutput(FileWriter("/var/log/app.log"))

// BIEN: Escribir a stdout (el entorno decide que hacer con los logs)
logger.setOutput(STDOUT)
// Docker/K8s captura stdout y lo envia a Elasticsearch, CloudWatch, etc.
CI/CD y Estrategias de Despliegue
Pipeline CI/CD
+----------+     +---------+     +----------+     +-----------+     +----------+
|  Commit  | --> |  Build  | --> |   Test   | --> |  Release  | --> |  Deploy  |
|          |     |         |     |          |     |           |     |          |
| git push |     | compile |     | unit     |     | tag       |     | staging  |
|          |     | deps    |     | integr.  |     | artifact  |     | prod     |
|          |     | lint    |     | security |     | changelog |     |          |
+----------+     +---------+     +----------+     +-----------+     +----------+
                                      |
                              Quality Gates:
                              - Tests pasan
                              - Cobertura >= 80%
                              - Sin vulnerabilidades criticas
                              - Lint sin errores
// --- Pipeline como codigo (pseudocodigo de CI/CD) ---
PIPELINE "mi-app"

    STAGE "Build"
        STEPS
            checkout(codigo)
            instalarDependencias()           // npm install, pip install, etc.
            compilar()                       // Si aplica
            analizarCodigoEstatico()         // Linter, formatter

    STAGE "Test" (PARALELO)
        JOB "Unit Tests"
            ejecutar("tests/unit")
            reportarCobertura(minimo = 80%)
        JOB "Integration Tests"
            levantarServicios(database, redis)
            ejecutar("tests/integration")
        JOB "Security Scan"
            escanearDependencias()           // Vulnerabilidades conocidas
            escanearSecretos()               // Detectar secretos accidentales
            escanearSAST()                   // Static Application Security Testing

    STAGE "Release"
        WHEN branch == "main" OR branch == "release/*"
        STEPS
            version = calcularVersion()      // Semantic versioning
            construirArtefacto(version)       // Docker image, package, etc.
            publicarArtefacto(registro)
            tagearRelease(version)

    STAGE "Deploy Staging"
        WHEN branch == "release/*"
        STEPS
            desplegar(entorno = "staging", artefacto = version)
            ejecutarSmokeTests("staging")
            // Esperar aprobacion manual para produccion

    STAGE "Deploy Produccion"
        WHEN aprobado AND branch == "main"
        STEPS
            desplegar(entorno = "produccion", estrategia = "canary", porcentaje = 10)
            monitorearMetricas(duracion = 10.minutos)
            IF metricas.errorRate > 1%
                rollback()
                notificar("Rollback automatico ejecutado")
            ELSE
                expandir(porcentaje = 100)
                notificar("Deploy exitoso v" + version)
Estrategias de Despliegue
+--------------------+------------------+--------------------+--------------------+
| Estrategia         | Downtime         | Riesgo             | Cuando usar        |
+--------------------+------------------+--------------------+--------------------+
| Recreate           | SI (minutos)     | Alto (todo o nada) | Dev/staging        |
| Rolling Update     | NO               | Medio              | Apps stateless     |
| Blue/Green         | NO               | Bajo               | Apps criticas      |
| Canary             | NO               | Muy bajo           | Alto trafico       |
| Feature Flags      | NO               | Muy bajo           | Rollout gradual    |
+--------------------+------------------+--------------------+--------------------+
Blue/Green Deployment
                  Load Balancer
                       |
            +----------+----------+
            |                     |
    +-------v-------+    +-------v-------+
    |    BLUE        |    |    GREEN      |
    |  (v1 - actual) |    |  (v2 - nueva) |
    |    100%        |    |     0%        |
    +----------------+    +----------------+

    1. Desplegar v2 en GREEN (sin trafico)
    2. Ejecutar tests contra GREEN
    3. Cambiar Load Balancer: todo el trafico a GREEN
    4. Si falla: revertir Load Balancer a BLUE (rollback instantaneo)
    5. Si ok: BLUE se convierte en el proximo GREEN
Canary Deployment
                  Load Balancer
                       |
            +----------+----------+
            |                     |
    +-------v-------+    +-------v-------+
    |   PRODUCCION   |    |    CANARY     |
    |   (v1 - 90%)   |    |  (v2 - 10%)  |
    +----------------+    +----------------+

    1. Desplegar v2 en canary (10% del trafico)
    2. Monitorear metricas (error rate, latencia, CPU)
    3. Si metricas OK: incrementar a 25% -> 50% -> 100%
    4. Si metricas MAL: rollback canary a v1
Feature Flags (Deployment != Release)
// Separar DEPLOY (poner codigo en produccion) de RELEASE (activar para usuarios)

DEFINE FeatureFlag
    DEPENDS ON flagService

    // El codigo se despliega pero la feature esta desactivada
    FUNCTION nuevoCheckout(request)
        IF flagService.isEnabled("nuevo-checkout", usuario = request.usuario)
            // Nuevo flujo (solo para usuarios seleccionados)
            RETURN procesoCheckoutV2(request)
        ELSE
            // Flujo actual (resto de usuarios)
            RETURN procesoCheckoutV1(request)

// Configuracion de flags
flagService.configure(
    "nuevo-checkout": {
        enabled: TRUE,
        strategy: "percentage",     // Rollout gradual
        percentage: 10,             // 10% de usuarios
        // O por segmento:
        // strategy: "user-list",
        // users: ["beta-tester-1", "beta-tester-2"]
    }
)

// Ciclo de vida de un feature flag:
// 1. Crear flag (desactivado)
// 2. Deploy codigo con flag
// 3. Activar para equipo interno (dogfooding)
// 4. Activar para beta testers (10%)
// 5. Rollout gradual (25% -> 50% -> 100%)
// 6. LIMPIAR: eliminar flag y codigo viejo (IMPORTANTE — no acumular flags)
Semantic Versioning (SemVer)
MAJOR.MINOR.PATCH    Ejemplo: 2.4.1

MAJOR (2.x.x) — Cambios incompatibles (breaking changes)
  - Eliminar endpoint de API
  - Cambiar formato de respuesta
  - Eliminar parametros requeridos

MINOR (x.4.x) — Nueva funcionalidad compatible hacia atras
  - Agregar nuevo endpoint
  - Agregar campo opcional a respuesta
  - Nueva feature

PATCH (x.x.1) — Correcciones de bugs compatibles
  - Fix de bugs
  - Parches de seguridad
  - Mejoras de rendimiento

PRE-RELEASE: 2.4.1-beta.1, 2.4.1-rc.1
BUILD META:  2.4.1+build.123
Containerizacion (Principios Basicos)
Dockerfile: Buenas Practicas
// --- MAL: Dockerfile ineficiente e inseguro ---
FROM ubuntu:latest               // Imagen pesada, tag inestable
RUN apt-get update && apt-get install -y runtime
COPY . /app                      // Copia TODO (incluido .git, node_modules, secretos)
RUN instalar_dependencias
RUN compilar
USER root                        // Ejecutar como root = riesgo de seguridad
CMD ["ejecutar"]

// --- BIEN: Multi-stage build, seguro y eficiente ---
// Etapa 1: Build
FROM runtime-sdk:8.0 AS build    // Version especifica
WORKDIR /src
COPY dependencias.lock .          // Primero: solo archivo de dependencias
RUN instalar_dependencias         // Cache de Docker: solo re-ejecuta si cambian deps
COPY . .                          // Luego: el codigo fuente
RUN compilar --output /app/publish

// Etapa 2: Runtime (imagen minima)
FROM runtime:8.0-alpine AS final  // Imagen Alpine (~5MB vs ~100MB)
WORKDIR /app
COPY --from=build /app/publish .  // Solo los artefactos compilados

// Seguridad: usuario no-root
RUN adduser --disabled-password appuser
USER appuser

EXPOSE 8080
HEALTHCHECK --interval=30s CMD curl -f http://localhost:8080/health || exit 1
CMD ["ejecutar"]
.dockerignore
# Excluir todo lo innecesario (como .gitignore pero para Docker)
.git
.env
.env.*
node_modules/
*.md
tests/
docs/
.vscode/
.idea/
**/*.log
Docker Compose (Desarrollo Local)
// docker-compose.yml — entorno de desarrollo completo
services:
    app:
        build: .
        ports: ["8080:8080"]
        environment:
            DATABASE_URL: postgresql://user:pass@db:5432/miapp
            REDIS_URL: redis://cache:6379
            ENVIRONMENT: development
        depends_on:
            db: { condition: service_healthy }
            cache: { condition: service_started }

    db:
        image: postgres:16-alpine
        environment:
            POSTGRES_DB: miapp
            POSTGRES_USER: user
            POSTGRES_PASSWORD: pass    // Solo para desarrollo local
        volumes:
            - db_data:/var/lib/postgresql/data
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U user"]
            interval: 5s
            retries: 5

    cache:
        image: redis:7-alpine

volumes:
    db_data:     // Persistir datos entre reinicios
Plantilla de Decision Arquitectonica
Al definir la arquitectura para un proyecto, documenta tus decisiones en ARQUITECTURA-PATRONES.md:

# Arquitectura de Patrones - [Nombre del Proyecto]

## Decision Arquitectonica Principal

**Patron seleccionado**: [Clean Architecture | Vertical Slice | Modular Monolith | Hibrido]

**Justificacion**:
- Tamano del proyecto: [Pequeno <5 devs | Mediano 5-15 devs | Grande >15 devs]
- Complejidad del dominio: [Simple CRUD | Moderada | Compleja con DDD]
- Horizonte temporal: [Corto <1 ano | Mediano 1-3 anos | Largo >3 anos]
- Requisitos de escalabilidad: [Monolito unico | Potencial microservicios]

## Estructura de Alto Nivel

[Diagrama ASCII de la estructura de carpetas]

## Decisiones Tecnicas

### Endpoints
- [ ] Endpoints livianos (funcionales)
- [ ] Controladores (orientados a objetos)
- [ ] Hibrido (especificar criterio)

### Separacion de Comandos y Queries
- [ ] CQRS con Mediador
- [ ] Servicios tradicionales
- [ ] Ambos (especificar criterio)

### Acceso a Datos
- [ ] Patron Repository
- [ ] Acceso directo
- [ ] Hibrido (especificar criterio)

### Comunicacion entre Modulos (si aplica)
- [ ] Notificaciones del Mediador (In-Process)
- [ ] Bus de mensajes In-Memory
- [ ] Llamadas directas a interfaces publicas
- [ ] Combinacion (especificar)

## Convenciones de Modulos

### Estructura de un Modulo

Modules/
+-- {NombreModulo}/
    +-- {Modulo}.Api/              (Endpoints publicos)
    +-- {Modulo}.Application/      (Casos de uso)
    +-- {Modulo}.Domain/           (Entidades, Value Objects)
    +-- {Modulo}.Infrastructure/   (Persistencia, Repositorios)
    +-- {Modulo}.Contracts/        (DTOs publicos, eventos)

### Reglas de Comunicacion

1. **Modulos NO pueden**:
   - Referenciar directamente {OtroModulo}.Infrastructure
   - Hacer queries directos a tablas de otros modulos
   - Llamar a clases internas de otros modulos

2. **Modulos SI pueden**:
   - Referenciar {OtroModulo}.Contracts
   - Llamar a interfaces publicas de otros modulos
   - Suscribirse a eventos de dominio de otros modulos

## Patrones Transversales

### Respuesta Estandarizada
Todas las respuestas usan ApiResponse<T>

### Manejo de Excepciones
GlobalExceptionHandler con ProblemDetails (RFC 7807)

### Validacion
Validacion declarativa con integracion automatica via Pipeline Behavior

### Logging
Logging estructurado con trazabilidad

### Seguridad
Autenticacion basada en tokens, Autorizacion basada en politicas
Reglas del Skill
Arquitectura
Decision basada en contexto — NO hay una arquitectura "correcta" universal; depende de: tamano del equipo, complejidad del dominio, horizonte temporal
Documentar decisiones — Crear ARQUITECTURA-PATRONES.md con justificaciones claras
Preferir hibridos — Los enfoques hibridos (Clean + Vertical Slice + Modular) son los mas recomendados
Modular por defecto — Para proyectos medianos-grandes, preferir Modular Monolith sobre monolito tradicional
CQRS + Mediador — Usar en Vertical Slice y Modular Monolith para separacion Command/Query
Eventos de dominio — Preferir comunicacion por eventos sobre llamadas directas entre modulos
Repositorios selectivos — Usar Repository Pattern solo cuando aporta valor; caso contrario, acceso directo
Endpoints livianos para features simples — Controladores para logica compleja con multiples responsabilidades
Fronteras claras — En Modular Monolith, NUNCA permitir acceso directo a datos entre modulos
Preparar para escalar — Disenar modulos que puedan extraerse como microservicios en el futuro
Codigo y Diseno
SOLID siempre — Los principios SOLID son la base de cualquier decision arquitectonica
Composicion sobre herencia — Preferir composicion e interfaces sobre jerarquias de herencia profundas
Inmutabilidad por defecto — Objetos inmutables salvo que la mutabilidad sea necesaria
Clean Code — Nombres descriptivos, funciones pequenas, sin numeros magicos, sin codigo muerto
PascalCase en espanol — Variables, metodos, clases y propiedades en PascalCase y en espanol por defecto
Conventional Commits — Formato estandar (feat/fix/refactor/test/docs/chore) para commits semanticos
Pseudocodigo agnostico — Todos los ejemplos en pseudocodigo, aplicables a cualquier lenguaje/framework
DDD y Hexagonal
Hexagonal para integraciones — Puertos y adaptadores para aislar dominio de infraestructura
DDD para dominios complejos — Agregados, Value Objects, Bounded Contexts, Ubiquitous Language
Agregados pequenos — Solo entidades que DEBEN ser consistentes juntas; referenciar otros agregados por ID
Un repositorio por agregado — Acceso a entidades internas SOLO a traves del Aggregate Root
Seguridad
Seguridad desde el diseno — No anadir seguridad como una capa posterior; disenar seguro desde el inicio
OWASP Top 10 — Conocer y mitigar las 10 vulnerabilidades mas criticas
Validar en fronteras — Validar toda entrada externa (usuarios, APIs, archivos)
Minimo privilegio — Acceso minimo necesario para cada componente/usuario
Secretos NUNCA en codigo — .env para desarrollo (en .gitignore), vault para produccion
CORS restrictivo — Origenes explicitos, nunca wildcard en produccion
APIs
REST con convenciones — Sustantivos, plurales, verbos HTTP correctos, max 2 niveles de anidamiento
Cursor pagination para datasets grandes — 17x mas rapido que offset; offset solo para datos pequenos
HATEOAS cuando aplique — Links dinamicos en respuestas para APIs discoverable
Seguridad de APIs — OAuth2 + JWT, CORS restrictivo, rate limiting, headers de seguridad
Calidad
Testing piramidal — 70% unitarios, 20% integracion, 10% E2E
Resiliencia — Circuit breaker, retry, timeout y bulkhead para servicios externos
Logging estructurado — Logs con contexto, correlation ID y niveles apropiados
Migraciones reversibles — Toda migracion de BD debe tener up() y down()
Proceso Agile
Scrum con ceremonias — Planning, Daily, Review, Retro, Refinement con tiempos definidos
User Stories INVEST — Independent, Negotiable, Valuable, Estimable, Small, Testable
DoR y DoD — Definition of Ready para entrar al sprint, Definition of Done para completar
Estimacion relativa — Story Points (Fibonacci) para esfuerzo, no horas
Deuda tecnica 15-20% — Reservar capacidad cada sprint para pagar deuda tecnica
Post-mortems blameless — Buscar causas sistemicas, no culpables individuales
Operaciones
Twelve-Factor App — 12 principios para aplicaciones modernas, escalables y portables
CI/CD automatizado — Pipeline con quality gates (tests, cobertura, seguridad, lint)
Deploy != Release — Feature flags para separar despliegue de activacion
Semantic Versioning — MAJOR.MINOR.PATCH para versionado claro y predecible
Containers seguros — Multi-stage builds, usuario no-root, imagen minima, .dockerignore
Gestion de incidentes — Severidad (SEV1-4), Incident Commander, SLAs, post-mortem
Checklist de Entregables
Al completar el diseno arquitectonico, asegurar que se ha entregado:

Arquitectura
 ARQUITECTURA-PATRONES.md con decision arquitectonica justificada
 Diagrama de estructura de modulos/capas (ASCII)
 Decision de tipo de Endpoints
 Decision de CQRS o servicios tradicionales
 Decision de Patron Repository o acceso directo
 Estrategia de comunicacion entre modulos (si aplica)
 Convenciones de nomenclatura de proyectos
 Registro de servicios de cada modulo
 Estrategia de migracion a microservicios (si aplica)
DDD y Dominio
 Bounded Contexts identificados (mapa de contextos)
 Agregados y Aggregate Roots definidos por modulo
 Value Objects identificados (Dinero, Direccion, etc.)
 Ubiquitous Language documentado (glosario de dominio)
Seguridad y Resiliencia
 Modelo de autenticacion y autorizacion definido (OAuth2/JWT)
 Validacion de inputs en todas las fronteras del sistema
 Estrategia de resiliencia (circuit breaker, retry, timeout)
 Manejo global de excepciones (ProblemDetails RFC 7807)
 Logging estructurado con correlation ID
 CORS configurado con origenes explicitos
 Headers de seguridad (HSTS, CSP, X-Content-Type-Options)
 Rate limiting definido
Gestion de Secretos
 Estrategia de secretos definida (.env dev / vault prod)
 .gitignore incluye .env, .key, .pem, credentials.*
 .env.example comiteado como template (sin valores reales)
 Pre-commit hooks para detectar secretos accidentales
 Rotacion de secretos planificada
Base de Datos
 Convenciones de nomenclatura de BD (tablas, columnas, indices, restricciones)
 Estrategia de migraciones versionadas y reversibles
 Precision de tipos monetarios definida (DECIMAL 18,2 minimo)
API
 Convenciones de endpoints REST documentadas
 Estrategia de versionado de API (URL path recomendado)
 Formato de respuestas estandarizado (ApiResponse, ProblemDetails)
 Estrategia de paginacion definida (offset vs cursor)
 Filtrado y ordenamiento con campos permitidos (whitelist)
 HATEOAS evaluado (links dinamicos en respuestas)
Testing
 Estrategia de testing (piramide: unitarios, integracion, E2E)
 Convenciones de nombres de tests definidas
 Cobertura objetivo establecida (recomendado: 80%+)
Proceso y Metodologia
 Metodologia definida (Scrum, Kanban, Scrumban)
 Ceremonias establecidas (Planning, Daily, Review, Retro, Refinement)
 Definition of Ready (DoR) definida y compartida
 Definition of Done (DoD) definida y compartida
 Formato de User Stories acordado (INVEST, Given-When-Then)
 Metodo de estimacion definido (Story Points, T-Shirt)
 Gestion de deuda tecnica — regla del 15-20% por sprint
Gestion de Incidentes
 Niveles de severidad (SEV1-SEV4) con SLAs definidos
 Proceso de respuesta con roles (Incident Commander)
 Template de post-mortem blameless disponible
 Canales de comunicacion de incidentes definidos
Convenciones de Codigo
 PascalCase en espanol como convencion por defecto
 Tabla de convenciones documentada (variables, metodos, clases, constantes, enums)
 Excepciones al espanol documentadas (Id, Dto, Query, Handler, etc.)
 Nombres de metodos por tipo de operacion (Obtener, Crear, Validar, etc.)
SDLC y Operaciones
 Estrategia de ramas (Git Flow con entornos DEV/UAT/PRO)
 Nombrado de ramas definido (tipo/TICKET-descripcion)
 Conventional Commits adoptado (feat/fix/refactor/test/docs/chore)
 Herramientas de commit configuradas (commitlint, commitizen)
 Flujo de PR documentado (feature->develop->release->main)
 Checklist de Code Review definido
 Buenas practicas de PRs documentadas (tamano, descripcion, tiempos)
 Pipeline CI/CD con quality gates (tests, cobertura, seguridad)
 Estrategia de despliegue (Rolling, Blue/Green, Canary)
 Feature flags para features de alto riesgo
 Semantic Versioning adoptado (vinculado a Conventional Commits)
 Twelve-Factor App principios evaluados
 Containerizacion (Dockerfile multi-stage, .dockerignore, docker-compose)
Notas Finales
Este skill es una referencia integral de buenas practicas de ingenieria de software agnostica de tecnologia
Arquitectura: Clean Architecture + Hexagonal + Vertical Slice + Modular Monolith (y combinaciones hibridas)
DDD: Bounded Contexts, Agregados, Value Objects, Eventos de Dominio, Ubiquitous Language
POO: SOLID, composicion sobre herencia, inmutabilidad, encapsulamiento estricto
Seguridad: OWASP Top 10 (2025), OAuth2/JWT, CORS, rate limiting, headers de seguridad
Secretos: NUNCA en codigo — .env para desarrollo (en .gitignore), vault de secretos para produccion
APIs REST: Convenciones, cursor pagination, HATEOAS, filtrado, versionado, idempotencia, seguridad
Concurrencia: Preferir inmutabilidad y actores sobre locks manuales
BD: snake_case, singular, restricciones nombradas, migraciones reversibles, precision monetaria
Testing: Piramide (70/20/10), TDD, AAA pattern, tests independientes y deterministas
Resiliencia: Circuit breaker + retry + timeout + bulkhead para servicios externos
Observabilidad: Logging estructurado, correlation ID, metricas de negocio e infraestructura
Agile/Scrum: Ceremonias, User Stories (INVEST, Given-When-Then), DoR/DoD, estimacion, retrospectivas
Deuda Tecnica: Cuadrante de Fowler, priorizacion impacto/esfuerzo, regla del 15-20%
Incidentes: SEV1-4, Incident Commander, post-mortem blameless, action items
SDLC: Git flow, Trunk-Based, code review, CI/CD con quality gates, semantic versioning
Despliegue: Blue/Green, Canary, Feature Flags — deploy != release
Twelve-Factor App: 12 principios para aplicaciones modernas, portables y escalables
Containers: Multi-stage builds, usuario no-root, .dockerignore, docker-compose para desarrollo
La clave es justificar decisiones basandose en el contexto del proyecto, NO en dogmas
Todos los ejemplos usan pseudocodigo aplicable a cualquier stack tecnologico