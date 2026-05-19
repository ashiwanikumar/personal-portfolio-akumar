# Role & Resource Management API Documentation

## Overview
This document describes the API endpoints, models, and usage for the dynamic role and resource management system. It enables creation of custom roles with granular permissions for each resource, and allows dynamic management of resources and their available permissions.

The system supports both legacy role-based access control (RBAC) and new dynamic role system with hierarchy levels for backward compatibility.

---

## Models

### Role
- `name` (String, required, unique): Role name
- `slug` (String, auto-generated): URL-friendly name
- `description` (String): Description
- `accessRights` (Array): List of resource permissions
  - `resource` (String): Resource name
  - `permissions` (Object): `{ read, write, delete, approve }` (Boolean)
- `approvalRights` (Boolean): Can approve/reject actions
- `isActive` (Boolean): Role status
- `isSystemRole` (Boolean): System role flag
- `createdBy` (ObjectId): User who created the role
- `hierarchyLevel` (Number): Role hierarchy (1=Super Admin, 2=Admin, 3=Content Manager, 4=Social Media)

### Resource
- `name` (String, required, unique): Resource name
- `slug` (String, auto-generated): URL-friendly name
- `description` (String): Description
- `availablePermissions` (Object): `{ read, write, delete, approve }` (Boolean)
- `category` (String): Resource category
- `isActive` (Boolean): Resource status
- `priority` (Number): Display order
- `icon` (String): UI icon
- `endpoints` (Array): API endpoints for this resource
- `createdBy` (ObjectId): User who created the resource

---

## API Endpoints

### Role Management
- `POST   /api/role` — Create a new role (Super Admin only)
- `GET    /api/roles` — List all roles (supports pagination, filtering)
- `GET    /api/role/:id` — Get a role by ID
- `PUT    /api/role/:id` — Update a role (Super Admin only)
- `DELETE /api/role/:id` — Delete a role (Super Admin only)
- `GET    /api/roles/resources` — List all available resources for role creation
- `GET    /api/roles/resource-categories` — List all resource categories
- `GET    /api/roles/stats` — Get role statistics
- `GET    /api/roles/user-permissions` — Get current user's permissions
- `GET    /api/roles/check-permission/:resource/:permission` — Check if user has a specific permission
- `POST   /api/roles/create-default` — Create default system roles (Super Admin only)

### User Role Management
- `POST   /api/currentSuperAdmin` — Check if current user is super admin (legacy + RBAC)
- `POST   /api/currentAdmin` — Check if current user is admin (legacy + RBAC)
- `POST   /api/currentMarketingAdmin` — Check if current user is marketing admin (legacy + RBAC)
- `POST   /api/super-admin/team/invite` — Invite team members with specific roles
- `POST   /api/super-admin/team/account/activate` — Activate team member accounts
- `GET    /api/super-admin/team/members` — Get team members with role information
- `PUT    /api/user/change-role/:userId` — Change user role (Super Admin only)
- `PUT    /api/user/disable/:userId` — Toggle user account status (Super Admin only)

### Resource Management
- `POST   /api/resource` — Create a new resource (Super Admin only)
- `GET    /api/resources` — List all resources (supports pagination, filtering)
- `GET    /api/resource/:id` — Get a resource by ID
- `PUT    /api/resource/:id` — Update a resource (Super Admin only)
- `DELETE /api/resource/:id` — Delete a resource (Super Admin only)
- `GET    /api/resources/active` — List all active resources
- `GET    /api/resources/category/:category` — List resources by category
- `GET    /api/resources/categories` — List all resource categories
- `POST   /api/resources/create-default` — Create default resources (Super Admin only)
- `GET    /api/resources/stats` — Get resource statistics

---

## Usage

### Creating a Role
- Fetch available resources and permissions from `/api/roles/resources`.
- Present a matrix UI for selecting permissions per resource.
- Submit the role with `name`, `description`, `accessRights`, `approvalRights`, and `hierarchyLevel`.

### Creating a Resource
- POST to `/api/resource` with `name`, `description`, `availablePermissions`, `category`, etc.
- Only Super Admins can create or modify resources.

### Permissions
- Each role can have granular permissions per resource (read, write, delete, approve).
- Use `/api/roles/check-permission/:resource/:permission` to check if a user has a specific permission.

### Legacy Role Compatibility
The system maintains backward compatibility with legacy roles:
- **Legacy**: `user.role === "superadmin"` 
- **RBAC**: `user.roleInfo.hierarchyLevel === 1`
- **Legacy**: `user.role === "admin"`
- **RBAC**: `user.roleInfo.hierarchyLevel === 2`
- **Legacy**: `user.role === "marketing"`
- **RBAC**: `user.roleInfo.hierarchyLevel === 3` OR content permissions

### Team Management
- Super Admins can invite team members with specific roles
- Team invitations are synchronized across all SuperAdmin records
- Users can be assigned both legacy roles and new RBAC roles
- Team member data is properly tracked with invitation history

---

## Example: Role Creation Payload
```json
{
  "name": "Content Manager",
  "description": "Manages content and blog posts",
  "hierarchyLevel": 3,
  "accessRights": [
    { "resource": "Blogs", "permissions": { "read": true, "write": true, "delete": false, "approve": false } },
    { "resource": "Gallery", "permissions": { "read": true, "write": true, "delete": false, "approve": false } },
    { "resource": "Hero Image Slider", "permissions": { "read": true, "write": true, "delete": false, "approve": false } },
    { "resource": "Announcements", "permissions": { "read": true, "write": true, "delete": false, "approve": false } }
  ],
  "approvalRights": false,
  "isActive": true
}
```

## Example: Team Invitation Payload
```json
{
  "email": "newuser@example.com",
  "role": "64f8b2c5e4b0a123456789ab"
}
```

## Example: Role Check Response
```json
{
  "admin": true,
  "message": "Welcome admin!",
  "user": {
    "_id": "64f8b2c5e4b0a123456789ab",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "custom-role-id",
    "roleInfo": {
      "name": "Content Manager",
      "hierarchyLevel": 3,
      "isActive": true,
      "accessRights": [...]
    }
  }
}
```

---

## Best Practices
- Use the resource endpoints to keep the UI in sync with available resources and permissions.
- Only allow Super Admins to manage resources and system roles.
- Validate all permissions and resource names on the backend.
- Use the stats endpoints for admin dashboards and audits.
- Always check both legacy roles and RBAC roles for backward compatibility.
- Use hierarchy levels appropriately (1=Super Admin, 2=Admin, 3=Content Manager, 4=Social Media).
- Sync team invitation data across all SuperAdmin records for consistency.
- Populate `roleInfo` when checking user permissions in controllers.

## Security Considerations
- All role checks should validate both legacy and RBAC systems.
- Team invitations should be properly tracked and synchronized.
- Users should be validated for account status (disabled, activated) before granting access.
- Role hierarchy should be respected (lower numbers = higher privileges).
- Permission-based access should be used for granular control beyond hierarchy levels.

---

## See Also
- `role.js` and `resource.js` in `server/src/models/role/`
- `roleService.js` and `resourceService.js` in `server/src/services/role/`
- `roleController.js` and `resourceController.js` in `server/src/controllers/role/`
- `role.js` in `server/src/routes/role/`
- `auth.js` in `server/src/middlewares/` - Authentication and authorization middleware
- `superAdminController.js`, `adminController.js`, `marketingAdminController.js` in `server/src/controllers/user/`
- `superAdminService.js` in `server/src/services/user/` - Team management and synchronization
- `user.js` in `server/src/models/user/` - User model with roleInfo population
- `MenuItem.jsx` in `client/src/layouts/components/menu/item/` - Frontend navigation with RBAC support 