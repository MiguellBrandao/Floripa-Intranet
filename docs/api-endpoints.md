# API Endpoints

Base URL:

```txt
/api
```

## Authentication

### `POST /auth/login`
Expected Request:

```json
{
  "email": "miguellbwork@gmail.com",
  "password": "Nodeapp2107."
}
```

Expected Response `200`:

```json
{
  "accessToken": "<jwt_access_token>",
  "user": {
    "id": "uuid",
    "name": "Miguel Work",
    "email": "miguellbwork@gmail.com",
    "role": "employee"
  }
}
```

Notes:
- Sets `refresh_token` as `HttpOnly` cookie.

### `POST /auth/refresh`
Expected Request:

```txt
Cookie: refresh_token=<jwt_refresh_token>
```

Expected Response `200`:

```json
{
  "accessToken": "<jwt_access_token>"
}
```

Notes:
- Rotates refresh cookie.

### `POST /auth/logout`
Expected Request:

```txt
Cookie: refresh_token=<jwt_refresh_token>
```

Expected Response `200`:

```json
{
  "success": true
}
```

### `GET /auth/me`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
{
  "user": {
    "id": "uuid",
    "name": "Miguel Work",
    "email": "miguellbwork@gmail.com",
    "role": "employee"
  }
}
```

---

## Employees

Access rules:
- `admin`: can create/update/delete employees.
- `employee`: cannot create or delete; can update only own `name` and `phone`.
- List/detail endpoints do not expose users with role `admin` (only role `employee`).
- `employee` sees full own profile; sees only base info of other employees.

### `GET /employees`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
[
  {
    "id": "uuid",
    "email": "miguellbwork@gmail.com",
    "name": "Miguel Work",
    "phone": "912345678",
    "team_ids": ["uuid"]
  }
]
```

### `POST /employees`
Expected Request:

```json
{
  "email": "miguellbwork@gmail.com",
  "password": "Nodeapp2107.",
  "role": "employee",
  "name": "Miguel Work",
  "phone": "912345678",
  "team_ids": ["uuid", "uuid"],
  "active": true
}
```

Expected Response `201`:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "email": "miguellbwork@gmail.com",
  "role": "employee",
  "name": "Miguel Work",
  "phone": "912345678",
  "team_ids": ["uuid", "uuid"],
  "active": true,
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `GET /employees/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "email": "miguellbwork@gmail.com",
  "user_id": "uuid",
  "name": "Miguel Work",
  "phone": "912345678",
  "team_ids": ["uuid", "uuid"],
  "active": true,
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `PATCH /employees/:id`
Expected Request:

```json
{
  "phone": "919999999",
  "active": false
}
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "phone": "919999999"
}
```

### `DELETE /employees/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `204`:

```txt
No Content
```

---

## Teams

Access rules:
- `admin`: can create/update/delete teams.
- `employee`: read-only; can only see teams where they belong.

### `GET /teams`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
[
  {
    "id": "uuid",
    "name": "Team A",
    "created_at": "2026-03-13T10:00:00.000Z"
  }
]
```

### `GET /teams/:id`
Expected Request:

```txt
Path param: id (uuid)
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "name": "Team A",
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `POST /teams`
Expected Request:

```json
{
  "name": "Team A"
}
```

Expected Response `201`:

```json
{
  "id": "uuid",
  "name": "Team A",
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `PATCH /teams/:id`
Expected Request:

```json
{
  "name": "Team A - Updated"
}
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "name": "Team A - Updated"
}
```

### `DELETE /teams/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `204`:

```txt
No Content
```

---

## Gardens (Clients)

Access rules:
- `admin`: can create/update/delete gardens.
- `employee`: read-only (list/details).
- `employee`: only sees gardens where they have current or past tasks.
- `employee`: does not see `monthly_price`, `start_date`, `billing_day`.

### `GET /gardens`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
[
  {
    "id": "uuid",
    "client_name": "Joao Silva",
    "address": "Rua A, Porto",
    "phone": "912345678",
    "maintenance_frequency": "weekly",
    "status": "active",
    "notes": "Cliente premium",
    "created_at": "2026-03-13T10:00:00.000Z"
  }
]
```

### `POST /gardens`
Expected Request:

```json
{
  "client_name": "Joao Silva",
  "address": "Rua A, Porto",
  "phone": "912345678",
  "monthly_price": 120,
  "maintenance_frequency": "weekly",
  "start_date": "2026-03-01",
  "billing_day": 5,
  "status": "active",
  "notes": "Cliente premium"
}
```

Expected Response `201`:

```json
{
  "id": "uuid",
  "client_name": "Joao Silva",
  "address": "Rua A, Porto",
  "phone": "912345678",
  "monthly_price": "120.00",
  "maintenance_frequency": "weekly",
  "start_date": "2026-03-01",
  "billing_day": 5,
  "status": "active",
  "notes": "Cliente premium",
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `GET /gardens/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "client_name": "Joao Silva",
  "address": "Rua A, Porto",
  "phone": "912345678",
  "maintenance_frequency": "weekly",
  "status": "active",
  "notes": "Cliente premium",
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `PATCH /gardens/:id`
Expected Request:

```json
{
  "status": "paused",
  "notes": "Pausado por 1 mes"
}
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "status": "paused"
}
```

### `DELETE /gardens/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `204`:

```txt
No Content
```

---

## Calendar / Tasks

Access rules:
- `admin`: can create/update/delete tasks and view all tasks.
- `employee`: read-only; only sees tasks from their teams (current/past via team membership or work logs).

Allowed `task_type` values:
- `maintenance`
- `pruning`
- `cleaning`
- `installation`
- `inspection`
- `emergency`

### `GET /tasks`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
Optional query params: garden_id, team_id, date_from, date_to
```

Expected Response `200`:

```json
[
  {
    "id": "uuid",
    "garden_id": "uuid",
    "team_id": "uuid",
    "date": "2026-03-14",
    "start_time": "08:00:00",
    "end_time": "11:00:00",
    "task_type": "maintenance",
    "description": "Levar fertilizante",
    "created_at": "2026-03-13T10:00:00.000Z"
  }
]
```

### `POST /tasks`
Expected Request:

```json
{
  "garden_id": "uuid",
  "team_id": "uuid",
  "date": "2026-03-14",
  "start_time": "08:00:00",
  "end_time": "11:00:00",
  "task_type": "maintenance",
  "description": "Levar fertilizante"
}
```

Expected Response `201`:

```json
{
  "id": "uuid",
  "garden_id": "uuid",
  "team_id": "uuid",
  "date": "2026-03-14",
  "start_time": "08:00:00",
  "end_time": "11:00:00",
  "task_type": "maintenance",
  "description": "Levar fertilizante",
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `GET /tasks/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "garden_id": "uuid",
  "team_id": "uuid",
  "date": "2026-03-14",
  "start_time": "08:00:00",
  "end_time": "11:00:00",
  "task_type": "maintenance",
  "description": "Levar fertilizante",
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `PATCH /tasks/:id`
Expected Request:

```json
{
  "start_time": "09:00:00",
  "description": "Atraso por chuva"
}
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "start_time": "09:00:00",
  "description": "Atraso por chuva"
}
```

### `DELETE /tasks/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `204`:

```txt
No Content
```

---

## Work Logs

Access rules:
- `admin`: can create/update/delete any work log and view all.
- `employee`: can create/read/update work logs from own teams.
- `employee`: cannot delete work logs.

### `POST /worklogs`
Expected Request:

```json
{
  "task_id": "uuid",
  "team_id": "uuid",
  "start_time": "2026-03-14T08:00:00.000Z",
  "end_time": "2026-03-14T10:30:00.000Z",
  "description": "Concluido sem incidentes"
}
```

Notes:
- `team_id` must match the task `team_id`.
- `employee` can only create for teams where they belong.

Expected Response `201`:

```json
{
  "id": "uuid",
  "task_id": "uuid",
  "team_id": "uuid",
  "start_time": "2026-03-14T08:00:00.000Z",
  "end_time": "2026-03-14T10:30:00.000Z",
  "description": "Concluido sem incidentes",
  "created_at": "2026-03-14T10:30:00.000Z"
}
```

### `GET /worklogs`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
Optional query params: task_id, team_id, garden_id, start_from, start_to
```

Expected Response `200`:

```json
[
  {
    "id": "uuid",
    "task_id": "uuid",
    "garden_id": "uuid",
    "team_id": "uuid",
    "start_time": "2026-03-14T08:00:00.000Z",
    "end_time": "2026-03-14T10:30:00.000Z",
    "description": "Concluido sem incidentes",
    "created_at": "2026-03-14T10:30:00.000Z"
  }
]
```

### `GET /worklogs/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "task_id": "uuid",
  "garden_id": "uuid",
  "team_id": "uuid",
  "start_time": "2026-03-14T08:00:00.000Z",
  "end_time": "2026-03-14T10:30:00.000Z",
  "description": "Concluido sem incidentes",
  "created_at": "2026-03-14T10:30:00.000Z"
}
```

### `PATCH /worklogs/:id`
Expected Request:

```json
{
  "end_time": "2026-03-14T11:00:00.000Z",
  "description": "Finalizado com atraso"
}
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "end_time": "2026-03-14T11:00:00.000Z",
  "description": "Finalizado com atraso"
}
```

### `DELETE /worklogs/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `204`:

```txt
No Content
```

Notes:
- only `admin` can delete.

---

## Products

Access rules:
- `admin`: can create/update/delete products.
- `employee`: read-only.

Allowed `unit` values:
- `unit`
- `kg`
- `g`
- `l`
- `ml`
- `m`
- `m2`
- `m3`
- `pack`

### `GET /products`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
Optional query params: search
```

Expected Response `200`:

```json
[
  {
    "id": "uuid",
    "name": "Fertilizante X",
    "unit": "kg",
    "stock_quantity": "25.00",
    "created_at": "2026-03-13T10:00:00.000Z"
  }
]
```

### `GET /products/:id`
Expected Request:

```txt
Path param: id (uuid)
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "name": "Fertilizante X",
  "unit": "kg",
  "stock_quantity": "25.00",
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `POST /products`
Expected Request:

```json
{
  "name": "Fertilizante X",
  "unit": "kg",
  "stock_quantity": 25
}
```

Expected Response `201`:

```json
{
  "id": "uuid",
  "name": "Fertilizante X",
  "unit": "kg",
  "stock_quantity": "25.00",
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

### `PATCH /products/:id`
Expected Request:

```json
{
  "stock_quantity": 18
}
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "stock_quantity": 18
}
```

### `DELETE /products/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `204`:

```txt
No Content
```

---

## Product Usage

Access rules:
- `admin`: can view/create/update/delete all usage logs.
- `employee`: can view/create/update only own usage logs.
- `employee`: cannot delete usage logs.
- `employee`: can only register usage for gardens accessible through own teams.
- On create/update/delete, product stock is adjusted automatically.

### `POST /product-usage`
Expected Request:

```json
{
  "product_id": "uuid",
  "garden_id": "uuid",
  "employee_id": "uuid",
  "quantity": 2.5,
  "date": "2026-03-14",
  "notes": "Aplicacao semanal"
}
```

Expected Response `201`:

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "garden_id": "uuid",
  "employee_id": "uuid",
  "quantity": "2.5",
  "date": "2026-03-14",
  "notes": "Aplicacao semanal"
}
```

### `GET /product-usage`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
Optional query params: product_id, garden_id, employee_id, date_from, date_to
```

Expected Response `200`:

```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "product_name": "Fertilizante X",
    "garden_id": "uuid",
    "employee_id": "uuid",
    "quantity": "2.50",
    "date": "2026-03-14",
    "notes": "Aplicacao semanal"
  }
]
```

### `GET /product-usage/:id`
Expected Request:

```txt
Path param: id (uuid)
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "product_name": "Fertilizante X",
  "garden_id": "uuid",
  "employee_id": "uuid",
  "quantity": "2.50",
  "date": "2026-03-14",
  "notes": "Aplicacao semanal"
}
```

### `PATCH /product-usage/:id`
Expected Request:

```json
{
  "quantity": 3.5,
  "notes": "Aplicacao reforcada"
}
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "quantity": 3.5,
  "notes": "Aplicacao reforcada"
}
```

### `DELETE /product-usage/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `204`:

```txt
No Content
```

---

## Payments

Access rules:
- `admin`: can create/update and view payments.
- `employee`: no access to payments endpoints.

### `GET /payments`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
[
  {
    "id": "uuid",
    "garden_id": "uuid",
    "month": 3,
    "year": 2026,
    "amount": "120.00",
    "paid_at": "2026-03-10T12:00:00.000Z",
    "notes": "Pago por transferencia"
  }
]
```

### `GET /payments/:id`
Expected Request:

```txt
Path param: id (uuid)
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "garden_id": "uuid",
  "month": 3,
  "year": 2026,
  "amount": "120.00",
  "paid_at": "2026-03-10T12:00:00.000Z",
  "notes": "Pago por transferencia"
}
```

### `POST /payments`
Expected Request:

```json
{
  "garden_id": "uuid",
  "month": 3,
  "year": 2026,
  "amount": 120,
  "paid_at": "2026-03-10T12:00:00.000Z",
  "notes": "Pago por transferencia"
}
```

Expected Response `201`:

```json
{
  "id": "uuid",
  "garden_id": "uuid",
  "amount": "120.00"
}
```

### `PATCH /payments/:id`
Expected Request:

```json
{
  "amount": 90,
  "notes": "Pagamento parcial"
}
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "amount": "90.00",
  "notes": "Pagamento parcial"
}
```

### `DELETE /payments/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `204`:

```txt
No Content
```

---

## Quotes (Orcamentos)

Access rules:
- `admin`: can view/create/update/delete quotes.
- `employee`: no access to quotes endpoints.

### `GET /quotes`
Expected Request:

```txt
Authorization: Bearer <jwt_access_token>
```

Expected Response `200`:

```json
[
  {
    "id": "uuid",
    "client_name": "Maria Costa",
    "address": "Rua B, Braga",
    "description": "Manutencao mensal",
    "price": "180.00",
    "status": "draft",
    "created_at": "2026-03-13T10:00:00.000Z"
  }
]
```

### `POST /quotes`
Expected Request:

```json
{
  "client_name": "Maria Costa",
  "address": "Rua B, Braga",
  "description": "Manutencao mensal",
  "price": 180,
  "status": "draft"
}
```

Expected Response `201`:

```json
{
  "id": "uuid",
  "status": "draft"
}
```

### `PATCH /quotes/:id`
Expected Request:

```json
{
  "status": "sent"
}
```

Expected Response `200`:

```json
{
  "id": "uuid",
  "status": "sent"
}
```

### `DELETE /quotes/:id`
Expected Request:

```txt
Path param: id (uuid)
```

Expected Response `204`:

```txt
No Content
```
