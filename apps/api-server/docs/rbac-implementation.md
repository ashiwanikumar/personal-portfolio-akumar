# Role-Based Access Control (RBAC) Implementation

## Overview

This document outlines the comprehensive Role-Based Access Control (RBAC) system implemented for the Shivraj Singh Chouhan website administration portal. The system provides granular permission management with role hierarchy and Super Admin protection.

## Architecture

### Core Components

1. **Permission Middleware** (`server/src/middlewares/permissionMiddleware.js`)
2. **Role Management** (`server/src/models/role/role.js`)
3. **User-Role Association** (`server/src/models/user/user.js`)
4. **Super Admin Protection** (Backend controllers and frontend components)

## Role Hierarchy

### Role Levels (from highest to lowest)

1. **Super Admin** (Level 4)
   - Full system access
   - Cannot be disabled or modified by other users
   - Can invite, manage, and remove team members
   - Can assign and modify user roles

2. **Admin** (Level 3)
   - Administrative access with most permissions
   - Can manage team members and content
   - Can approve/reject content
   - Limited access to system settings

3. **Content Manager** (Level 2)
   - Manages content and blog posts
   - Can create, edit, and manage content
   - Can manage blog posts and announcements
   - Can upload and manage media files

4. **Social Media** (Level 1)
   - Social media management and content creation
   - Can manage social media content
   - Can create and edit posts
   - Can access analytics and reports

5. **User** (Level 0)
   - Basic user access
   - Read-only access to most features

## Permission System

### Resource-Based Permissions

Each role has access to specific resources with defined actions:

```javascript
const rolePermissions = {
  "superadmin": {
    "team": ["create", "read", "update", "delete"],
    "content": ["create", "read", "update", "delete"],
    "analytics": ["read"],
    "settings": ["read", "update"],
    "users": ["create", "read", "update", "delete"]
  },
  "admin": {
    "team": ["create", "read", "update"],
    "content": ["create", "read", "update", "delete"],
    "analytics": ["read"],
    "settings": ["read"],
    "users": ["read", "update"]
  },
  "content-manager": {
    "content": ["create", "read", "update"],
    "analytics": ["read"]
  },
  "social-media": {
    "content": ["create", "read", "update"],
    "analytics": ["read"]
  }
};
```

## Implementation Details

### 1. Permission Middleware

The permission middleware provides several functions:

```javascript
// Check specific permissions
const checkPermission = (requiredPermissions) => {
  // Validates user role and permissions
};

// Super Admin only access
const superAdminOnly = (req, res, next) => {
  // Ensures only Super Admins can access
};

// Admin or higher access
const adminOrHigher = (req, res, next) => {
  // Allows Admin level and above
};

// Content Manager or higher access
const contentManagerOrHigher = (req, res, next) => {
  // Allows Content Manager level and above
};
```

### 2. Route Protection

Routes are protected using the middleware:

```javascript
// Super Admin only routes
router.post("/team-invite", superAdminOnly, superAdminController.teamInvite);
router.get("/team-members", superAdminOnly, superAdminController.getTeamMembers);

// Admin or higher routes
router.get("/search-users", adminOrHigher, superAdminController.searchUsers);
```

### 3. Super Admin Protection

#### Backend Protection

1. **Role Assignment Protection**
   ```javascript
   // Prevents Super Admin roles from being modified
   if (userToChange.role === "superadmin") {
     return res.status(403).json({
       success: false,
       message: "Super Admin roles cannot be modified",
     });
   }
   ```

2. **Account Disable Protection**
   ```javascript
   // Prevents Super Admin accounts from being disabled
   if (userToDisable.role === "superadmin") {
     return res.status(403).json({
       success: false,
       message: "Super Admin accounts cannot be disabled",
     });
   }
   ```

#### Frontend Protection

1. **UI Element Disabling**
   - Role change options are disabled for Super Admin users
   - Account disable options are disabled for Super Admin users
   - Visual indicators show "Protected" status

2. **Modal Protection**
   - ChangeRoleModal shows warning for Super Admin users
   - Role selection is disabled for Super Admin users

### 4. Team Invitation System

#### Enhanced Invitation Modal

The `TeamInviteModal` includes:

1. **Role Selection**
   - Dropdown with all available roles
   - Role descriptions and permissions display
   - Real-time permission preview

2. **Role Descriptions**
   - Clear explanation of each role's capabilities
   - Permission breakdown for each role
   - Super Admin protection warnings

3. **Email Template Enhancement**
   - Role information included in invitation emails
   - Permission descriptions in email
   - Clear role expectations

#### Invitation Process

1. **Role Assignment**
   ```javascript
   const invitation = {
     email,
     role, // Role ID or role name
     status: "pending",
     date: new Date(),
     invitedBy: {
       userId: req.user._id,
       name: inviterUser.name,
       email: inviterUser.email,
       role: inviterUser.role,
     },
   };
   ```

2. **Token Generation**
   ```javascript
   const payload = { 
     email: email, 
     role: role, 
     superAdminId: superAdmin._id 
   };
   const joiningToken = jwt.sign(payload, process.env.JWT_EMAIL_SECRET);
   ```

3. **Account Activation**
   ```javascript
   // Role is assigned during account activation
   newUser.role = tokenData?.role;
   if (/^[a-fA-F0-9]{24}$/.test(tokenData?.role)) {
     newUser.roleId = tokenData?.role;
   }
   ```

## Frontend Components

### 1. TeamInviteModal

- **Role Selection**: Dropdown with role descriptions
- **Permission Display**: Real-time permission preview
- **Validation**: Ensures role is selected before sending invitation
- **Super Admin Protection**: Warning for Super Admin role selection

### 2. ChangeRoleModal

- **Current Role Display**: Shows user's current role
- **Role Selection**: Dropdown for new role assignment
- **Super Admin Protection**: Disabled for Super Admin users
- **Permission Preview**: Shows permissions for selected role

### 3. TeamList Component

- **Action Menus**: Disabled for Super Admin users
- **Visual Indicators**: Shows "Protected" status
- **Role-Based Actions**: Different actions based on user role

## Security Features

### 1. Super Admin Protection

- **Immutable Roles**: Super Admin roles cannot be changed
- **Account Protection**: Super Admin accounts cannot be disabled
- **Permission Inheritance**: Super Admins have all permissions
- **UI Protection**: Frontend prevents Super Admin modifications

### 2. Role Hierarchy Enforcement

- **Level-Based Access**: Higher roles can manage lower roles
- **Permission Inheritance**: Higher roles inherit lower role permissions
- **Assignment Restrictions**: Users can only assign roles below their level

### 3. Token Security

- **JWT Tokens**: Secure token-based invitation system
- **Expiration**: Tokens expire after 30 minutes
- **Role Encoding**: Role information encoded in invitation tokens

## API Endpoints

### Protected Routes

```javascript
// Super Admin only
POST /api/super-admin/team-invite
GET /api/super-admin/team-members
PUT /api/super-admin/toggle-disable-user/:userId
PUT /api/super-admin/change-user-role/:userId

// Admin or higher
GET /api/super-admin/search-users
```

### Permission Checks

```javascript
// Check specific resource permissions
const checkResourceAccess = (resource, actions) => {
  return checkPermission({
    resource,
    actions,
    role: "user"
  });
};
```

## Best Practices

### 1. Role Design

- **Principle of Least Privilege**: Users get minimum required permissions
- **Role Hierarchy**: Clear hierarchy for permission inheritance
- **Granular Permissions**: Specific resource and action permissions

### 2. Security

- **Super Admin Protection**: Immutable Super Admin accounts
- **Input Validation**: Validate all role assignments
- **Audit Logging**: Log all role changes and permission modifications

### 3. User Experience

- **Clear Permissions**: Users understand their role capabilities
- **Visual Feedback**: Clear indicators for protected actions
- **Helpful Messages**: Informative error messages for permission denials

## Future Enhancements

### 1. Advanced Permissions

- **Time-Based Permissions**: Temporary role assignments
- **Conditional Permissions**: Context-based permission grants
- **Permission Groups**: Grouped permissions for easier management

### 2. Audit and Monitoring

- **Permission Audit Log**: Track all permission changes
- **Access Monitoring**: Monitor user access patterns
- **Security Alerts**: Alert on suspicious permission changes

### 3. Role Templates

- **Predefined Roles**: Standard role templates
- **Custom Roles**: User-defined role creation
- **Role Inheritance**: Complex role inheritance patterns

## Testing

### 1. Permission Testing

```javascript
// Test Super Admin protection
test('Super Admin cannot be disabled', async () => {
  // Test implementation
});

// Test role hierarchy
test('Higher roles can manage lower roles', async () => {
  // Test implementation
});
```

### 2. Integration Testing

```javascript
// Test invitation flow
test('Role assignment during invitation', async () => {
  // Test implementation
});

// Test permission middleware
test('Permission middleware blocks unauthorized access', async () => {
  // Test implementation
});
```

## Conclusion

The RBAC implementation provides a robust, secure, and user-friendly permission system that ensures proper access control while maintaining Super Admin protection. The system is scalable and can be extended with additional roles and permissions as needed. 