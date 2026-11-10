# Control de Gastos & Finanzas Familiares

Aplicación web y móvil progresiva para la gestión integral de gastos e ingresos del hogar, control de jornadas laborales por horas (Puente Sur y Sergio), balance financiero en 4 cuadrantes, matriz cruzada dinámica y auditoría inteligente de ahorro.

---

## 🚀 Características Principales

### 1. Entidades Fijas de Asignación
- **Marwan** (Usuario principal)
- **Siham**
- **Loujain**
- **Lwalida**
- **Lwalid**
- **Otros** (Gastos comunes de la casa o compartidos)

### 2. 17 Categorías Completas con Subcategorías
1. **Supermercado y Compra** (Comida casa, droguería, limpieza, higiene)
2. **Vivienda y Facturas** (Alquiler/hipoteca, luz, agua, gas, comunidad, internet)
3. **Asignaciones y Apoyo Familiar** (Dinero mensual para Lwalida, Siham, Loujain)
4. **Comer fuera** (Restaurantes, cafeterías, tapas, a domicilio)
5. **Vehículo y Transporte** (Gasolina, taller, ITV, peajes, aparcamiento)
6. **Salud y Farmacia** (Medicamentos, dentista, oculista, consultas)
7. **Cuidado Personal y Ropa** (Peluquería, cosmética, ropa, calzado)
8. **Deporte y Bienestar** (Gimnasio, suplementación, material deportivo)
9. **Suscripciones y Digital** (Streaming, nube, software)
10. **Videojuegos y Gaming** (Juegos, consolas, suscripciones)
11. **Electrónica y Tecnología** (Gadgets, cables, componentes, móviles)
12. **Caprichos y Compras** (Compras personales no esenciales)
13. **Ocio y Tiempo libre** (Cine, eventos, salidas)
14. **Viajes y Escapadas** (Billetes, hoteles, vacaciones)
15. **Equipamiento y Mantenimiento** (Muebles, herramientas, menaje, arreglos casa)
16. **Impuestos y Tasas** (Impuestos locales, tasas, gestoría)
17. **Imprevistos y Emergencias** (Averías urgentes, imprevistos)

### 3. Módulo de Ingresos por Horas y Extras
- **Trabajo 1:** Puente Sur a **7.50 €/h**
- **Trabajo 2:** Sergio a **8.50 €/h**
- **Confirmación en Lote (Batch Approval):** Detecta los días laborables (Lunes a Viernes) pendientes entre el último acceso y hoy, permitiendo modificar horas o marcar "No trabajado" con cálculo en tiempo real: `(Horas Puente Sur * 7.50) + (Horas Sergio * 8.50)`.
- **Ingresos Extra:** Registro puntual con monto, fecha, procedencia y asignación a una persona.

### 4. Dashboard de 4 Cuadrantes y Matriz Cruzada
- **Cuadrante 1:** Total por Categoría con barras de progreso de presupuesto (Verde / Amarillo / Rojo).
- **Cuadrante 2:** Total por Persona con avatares, porcentajes y filtro rápido al hacer clic.
- **Cuadrante 3 (Matriz Cruzada):** Tabla pivote dinámica interactiva `Persona x Categoría` con totales bidireccionales y mapa de calor.
- **Cuadrante 4 (Balance Global):** Desglose de ingresos (Horas + Extras) vs. Gastos = Superávit/Déficit y Tasa de Ahorro (%).

### 5. Auditoría Inteligente & Psicología del Dinero
- Detección de picos y fugas en compras opcionales y comer fuera.
- Traducción automática de gastos a **"Horas de Trabajo Equivalentes"** (media ponderada de 8.00 €/h y jornadas de 8h).

### 6. Huchas de Reserva Virtuales & Gastos Fijos
- Huchas para gastos anuales/semestrales (seguro de coche, vacaciones, fondo de emergencias).
- Gastos fijos programables por día del mes (alquiler, fibra, asignaciones).

---

## 🛠️ Stack Tecnológico
- **Framework:** Next.js 16 (App Router con Turbopack)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 con paleta oscura refinada
- **Iconos:** Lucide Icons
- **Base de Datos:** Firebase / Firestore con sincronización y fallback a LocalStorage

---

## 📦 Ejecución en Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

## 🏗️ Compilación para Producción

```bash
npm run build
npm start
```
