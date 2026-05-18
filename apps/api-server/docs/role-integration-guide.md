# Role System Integration Guide

## Overview

This guide explains how to integrate the legacy role system (`admin`, `superadmin`, `marketing`) with the new dynamic role-based access control (RBAC) system. The integration provides backward compatibility while enabling the benefits of granular permissions.

## Architecture

### Legacy Role System
- Simple string-based roles: `admin`, `superadmin`, `marketing`
- Basic middleware functions checking `user.role` field
- Limited granularity

### New Dynamic Role System
- Object-based roles with granular permissions
- Hierarchy levels (1-10, lower = higher privilege)
- Resource-specific permissions (read, write, delete, approve)
- Role assignment tracking

## Role Mapping

| Legacy Role | New Role Name | Hierarchy Level | Description |
|-------------|---------------|-----------------|-------------|
| `superadmin` | Super Admin | 1 | Full system access |
| `admin` | Admin | 2 | Administrative access |
| `marketing` | Content Manager | 3 | Content management |

## Integration Strategy

### 1. Enhanced Middleware Functions

The system provides enhanced middleware that checks both legacy and new role systems:

```javascript
// Enhanced middleware functions
exports.enhancedAdminCheck = async (req, res, next) => {
  // Checks legacy role OR new role hierarchy level ≤ 2
};

exports.enhancedSuperAdminCheck = async (req, res, next) => {
  // Checks legacy role OR new role hierarchy level = 1
};

exports.enhancedMarketingAdminCheck = async (req, res, next) => {
  // Checks legacy role OR content management permissions
};
```

### 2. Backward Compatibility

All existing middleware functions remain functional:
- `adminCheck` - checks `user.role === "admin"`
- `superAdminCheck` - checks `user.role === "superadmin"`
- `marketingAdminCheck` - checks `user.role === "marketing"`

### 3. Migration Support

The system provides tools to migrate users from legacy to new roles:

```javascript
// Migrate a user
const result = await roleIntegration.migrateUserRole(userId, "admin");

// Get migration status
const status = await getMigrationStatus();
```

## Usage Examples

### Route Protection

```javascript
// Legacy approach (still works)
router.get("/admin/users", authCheck, adminCheck, userController.getUsers);

// Enhanced approach (supports both systems)
router.get("/admin/users", authCheck, enhancedAdminCheck, userController.getUsers);

// New approach (granular permissions)
router.get("/admin/users", 
  authCheck, 
  requirePermission("User Management", "read"), 
  userController.getUsers
);
```

### Permission Checking

```javascript
// Check if user can access a resource
const canAccess = roleIntegration.canAccessResource(user, "Blogs", "write");

// Get effective role information
const effectiveRole = roleIntegration.getEffectiveRoleInfo(user);
```

### Role Assignment

```javascript
// Validate role assignment
const validation = roleIntegration.validateRoleAssignment(assigner, targetRole);

if (validation.canAssign) {
  // Proceed with assignment
} else {
  console.log(validation.reason);
}
```

## Migration Process

### 1. Assessment Phase

```bash
# Get migration status
GET /api/roles/migration/status

# Test resource access
GET /api/roles/migration/test-access/:userId?resource=Blogs&permission=write
```

### 2. Dry Run Migration

```bash
# Simulate migration without making changes
POST /api/roles/migration/bulk?dryRun=true
```

### 3. Actual Migration

```bash
# Migrate all users
POST /api/roles/migration/bulk

# Migrate specific user
POST /api/roles/migration/user/:userId
```

### 4. Verification

```bash
# Check role compatibility
GET /api/roles/migration/compatibility/:userId

# Validate role assignments
GET /api/roles/migration/validate/:assignerId/:targetRoleId
```

## API Endpoints

### Migration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles/migration/status` | Get migration status for all users |
| POST | `/api/roles/migration/user/:userId` | Migrate specific user |
| POST | `/api/roles/migration/bulk` | Bulk migrate all users |
| GET | `/api/roles/migration/compatibility/:userId` | Get role compatibility analysis |
| GET | `/api/roles/migration/validate/:assignerId/:targetRoleId` | Validate role assignment |
| GET | `/api/roles/migration/mapping` | Get role mapping configuration |
| GET | `/api/roles/migration/test-access/:userId` | Test resource access |

### Utility Functions

```javascript
// Check legacy role access
const hasLegacyRole = roleIntegration.hasLegacyRole(user, ["admin", "superadmin"]);

// Check new role access
const hasNewRole = roleIntegration.hasNewRoleAccess(user, 2);

// Check content permissions
const hasContent = roleIntegration.hasContentPermissions(user);

// Get recommended roles
const recommendations = roleIntegration.getRecommendedRole(user);
```

## Best Practices

### 1. Gradual Migration

- Start with enhanced middleware functions
- Migrate users in batches
- Test thoroughly before full migration

### 2. Permission Design

- Map legacy roles to appropriate hierarchy levels
- Define content resources for marketing roles
- Use granular permissions for sensitive operations

### 3. Error Handling

```javascript
try {
  const result = await roleIntegration.migrateUserRole(userId, role);
} catch (error) {
  if (error.message.includes("Unknown legacy role")) {
    // Handle unknown role
  } else if (error.message.includes("User not found")) {
    // Handle missing user
  }
}
```

### 4. Monitoring

- Track migration progress
- Monitor permission conflicts
- Validate role assignments

## Configuration

### Role Mapping Configuration

```javascript
const ROLE_MAPPING = {
  superadmin: {
    newRoleName: "Super Admin",
    hierarchyLevel: 1,
    permissions: { read: true, write: true, delete: true, approve: true }
  },
  admin: {
    newRoleName: "Admin", 
    hierarchyLevel: 2,
    permissions: { read: true, write: true, delete: false, approve: true }
  },
  marketing: {
    newRoleName: "Content Manager",
    hierarchyLevel: 3,
    permissions: { read: true, write: true, delete: false, approve: false }
  }
};
```

### Content Resources

```javascript
const CONTENT_RESOURCES = [
  "Blogs",
  "Gallery", 
  "Hero Image Slider",
  "Announcements",
  "Newsletter",
  "Media"
];
```

## Troubleshooting

### Common Issues

1. **User has no roleId after migration**
   - Check if default roles exist
   - Verify role mapping configuration
   - Run migration again

2. **Permission conflicts**
   - Check hierarchy levels
   - Verify resource permissions
   - Use compatibility analysis

3. **Legacy middleware not working**
   - Ensure user has legacy role field
   - Check middleware order
   - Verify authentication

### Debug Tools

```javascript
// Get effective role information
const effectiveRole = roleIntegration.getEffectiveRoleInfo(user);
console.log("Effective role:", effectiveRole);

// Test specific permissions
const canWrite = roleIntegration.canAccessResource(user, "Blogs", "write");
console.log("Can write blogs:", canWrite);

// Get recommendations
const recommendations = roleIntegration.getRecommendedRole(user);
console.log("Recommendations:", recommendations);
```

## Migration Checklist

- [ ] Create default roles and resources
- [ ] Test enhanced middleware functions
- [ ] Run migration status assessment
- [ ] Perform dry run migration
- [ ] Execute actual migration
- [ ] Verify role assignments
- [ ] Test permission access
- [ ] Update route protection
- [ ] Monitor system performance
- [ ] Document changes

## Conclusion

This integration provides a smooth transition from the legacy role system to the new dynamic RBAC system while maintaining backward compatibility. The enhanced middleware functions and migration tools ensure a safe and controlled migration process. 