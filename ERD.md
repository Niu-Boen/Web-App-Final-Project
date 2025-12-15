# Entity Relationship Diagram (ERD)

## APIU Cafeteria Operation System Database Schema

### Tables and Relationships

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │   CATEGORIES    │    │   MENU_ITEMS    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ student_id      │    │ name            │    │ name            │
│ name            │    │ description     │    │ description     │
│ email           │    │ image           │    │ price           │
│ password        │    │ parent_id (FK)  │◄──┐│ image           │
│ role            │    │ is_active       │   ││ ingredients     │
│ gender          │    │ sort_order      │   ││ allergens       │
│ account_balance │    │ created_at      │   ││ category_id(FK) │◄─┐
│ nfc_token       │    │ updated_at      │   ││ is_available    │  │
│ avatar          │    └─────────────────┘   ││ is_featured     │  │
│ last_login_at   │           │              ││ preparation_time│  │
│ is_active       │           │              ││ stock_quantity  │  │
│ created_at      │           │              ││ created_at      │  │
│ updated_at      │           │              ││ updated_at      │  │
└─────────────────┘           │              │└─────────────────┘  │
         │                    │              │                     │
         │                    │              │                     │
         │                    │              │                     │
         │                    │              │                     │
         ▼                    ▼              │                     │
┌─────────────────┐    ┌─────────────────┐   │                     │
│     ORDERS      │    │ TRUSTED_FRIENDS │   │                     │
├─────────────────┤    ├─────────────────┤   │                     │
│ id (PK)         │    │ id (PK)         │   │                     │
│ order_number    │    │ user_id (FK)    │ ◄─┘                     │
│ user_id (FK)    │◄─┐ │ friend_id (FK)  │                         │
│ total_amount    │  │ │ permission_type │                         │
│ status          │  │ │ expires_at      │                         │
│ payment_status  │  │ │ usage_limit     │                         │
│ pickup_time     │  │ │ usage_count     │                         │
│ pickup_person_* │  │ │ is_active       │                         │
│ special_instruc*│  │ │ created_at      │                         │
│ confirmed_at    │  │ │ updated_at      │                         │
│ ready_at        │  │ └─────────────────┘                         │
│ completed_at    │  │                                             │
│ created_at      │  │                                             │
│ updated_at      │  │                                             │
└─────────────────┘  │                                             │
         │           │                                             │
         │           │                                             │
         ▼           │                                             │
┌─────────────────┐  │                                             │
│   ORDER_ITEMS   │  │                                             │
├─────────────────┤  │                                             │
│ id (PK)         │  │                                             │
│ order_id (FK)   │◄─┘                                             │
│ menu_item_id(FK)│◄───────────────────────────────────────────────┘
│ quantity        │
│ unit_price      │
│ total_price     │
│ special_requests│
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│ ACTIVITY_LOGS   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │◄─┐
│ action          │  │
│ model_type      │  │
│ model_id        │  │
│ old_values      │  │
│ new_values      │  │
│ ip_address      │  │
│ user_agent      │  │
│ created_at      │  │
│ updated_at      │  │
└─────────────────┘  │
                     │
                     │
                     │
              ┌──────┘
              │
              ▼
        (Connected to USERS)
```

### Relationship Types

#### 1-to-Many Relationships
- **Users → Orders**: One user can have many orders
- **Users → TrustedFriends**: One user can have many trusted friends
- **Users → ActivityLogs**: One user can have many activity logs
- **Categories → MenuItems**: One category can have many menu items
- **Categories → Categories**: Self-referencing (parent-child categories)
- **Orders → OrderItems**: One order can have many order items
- **MenuItems → OrderItems**: One menu item can be in many order items

#### Many-to-Many Relationships
- **Users ↔ Users** (via TrustedFriends): Users can trust each other for pickup

#### Self-Referencing Relationships
- **Categories**: parent_id references categories.id for hierarchical structure

### Key Constraints

#### Primary Keys
- All tables have auto-incrementing `id` as primary key

#### Foreign Keys
- `categories.parent_id` → `categories.id`
- `menu_items.category_id` → `categories.id`
- `orders.user_id` → `users.id`
- `order_items.order_id` → `orders.id`
- `order_items.menu_item_id` → `menu_items.id`
- `trusted_friends.user_id` → `users.id`
- `trusted_friends.friend_id` → `users.id`
- `activity_logs.user_id` → `users.id`

#### Unique Constraints
- `users.student_id` - Unique student identifier
- `users.email` - Unique email address
- `orders.order_number` - Unique order number
- `trusted_friends(user_id, friend_id)` - Unique friendship pair

#### Indexes
- `categories(parent_id, is_active)` - For category filtering
- `menu_items(category_id, is_available)` - For menu queries
- `orders(user_id, status)` - For user order queries
- `order_items(order_id, menu_item_id)` - For order item queries
- `trusted_friends(user_id, is_active)` - For friend queries
- `activity_logs(user_id, action)` - For activity queries
- `activity_logs(model_type, model_id)` - For model activity queries

### Data Types

#### Enums
- `users.role`: 'admin', 'staff', 'student'
- `users.gender`: 'male', 'female'
- `orders.status`: 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
- `orders.payment_status`: 'pending', 'paid', 'failed', 'refunded'
- `trusted_friends.permission_type`: 'permanent', 'temporary'

#### JSON Fields
- `menu_items.ingredients`: Array of ingredient names
- `menu_items.allergens`: Array of allergen names
- `activity_logs.old_values`: Previous values for audit
- `activity_logs.new_values`: New values for audit

#### Decimal Fields
- `users.account_balance`: DECIMAL(10,2) - Account balance in Thai Baht
- `menu_items.price`: DECIMAL(8,2) - Item price
- `orders.total_amount`: DECIMAL(10,2) - Order total
- `order_items.unit_price`: DECIMAL(8,2) - Price per unit
- `order_items.total_price`: DECIMAL(10,2) - Total for line item

### Business Rules Enforced by Schema

1. **Account Balance**: Cannot go negative (enforced by application logic)
2. **Order Integrity**: Orders must have at least one order item
3. **Category Hierarchy**: Categories can have parent-child relationships
4. **Friend Permissions**: Users cannot add themselves as trusted friends
5. **Order Status Flow**: Status changes follow business logic
6. **Audit Trail**: All significant actions are logged
7. **Soft Deletes**: Important records use soft deletion with timestamps
8. **Referential Integrity**: Foreign key constraints maintain data consistency