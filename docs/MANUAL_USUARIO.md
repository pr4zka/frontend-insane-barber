# Manual de Usuario - Insane Barber

Sistema web de gestion para barberia.

---

## 1. Acceso al sistema

### 1.1 Inicio de sesion

1. Abrir el navegador e ingresar a `http://localhost:3001`
2. El sistema muestra la pantalla de inicio de sesion
3. Ingresar el correo electronico y la contrasena
4. Presionar el boton **"Iniciar sesion"**
5. Si las credenciales son correctas, se redirige al panel principal

**Usuarios disponibles:**

| Rol | Correo | Contrasena |
|---|---|---|
| Administrador | admin@insanebarber.com | admin123 |
| Recepcionista | recepcion@insanebarber.com | recep123 |
| Barbero | carlos@insanebarber.com | barbero123 |

### 1.2 Cerrar sesion

1. En la barra lateral izquierda, ubicar la seccion inferior con su nombre de usuario
2. Presionar el icono de salida (flecha)
3. El sistema cierra la sesion y redirige a la pantalla de inicio de sesion

---

## 2. Panel principal (Dashboard)

Al iniciar sesion, se muestra el panel principal con:

- **Tarjetas de resumen**: Turnos del dia, Clientes registrados, Ingresos del dia, Estado de caja
- **Acciones rapidas**: Botones para Agendar Turno, Registrar Cobro y Abrir Caja
- **Turnos recientes**: Tabla con los ultimos 5 turnos registrados

---

## 3. Modulo 1 - Gestion de Servicios

### 3.1 Servicios

**Ver servicios:**
1. En la barra lateral, hacer clic en **Servicios**
2. Se muestra la tabla con todos los servicios registrados (nombre, descripcion, precio, duracion, estado)

**Crear servicio:**
1. Presionar el boton **"Nuevo Servicio"**
2. Completar el formulario:
   - **Nombre**: Nombre del servicio (ej: "Corte de cabello")
   - **Descripcion**: Detalle del servicio
   - **Precio**: Monto en guaranies (ej: 35000)
   - **Duracion**: Tiempo en minutos (ej: 30)
   - **Estado**: Activar o desactivar el servicio
3. Presionar **"Guardar"**

**Editar servicio:**
1. Hacer clic en cualquier fila de la tabla de servicios
2. Modificar los campos deseados
3. Presionar **"Guardar"**

### 3.2 Promociones

1. Ir a **Promociones** en la barra lateral
2. Presionar **"Nueva Promocion"** para abrir el formulario
3. Completar: nombre, descripcion, porcentaje de descuento, fecha de inicio, fecha de fin, estado
4. Presionar **"Guardar"**

### 3.3 Descuentos

1. Ir a **Descuentos** en la barra lateral
2. Presionar **"Nuevo Descuento"**
3. Completar: nombre, descripcion, porcentaje, estado
4. Presionar **"Guardar"**

### 3.4 Reclamos

**Registrar reclamo:**
1. Ir a **Reclamos** en la barra lateral
2. Presionar **"Nuevo Reclamo"**
3. Seleccionar el cliente en el desplegable
4. Escribir la descripcion del reclamo
5. Presionar **"Guardar"**

**Dar seguimiento a un reclamo:**
1. En la lista de reclamos, hacer clic en el reclamo deseado
2. Se abre la pantalla de detalle con el historial de seguimiento
3. En la seccion inferior, escribir un comentario de seguimiento
4. Seleccionar el nuevo estado:
   - **En proceso**: El reclamo esta siendo atendido
   - **Resuelto**: El reclamo fue solucionado
5. Presionar **"Agregar Seguimiento"**

### 3.5 Presupuestos

**Crear presupuesto:**
1. Ir a **Presupuestos** en la barra lateral
2. Presionar **"Nuevo Presupuesto"**
3. Seleccionar el cliente
4. Agregar servicios al detalle:
   - Seleccionar un servicio del desplegable
   - Indicar la cantidad
   - El precio unitario se completa automaticamente
   - El subtotal se calcula automaticamente
5. Presionar **"Agregar servicio"** para agregar mas lineas
6. Agregar observaciones si es necesario
7. Presionar **"Guardar"**

**Ver detalle y descargar PDF:**
1. En la lista de presupuestos, hacer clic en el presupuesto deseado
2. Se muestra el detalle con todos los servicios y el total
3. Presionar **"Descargar PDF"** para obtener el documento

### 3.6 Insumos

1. Ir a **Insumos** en la barra lateral
2. Presionar **"Nuevo Insumo"**
3. Completar: nombre, descripcion, unidad de medida (ml, g, unidad), stock inicial, estado
4. Presionar **"Guardar"**

---

## 4. Modulo 2 - Agenda y Clientes

### 4.1 Clientes

**Registrar cliente:**
1. Ir a **Clientes** en la barra lateral
2. Presionar **"Nuevo Cliente"**
3. Completar: nombre, telefono, correo electronico
4. Presionar **"Guardar"**

**Editar cliente:**
1. Hacer clic en el cliente en la tabla
2. Modificar los datos
3. Presionar **"Guardar"**

### 4.2 Agenda de turnos

**Ver turnos del dia:**
1. Ir a **Agenda** en la barra lateral
2. Por defecto se muestra la fecha de hoy
3. Cambiar la fecha con el selector para ver otros dias
4. Filtrar por barbero usando el desplegable (o seleccionar "Todos")

**Agendar nuevo turno:**
1. Presionar **"Nuevo Turno"**
2. Completar el formulario:
   - **Cliente**: Seleccionar del desplegable
   - **Servicio**: Seleccionar del desplegable
   - **Barbero**: Seleccionar del desplegable
   - **Fecha**: Seleccionar la fecha
   - **Hora**: Seleccionar la hora
   - **Observacion**: Comentario opcional
3. Presionar **"Guardar"**

**Gestionar turnos (desde la tabla de agenda):**

| Accion | Cuando aparece | Que hace |
|---|---|---|
| **Confirmar** | Turno en estado "Pendiente" | Cambia el estado a "Confirmado" |
| **Atendido** | Turno en estado "Confirmado" | Cambia el estado a "Atendido" |
| **Cancelar** | Turno "Pendiente" o "Confirmado" | Cancela el turno (pide confirmacion) |

**Flujo tipico de un turno:**
```
Pendiente --> Confirmado --> Atendido --> Cobrado
```

---

## 5. Modulo 3 - Caja y Ventas

### 5.1 Caja

**Abrir caja:**
1. Ir a **Caja** en la barra lateral
2. Si no hay caja abierta, aparece el formulario de apertura
3. Ingresar el **monto inicial** (efectivo con el que se inicia el dia)
4. Presionar **"Abrir Caja"**

**Registrar movimiento de caja:**
1. Con la caja abierta, presionar **"Nuevo Movimiento"**
2. Seleccionar el tipo:
   - **Ingreso**: Dinero que entra (ej: venta, aporte)
   - **Egreso**: Dinero que sale (ej: compra de insumos, gasto)
3. Escribir el concepto (descripcion del movimiento)
4. Ingresar el monto
5. Presionar **"Guardar"**

**Cerrar caja:**
1. En la seccion "Cerrar Caja", ingresar el **monto final contado** (efectivo real en caja)
2. Presionar **"Cerrar Caja"**
3. Confirmar la accion en el dialogo
4. El sistema muestra un resumen con:
   - Monto inicial
   - Monto final contado
   - Diferencia (sobrante o faltante)

### 5.2 Cobros

**Registrar cobro:**
1. Ir a **Cobros** en la barra lateral
2. Presionar **"Nuevo Cobro"**
3. Seleccionar el **turno atendido** del desplegable
   - Solo aparecen turnos con estado "Atendido"
   - Se muestra la informacion del cliente, servicio y monto
4. **(Opcional) Aplicar promocion o descuento:**
   - En el campo **"Promocion o Descuento"**, seleccionar una opcion:
     - **Sin descuento**: No se aplica ningun descuento (opcion por defecto)
     - **Aplicar Promocion**: Muestra las promociones activas y vigentes en la fecha actual
     - **Aplicar Descuento**: Muestra los descuentos activos
   - Al seleccionar una promocion o descuento, se muestra un resumen con:
     - Monto original del servicio
     - Porcentaje de descuento aplicado
     - Monto final a cobrar
   - **Nota:** No se puede aplicar una promocion y un descuento al mismo tiempo
5. Seleccionar el **metodo de pago**:
   - **Efectivo**: Cobro directo en efectivo
   - **Dpago**: Cobro digital (seleccionar plataforma: Tigo, Personal, QR, etc.)
6. Verificar el monto (se completa automaticamente)
7. Presionar **"Registrar Cobro"**

**Cobro en efectivo:**
- Se registra el pago (con el monto ya descontado si se aplico promocion/descuento)
- Se crea un movimiento de ingreso en la caja
- Se registra en el libro de ventas (el concepto indica el porcentaje aplicado)
- El turno cambia a estado "Cobrado"

**Cobro con Dpago:**
- Se crea una transaccion en la pasarela de pago
- El pago queda en estado "Pendiente" hasta que se confirme
- Una vez confirmado, se registra en caja y libro de ventas

### 5.3 Libro de ventas

1. Ir a **Libro de Ventas** en la barra lateral
2. Se muestra el registro de todas las ventas realizadas
3. Filtrar por:
   - **Fecha desde / hasta**: Rango de fechas
   - **Metodo de pago**: Todos, Efectivo o Dpago
4. Presionar **"Filtrar"** para aplicar
5. En la parte inferior se muestra el **total** de las ventas filtradas

### 5.4 Notas de credito y debito

**Crear nota:**
1. Ir a **Notas C/D** en la barra lateral
2. Presionar **"Nueva Nota"**
3. Seleccionar el **pago** asociado
4. Seleccionar el **tipo**:
   - **Credito**: Devolucion o ajuste a favor del cliente
   - **Debito**: Cobro adicional al cliente
5. Ingresar el monto y el motivo
6. Presionar **"Guardar"**

### 5.5 Recaudaciones a depositar

1. Ir a **Recaudaciones** en la barra lateral
2. Se muestran tres tarjetas de resumen:
   - **Total Recaudado**: Suma de todas las recaudaciones
   - **Efectivo**: Total cobrado en efectivo
   - **Dpago**: Total cobrado por medios digitales
3. La tabla muestra el detalle agrupado por fecha y metodo de pago

### 5.6 Notas de Remision de Venta

Las notas de remision de venta son documentos de entrega de servicios a clientes. Sirven como comprobante de que el servicio fue prestado y entregado al cliente.

**Ver notas de remision:**
1. Ir a **Notas de Remision** dentro del Modulo 3 en la barra lateral
2. Se muestra la lista de notas emitidas con datos del cliente, turno asociado y fecha

**Crear nota de remision:**
1. Presionar **"Nueva Nota"**
2. Seleccionar el **turno atendido/cobrado** del desplegable
   - Solo aparecen turnos con estado "Atendido" o "Cobrado"
   - Se muestra la informacion del cliente y el servicio prestado
3. Agregar una **observacion** opcional (detalles adicionales sobre la entrega del servicio)
4. Presionar **"Guardar"**

---

## 6. Modulo 4 - Compras

### 6.1 Proveedores

**Acceder:** En la barra lateral, ir a **Modulo 4 > Proveedores**

**Ver proveedores:**
1. Se muestra la tabla con todos los proveedores registrados (nombre, RUC, telefono, email, direccion, estado)

**Crear proveedor:**
1. Presionar el boton **"Nuevo Proveedor"**
2. Completar el formulario:
   - **Nombre**: Nombre o razon social del proveedor
   - **RUC**: Registro Unico de Contribuyente
   - **Telefono**: Numero de contacto
   - **Email**: Correo electronico
   - **Direccion**: Direccion del proveedor
3. Presionar **"Guardar"**

**Editar proveedor:**
1. Hacer clic en un proveedor de la lista
2. Modificar los datos deseados
3. Presionar **"Guardar"**

**Activar/desactivar proveedor:**
1. En la pantalla de edicion del proveedor, utilizar el **switch de estado** para activar o desactivar
2. Los proveedores desactivados no aparecen en los desplegables de seleccion

### 6.2 Ordenes de Compra

**Crear orden de compra:**
1. Ir a **Ordenes de Compra** en la barra lateral
2. Presionar **"Nueva Orden"**
3. Seleccionar el **proveedor** del desplegable
4. Agregar insumos al detalle:
   - Seleccionar un insumo del desplegable
   - Indicar la **cantidad**
   - Ingresar el **precio unitario**
   - El subtotal se calcula automaticamente
5. Presionar **"Agregar insumo"** para agregar mas lineas
6. Presionar **"Guardar"**

**Flujo de estados de una orden:**
```
Pendiente --> Aprobada --> Recibida
                |
                +--> Cancelada
```
- Una orden nueva se crea en estado **Pendiente**
- Puede ser **Aprobada** o **Cancelada** desde el estado Pendiente
- Una orden aprobada puede ser **Recibida** o **Cancelada**

**Aprobar orden:**
1. Desde el detalle de la orden en estado "Pendiente", presionar **"Aprobar"**
2. Confirmar la accion en el dialogo

**Recibir mercaderia:**
1. Desde el detalle de la orden en estado "Aprobada", presionar **"Recibir Mercaderia"**
2. Confirmar la accion en el dialogo
3. Al recibir, el sistema automaticamente:
   - Actualiza el **stock** de los insumos incluidos en la orden
   - Crea un registro en el **libro de compras**
   - Genera una **nota de remision de compra** asociada

**Cancelar orden:**
1. Desde el detalle de la orden (en estado "Pendiente" o "Aprobada"), presionar **"Cancelar"**
2. Confirmar la accion en el dialogo
3. Solo se puede cancelar si la orden no fue recibida

**Descargar PDF:**
1. Desde el detalle de la orden, presionar el boton **"Descargar PDF"**
2. Se genera un documento PDF con los datos de la orden, el proveedor y el detalle de insumos

### 6.3 Libro de Compras

El libro de compras registra automaticamente todas las compras cuya mercaderia fue recibida.

1. Ir a **Libro de Compras** en la barra lateral
2. Se muestra la tabla con todas las compras registradas (fecha, proveedor, numero de orden, total)
3. Filtrar por:
   - **Fecha desde / hasta**: Rango de fechas
4. Presionar **"Filtrar"** para aplicar
5. Presionar **"Descargar PDF"** para obtener el reporte en formato PDF

### 6.4 Notas de Remision (Compras)

Las notas de remision de compras son documentos que se generan automaticamente cuando se recibe la mercaderia de una orden de compra. Sirven como comprobante de recepcion de los insumos.

1. Ir a **Notas de Remision** dentro del Modulo 4 en la barra lateral
2. Se muestra la lista de notas de remision con:
   - Datos del proveedor
   - Numero de orden de compra asociada
   - Fecha de recepcion
   - Observaciones

### 6.5 Notas C/D de Compras

Las notas de credito y debito de compras permiten registrar ajustes sobre compras ya recibidas.

**Crear nota:**
1. Ir a **Notas C/D de Compras** en la barra lateral
2. Presionar **"Nueva Nota"**
3. Seleccionar la **orden de compra recibida** del desplegable
4. Seleccionar el **tipo**:
   - **Credito**: Devolucion o ajuste a favor de la barberia (ej: devolucion de insumos defectuosos)
   - **Debito**: Cobro adicional del proveedor (ej: ajuste de precio)
5. Ingresar el **monto** y el **motivo**
6. Presionar **"Guardar"**

**Anular nota:**
1. En la lista de notas, ubicar la nota a anular
2. Presionar el boton **"Anular"**
3. Confirmar la accion en el dialogo

### 6.6 Ajustes de Compra

Los ajustes de compra permiten realizar correcciones de cantidad o precio sobre ordenes de compra que ya fueron recibidas.

**Crear ajuste:**
1. Ir a **Ajustes de Compra** en la barra lateral
2. Presionar **"Nuevo Ajuste"**
3. Completar el formulario:
   - **Orden de compra**: Seleccionar la orden recibida del desplegable
   - **Tipo de ajuste**: Seleccionar el tipo de correccion (cantidad o precio)
   - **Monto anterior**: El valor original que se desea corregir
   - **Monto nuevo**: El valor corregido
   - **Descripcion**: Motivo del ajuste
4. Presionar **"Guardar"**

---

## 7. Reportes

1. Ir a **Reportes** en la barra lateral
2. Seleccionar la pestana del reporte deseado:

### 7.1 Reporte de Ingresos
- Seleccionar fecha desde y fecha hasta
- Presionar **"Generar Reporte"**
- Muestra: Fecha, Total, Cantidad de operaciones

### 7.2 Reporte de Turnos
- Seleccionar fecha desde, fecha hasta, y opcionalmente un barbero
- Presionar **"Generar Reporte"**
- Muestra: Barbero, Total turnos, Atendidos, Cancelados

### 7.3 Reporte de Servicios
- Seleccionar fecha desde y fecha hasta
- Presionar **"Generar Reporte"**
- Muestra: Servicio, Cantidad de veces solicitado, Ingresos generados

### 7.4 Reporte de Reclamos
- Seleccionar fecha desde y fecha hasta
- Presionar **"Generar Reporte"**
- Muestra: Cliente, Descripcion, Fecha, Estado

---

## 8. Gestion de Usuarios

*(Solo disponible para el rol Administrador)*

1. Ir a **Usuarios** en la barra lateral
2. Se muestra la lista de usuarios del sistema
3. Presionar **"Nuevo Usuario"** para crear uno
4. Completar el formulario:
   - **Nombre**: Nombre completo
   - **Email**: Correo electronico (sera el usuario de acceso)
   - **Contrasena**: Minimo 6 caracteres
   - **Rol**: Administrador, Recepcionista o Barbero
   - **Estado**: Activo o inactivo
5. Presionar **"Guardar"**

---

## 9. Roles y permisos

| Funcionalidad | Administrador | Recepcionista | Barbero |
|---|:---:|:---:|:---:|
| Dashboard | Si | Si | Si |
| Gestionar servicios | Si | Ver | No |
| Promociones y descuentos | Si | No | No |
| Registrar reclamos | Si | Si | No |
| Seguimiento de reclamos | Si | Si | No |
| Presupuestos | Si | Si | No |
| Insumos | Si | No | No |
| Gestionar clientes | Si | Si | No |
| Agenda de turnos | Si | Si | Ver |
| Confirmar/cancelar turnos | Si | Si | No |
| Registrar atencion | Si | Si | Si |
| Abrir/cerrar caja | Si | Si | No |
| Registrar cobros | Si | Si | No |
| Libro de ventas | Si | Si | No |
| Notas de credito/debito (ventas) | Si | No | No |
| Notas de remision de venta | Si | Si | No |
| Recaudaciones | Si | No | No |
| Proveedores | Si | No | No |
| Ordenes de compra | Si | No | No |
| Libro de compras | Si | No | No |
| Notas de remision (compras) | Si | No | No |
| Notas C/D de compras | Si | No | No |
| Ajustes de compra | Si | No | No |
| Gestionar usuarios | Si | No | No |
| Reportes | Si | Si | No |
| Exportacion de PDF | Si | Si | No |

---

## 10. Exportacion de PDF

El sistema ofrece la funcionalidad de descarga en formato PDF en distintas secciones. A continuacion se listan las areas donde esta disponible:

| Seccion | Ubicacion del boton | Descripcion |
|---|---|---|
| **Reportes** | Boton **"Descargar PDF"** en cada pestana de reportes | Genera un PDF con los datos del reporte filtrado (Ingresos, Turnos, Servicios, Reclamos) |
| **Libro de Ventas** | Boton **"Descargar PDF"** | Genera un PDF con el registro de ventas filtrado por fecha y metodo de pago |
| **Libro de Compras** | Boton **"Descargar PDF"** | Genera un PDF con el registro de compras filtrado por fecha |
| **Cobros** | Icono **PDF** en cada fila de la tabla | Genera un comprobante de cobro individual en formato PDF |
| **Presupuestos** | Boton **"Descargar PDF"** en el detalle | Genera un PDF con el detalle del presupuesto, servicios incluidos y total |
| **Ordenes de Compra** | Boton **"Descargar PDF"** en el detalle | Genera un PDF con los datos de la orden, proveedor e insumos solicitados |
| **Recaudaciones** | Boton **"Descargar PDF"** | Genera un PDF con el resumen de recaudaciones por fecha y metodo de pago |

---

## 11. Flujo operativo diario recomendado

### Inicio del dia
1. Iniciar sesion con el usuario recepcionista o administrador
2. Ir a **Caja** y abrir la caja del dia con el monto inicial
3. Verificar los turnos del dia en **Agenda**

### Durante el dia
4. Registrar nuevos clientes si es necesario
5. Agendar turnos para clientes
6. Confirmar turnos cuando los clientes llegan
7. Marcar turnos como "Atendido" cuando el barbero termina
8. Registrar el cobro correspondiente (efectivo o Dpago)
9. Registrar reclamos si los hay

### Cierre del dia
10. Revisar el **Libro de Ventas** del dia
11. Ir a **Caja** y cerrar la caja ingresando el monto final contado
12. Verificar que no haya diferencias significativas
13. Consultar **Reportes** si se necesita analisis

---

## 12. Resolucion de problemas frecuentes

| Problema | Solucion |
|---|---|
| No puedo iniciar sesion | Verificar que el correo y contrasena sean correctos. Las contrasenas son sensibles a mayusculas y minusculas |
| La pagina muestra "Cargando..." indefinidamente | Verificar que el backend este corriendo en `http://localhost:3000`. Refrescar la pagina |
| No aparecen turnos en la agenda | Verificar que la fecha seleccionada sea correcta. Crear turnos desde "Nuevo Turno" |
| No puedo registrar un cobro | Verificar que el turno este en estado "Atendido" y que haya una caja abierta |
| No aparecen promociones al cobrar | Las promociones deben estar activas y la fecha actual debe estar dentro del rango de vigencia (fecha inicio - fecha fin) |
| No aparecen descuentos al cobrar | Los descuentos deben tener el estado activo. Verificar en la seccion "Descuentos" |
| Error al cerrar caja | Verificar que se ingreso un monto final valido (numero positivo) |
| No puedo crear usuarios | Solo el rol Administrador tiene acceso a la gestion de usuarios |
| La sesion se cerro sola | El token de sesion expira despues de 24 horas. Volver a iniciar sesion |
