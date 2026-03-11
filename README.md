# 💼 BTG Pactual - Manejo de Fondos (FPV/FIC)

Aplicación web interactiva para la gestión de Fondos de Pensiones Voluntarias (FPV) y Fondos de Inversión Colectiva (FIC) de BTG Pactual.

![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat&logo=tailwind-css)

---

## 📋 Características

### Funcionalidades Principales
- ✅ **Visualizar fondos disponibles** - Lista completa de 5 fondos FPV/FIC
- ✅ **Suscripción a fondos** - Con validación de monto mínimo y saldo disponible
- ✅ **Cancelación de participación** - Devolución automática del monto al saldo
- ✅ **Historial de transacciones** - Registro de suscripciones y cancelaciones
- ✅ **Notificaciones** - Selección de método preferido (Email o SMS)
- ✅ **Mensajes de error** - Feedback claro cuando no hay saldo suficiente

### Características Técnicas
- 🎨 Diseño responsivo (mobile-first)
- ⚡ Lazy loading de componentes
- 🔄 Manejo de estado con BehaviorSubject y Signals
- 📝 Formularios reactivos con validaciones
- 🧪 Pruebas unitarias
- ♿ Accesibilidad (ARIA labels, focus trap en modales)

---

## 🏦 Fondos Disponibles

| ID | Nombre | Monto Mínimo | Categoría |
|----|--------|--------------|-----------|
| 1 | FPV_BTG_PACTUAL_RECAUDADORA | $75.000 COP | FPV |
| 2 | FPV_BTG_PACTUAL_ECOPETROL | $125.000 COP | FPV |
| 3 | DEUDAPRIVADA | $50.000 COP | FIC |
| 4 | FDO-ACCIONES | $250.000 COP | FIC |
| 5 | FPV_BTG_PACTUAL_DINAMICA | $100.000 COP | FPV |

> **Nota:** El usuario inicia con un saldo de **$500.000 COP**

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 20+ 
- npm 10+

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/manejo-fondos-app.git
cd manejo-fondos-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm start
```

4. **Abrir en el navegador**
```
http://localhost:4200
```

---

## 🧪 Ejecutar Pruebas

```bash
npm test
```

Las pruebas unitarias cubren:
- Estado inicial del usuario (saldo $500.000)
- Obtención de fondos disponibles
- Suscripción con validaciones (monto mínimo, saldo, duplicados)
- Cancelación y devolución de saldo
- Registro de transacciones

---

## 📁 Estructura del Proyecto

```
src/app/
├── core/                          # Núcleo de la aplicación
│   ├── models/                    # Interfaces TypeScript
│   │   ├── fondo.interface.ts
│   │   ├── transaccion.interface.ts
│   │   └── estadoUsuario.interface.ts
│   └── services/                  # Servicios principales
│       └── fondos-service.ts      # Lógica de negocio (API simulada)
│
├── features/                      # Módulos funcionales
│   ├── panel-principal/           # Dashboard principal
│   ├── fondos/                    
│   │   └── components/
│   │       └── lista-fondos/      # Lista y suscripción a fondos
│   └── transacciones/
│       └── components/
│           └── historial/         # Historial de movimientos
│
└── shared/                        # Componentes compartidos
    ├── components/
    │   └── toast/                 # Notificaciones toast
    ├── models/
    │   └── notificacion.interface.ts
    └── services/
        └── notificacion.service.ts
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| **Angular 20** | Framework principal |
| **TypeScript** | Tipado estático |
| **RxJS** | Manejo de estado reactivo |
| **Angular Signals** | Estado de notificaciones |
| **Tailwind CSS** | Estilos y diseño responsivo |
| **Karma/Jasmine** | Pruebas unitarias |

---

## 📐 Principios de Diseño

- **SOLID** - Servicios con responsabilidad única, inyección de dependencias
- **Clean Code** - Nombres descriptivos, funciones pequeñas, código autoexplicativo
- **Reactive Programming** - Observables para manejo de estado asíncrono
- **Component-Based Architecture** - Componentes standalone reutilizables

---

## 👤 Autor

Desarrollado como prueba técnica para BTG Pactual.

---

## 📄 Licencia

Este proyecto es de uso educativo y evaluativo.
