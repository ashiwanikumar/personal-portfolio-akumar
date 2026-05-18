# Team Management System - Server-Side Documentation

## Overview
The server-side Team Management System provides comprehensive backend infrastructure for managing team members, invitations, role assignments, and access control. It handles secure team operations through authenticated API endpoints with proper validation and audit trails.

## File Structure

### 📁 Models
- **SuperAdmin Model**: `/server/src/models/user/superAdmin.js`
  - SuperAdmin schema with team and invitations
  - Team member relationships
  - Invitation tracking

- **User Model**: `/server/src/models/user/user.js`
  - User schema with role assignments
  - Account status management
  - Authentication data

- **Admin/Marketing Models**: `/server/src/models/user/admin.js`, `/server/src/models/user/marketingAdmin.js`
  - Role-specific user data
  - Team relationships
  - Permission inheritance

### 📁 Controllers
- **SuperAdmin Controller**: `/server/src/controllers/user/superAdminController.js`
  - Team invitation management
  - Account activation
  - Team member operations
  - Role changes and status updates

### 📁 Services
- **SuperAdmin Service**: `/server/src/services/user/superAdminService.js`
  - Business logic for team operations
  - Invitation processing
  - Team member data management
  - Permission validation

### 📁 Routes
- **SuperAdmin Routes**: `/server/src/routes/user/superAdmin.js`
  - Team management endpoints
  - Authentication middleware
  - Permission controls

### 📁 Email Templates
- **Team Emails**: `/server/src/mails/teamEmails.js`
  - Invitation email templates
  - Cancellation notifications
  - HTML email formatting

### 📁 Utilities
- **Email Service**: `/server/src/utils/sendEmail.js`
  - Email delivery system
  - Template processing
  - Error handling

## Database Schema

### SuperAdmin Model Structure
```javascript
{
  _id: ObjectId,
  user: ObjectId,           // Reference to User document
  name: String,
  email: String,
  team: [ObjectId],         // Array of team member User IDs
  invitations: [{
    _id: ObjectId,
    email: String,
    role: String,
    status: String,         // 'pending', 'accepted', 'expired'
    date: Date,
    invitedBy: {
      userId: ObjectId,
      name: String,
      email: String,
      role: String
    }
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### User Model Structure
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: String,             // 'superadmin', 'admin', 'marketing'
  activated: Boolean,
  activationToken: String,
  disabled: Boolean,        // Account status
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Team Management

#### Get Team Members
```http
GET /api/v1/super-admin/team/members?page=1&perPage=10
Authorization: Bearer <token>
Permissions: Super Admin or Admin
```

**Response:**
```json
{
  "success": true,
  "teamMembers": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "disabled": false,
      "createdAt": "2025-07-02T00:00:00.000Z",
      "invitedBy": {
        "name": "Super Admin",
        "email": "admin@example.com"
      }
    }
  ],
  "pendingInvitations": [
    {
      "_id": "invitation_id",
      "email": "pending@example.com",
      "role": "marketing",
      "status": "pending",
      "date": "2025-07-02T00:00:00.000Z",
      "invitedBy": {
        "name": "Super Admin",
        "email": "admin@example.com"
      }
    }
  ],
  "totalTeamMembers": 5,
  "totalPendingInvitations": 2
}
```

#### Send Team Invitation
```http
POST /api/v1/super-admin/team/invite
Authorization: Bearer <token>
Permissions: Super Admin only
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully"
}
```

#### Team Account Activation
```http
POST /api/v1/super-admin/team/account/activate
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "password": "securePassword123",
  "token": "jwt_invitation_token"
}
```

#### Cancel Team Invitation
```http
DELETE /api/v1/super-admin/team/invitation/:invitationId/cancel
Authorization: Bearer <token>
Permissions: Super Admin only
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation cancelled successfully"
}
```

#### Change User Role
```http
PUT /api/v1/user/change-role/:userId
Authorization: Bearer <token>
Permissions: Super Admin only
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "marketing"
}
```

#### Toggle User Account Status
```http
PUT /api/v1/user/disable/:userId
Authorization: Bearer <token>
Permissions: Super Admin only
```

#### Remove Team Member
```http
DELETE /api/v1/super-admin/team/member/:memberId/remove
Authorization: Bearer <token>
Permissions: Super Admin only
```

## Controller Implementation

### Team Invitation Controller
```javascript
exports.teamInvite = async (req, res) => {
  const { email, role } = req.body;
  
  try {
    // Get current user info for inviter tracking
    const inviterUser = await UserService.findUserById(req.user._id);

    const invitation = {
      email,
      role,
      status: "pending",
      date: new Date(),
      invitedBy: {
        userId: req.user._id,
        name: inviterUser.name,
        email: inviterUser.email,
        role: inviterUser.role,
      },
    };

    // Update invitation in superAdmins invitations array
    const superAdmin = await SuperAdminService.superAdminTeamInvitation(
      req.user._id,
      invitation
    );

    // Create JWT token for email verification
    const payload = { 
      email: email, 
      role: role, 
      superAdminId: superAdmin._id 
    };
    const joiningToken = jwt.sign(payload, process.env.JWT_EMAIL_SECRET);

    // Send invitation email
    const emailResult = await sendEmail({
      to: email,
      from: `Shivraj Singh Chouhan Team <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      subject: "Administrative Team Invitation | Shivraj Singh Chouhan",
      html: teamInviteEmailTemplate(superAdmin, joiningToken),
      emailType: "Team Invitation",
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || "Failed to send invitation email");
    }

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.log("SERVER_TEAM_INVITE_ERROR", error);
    res.status(500).json({
      error: error.message
    });
  }
};
```

### Account Activation Controller
```javascript
exports.teamAccountActivate = async (req, res) => {
  const { name, password, token } = req.body;

  // Validate password
  const validationErrors = passwordValidator(password);
  
  if (validationErrors.length) {
    return res.status(400).json({
      error: true,
      type: validationErrors,
    });
  }

  try {
    if (token) {
      jwt.verify(token, process.env.JWT_EMAIL_SECRET, async (err, tokenData) => {
        if (err) {
          return res.status(409).json({
            error: true,
            type: [{
              code: "GLOBAL_ERROR",
              message: "Token is not valid or expired, enter email to resend verification",
            }],
          });
        }

        const { email } = tokenData;
        
        // Check if user already exists
        const existingUser = await UserService.findOneUser({ email });
        if (existingUser) {
          return res.status(409).json({
            error: true,
            type: [{
              code: "GLOBAL_ERROR",
              message: "You have already joined, login to continue",
            }],
          });
        }

        // Hash password and activate account
        const hashedPassword = await bcrypt.hash(password, 12);
        
        await SuperAdminService.activateTeamAccount(
          tokenData,
          name,
          hashedPassword,
          token
        );

        res.status(200).json({
          success: true,
          message: "Account activated successfully",
        });
      });
    }
  } catch (error) {
    console.log("ADMIN_TEAM_ACCOUNT_ACTIVATION_ERROR", error);
    res.status(500).json({
      error: error.message
    });
  }
};
```

### Cancel Invitation Controller
```javascript
exports.cancelTeamInvitation = async (req, res) => {
  const { _id } = req.user;
  const { invitationId } = req.params;

  try {
    // Get current user info for cancellation tracking
    const cancelledByUser = await UserService.findUserById(_id);

    // Cancel the invitation in the service
    const result = await SuperAdminService.cancelTeamInvitation(_id, invitationId, cancelledByUser);

    // Send cancellation email
    const emailResult = await sendEmail({
      to: result.invitationEmail,
      from: `Shivraj Singh Chouhan Team <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
      subject: "Team Invitation Cancelled | Shivraj Singh Chouhan",
      html: teamInviteCancellationEmailTemplate(result.invitationEmail, cancelledByUser),
      emailType: "Team Invitation Cancellation",
    });

    if (!emailResult.success) {
      console.warn("Failed to send cancellation email:", emailResult.error);
    }

    res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
    });
  } catch (error) {
    console.log("CANCEL_TEAM_INVITATION_ERROR", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel invitation",
    });
  }
};
```

## Service Layer Implementation

### Team Invitation Service
```javascript
static superAdminTeamInvitation = async (userId, invitation) => {
  try {
    let superAdmin = await SuperAdmin.findOne({ user: userId }).exec();

    // Check if email is already invited
    const existingInvitation = superAdmin.invitations.find(
      (invite) => invite.email === invitation.email
    );

    if (existingInvitation) {
      // Update existing invitation
      existingInvitation.status = invitation.status;
      existingInvitation.date = new Date();
      existingInvitation.invitedBy = invitation.invitedBy;
      await superAdmin.save();
    } else {
      // Add new invitation
      superAdmin.invitations.push(invitation);
      await superAdmin.save();
    }

    return superAdmin;
  } catch (error) {
    throw error;
  }
};
```

### Account Activation Service
```javascript
static activateTeamAccount = async (tokenData, name, hashedPassword, token) => {
  try {
    // Find the super admin who invited the user
    const superAdmin = await SuperAdmin.findById(tokenData.superAdminId).exec();

    // Create new user
    const newUser = new User({
      name,
      email: tokenData?.email,
      role: tokenData?.role,
      password: hashedPassword,
      activated: true,
      activationToken: token,
    });

    await newUser.save();

    // Add user to team
    if (!superAdmin.team.includes(superAdmin.user)) {
      superAdmin.team.push(superAdmin.user);
    }
    superAdmin.team.push(newUser._id);
    await superAdmin.save();

    // Create role-specific document
    let teamMember;
    switch (tokenData?.role) {
      case "superadmin":
        teamMember = new SuperAdmin({
          user: newUser._id,
          name: newUser.name,
          email: newUser.email,
          invitedBy: superAdmin._id,
          team: superAdmin.team,
        });
        break;
      case "marketing":
        teamMember = new Marketing({
          user: newUser._id,
          name: newUser.name,
          email: newUser.email,
          invitedBy: superAdmin._id,
          team: superAdmin.team,
        });
        break;
      case "admin":
        teamMember = new Admin({
          user: newUser._id,
          name: newUser.name,
          email: newUser.email,
          invitedBy: superAdmin._id,
          team: superAdmin.team,
        });
        break;
      default:
        throw new Error(`Unsupported role: ${tokenData?.role}`);
    }

    await teamMember.save();

    // Update team arrays for all existing members
    const updateOperations = [
      SuperAdmin.updateMany(
        { team: superAdmin.user },
        { $addToSet: { team: newUser._id } }
      ),
      Marketing.updateMany(
        { team: superAdmin.user },
        { $addToSet: { team: newUser._id } }
      ),
      Admin.updateMany(
        { team: superAdmin.user },
        { $addToSet: { team: newUser._id } }
      ),
    ];

    await Promise.all(updateOperations);

    // Update invitation status to "accepted"
    await SuperAdmin.findOneAndUpdate(
      {
        _id: tokenData.superAdminId,
        "invitations.email": tokenData.email,
      },
      {
        $set: { "invitations.$.status": "accepted" },
      },
      { new: true }
    );

    return teamMember;
  } catch (error) {
    console.error("SERVER_TEAM_ACCT_ACTIVATE_ERROR", error);
    throw error;
  }
};
```

### Get Team Members Service
```javascript
static findAllTeamMembers = async (userId) => {
  try {
    // Find the super admin
    let superAdmin = await SuperAdmin.findOne({ user: userId })
      .populate({
        path: "team",
        select: "name email role createdAt disabled",
      })
      .exec();

    if (!superAdmin) {
      // Create SuperAdmin record if not found
      const user = await User.findById(userId).exec();
      if (!user) {
        return { teamMembers: [], pendingInvitations: [] };
      }

      superAdmin = await SuperAdmin.create({
        user: userId,
        name: user.name,
        email: user.email,
        team: [],
        invitations: [],
      });
    }

    // Get team members
    const teamMembers = superAdmin.team || [];

    // Get current user info for fallback inviter data
    const currentUser = await User.findById(userId).select("name email role").lean();
    const defaultInviterInfo = {
      userId: userId,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role
    };

    // Get pending invitations with fallback inviter info
    const pendingInvitations = superAdmin.invitations
      .filter(invitation => invitation.status === 'pending')
      .map(invitation => ({
        ...invitation.toObject(),
        invitedBy: invitation.invitedBy || defaultInviterInfo
      }));

    // Get accepted invitations for acceptance date mapping
    const acceptedInvitations = superAdmin.invitations.filter(
      invitation => invitation.status === 'accepted'
    );

    // Create maps for acceptance date and inviter info
    const acceptanceDateMap = {};
    const inviterMap = {};
    
    acceptedInvitations.forEach(invitation => {
      acceptanceDateMap[invitation.email] = invitation.date;
      inviterMap[invitation.email] = invitation.invitedBy || defaultInviterInfo;
    });

    // Enhance team members with acceptance date and inviter info
    const enhancedTeamMembers = teamMembers.map(member => ({
      ...member.toObject ? member.toObject() : member,
      acceptanceDate: acceptanceDateMap[member.email] || member.createdAt,
      invitedBy: inviterMap[member.email] || defaultInviterInfo
    }));

    return {
      teamMembers: enhancedTeamMembers,
      pendingInvitations: pendingInvitations,
      totalTeamMembers: enhancedTeamMembers.length,
      totalPendingInvitations: pendingInvitations.length
    };
  } catch (error) {
    console.error("FIND_ALL_TEAM_MEMBERS_ERROR", error);
    throw error;
  }
};
```

## Email System

### Invitation Email Template
The system uses sophisticated HTML email templates with:
- Professional government styling
- Responsive design
- Clear call-to-action buttons
- Official branding
- Contact information
- Social media links

### Email Features
- **Team Invitation**: Welcome new members with detailed information
- **Cancellation Notice**: Inform users when invitations are cancelled
- **Error Handling**: Graceful email delivery failure handling
- **Template System**: Reusable email components

### Email Configuration
```javascript
// Email sending configuration
const emailConfig = {
  to: recipientEmail,
  from: `Shivraj Singh Chouhan Team <${process.env.ZOHO_NODEMAILER_EMAIL_HELLO}>`,
  subject: "Team Invitation | Shivraj Singh Chouhan",
  html: templateFunction(data),
  emailType: "Team Invitation"
};
```

## Security Features

### Authentication & Authorization
- JWT token-based invitation system
- Role-based access control
- Super admin permission requirements
- Token expiration handling

### Input Validation
- Email format validation
- Password strength requirements
- Role validation
- SQL injection prevention
- XSS protection

### Account Security
- Secure password hashing (bcrypt)
- Account activation tokens
- Email verification
- Account disable/enable functionality

## Error Handling

### Common Error Responses
```javascript
// Invalid invitation token
{
  "error": true,
  "type": [{
    "code": "GLOBAL_ERROR",
    "message": "Token is not valid or expired"
  }]
}

// User already exists
{
  "error": true,
  "type": [{
    "code": "GLOBAL_ERROR",
    "message": "You have already joined, login to continue"
  }]
}

// Permission denied
{
  "success": false,
  "message": "Insufficient permissions"
}

// Invitation not found
{
  "success": false,
  "message": "Invitation not found"
}
```

### Error Logging
- Comprehensive error logging
- Stack trace capture
- User action tracking
- Email delivery monitoring

## Performance Optimizations

### Database Operations
- Efficient MongoDB queries
- Proper indexing strategy
- Population optimization
- Batch operations for team updates

### Email Performance
- Asynchronous email sending
- Email queue management
- Retry mechanisms
- Template caching

### Memory Management
- Efficient data structures
- Garbage collection optimization
- Connection pooling
- Resource cleanup

## Monitoring & Analytics

### Team Metrics
- Invitation success rates
- Account activation statistics
- Team growth tracking
- Role distribution analysis

### System Health
- Email delivery monitoring
- Database performance tracking
- API response times
- Error rate monitoring

### Audit Trail
```javascript
// Team operation audit log
{
  timestamp: Date,
  userId: ObjectId,
  action: String,        // 'INVITE', 'ACTIVATE', 'CANCEL', 'REMOVE'
  targetEmail: String,
  targetRole: String,
  result: String,        // 'SUCCESS', 'FAILURE'
  ipAddress: String,
  userAgent: String,
  details: Object
}
```

## Integration Points

### Frontend Integration
- Real-time team member updates
- Invitation status tracking
- Role-based UI rendering
- Permission-based feature access

### External Services
- Email delivery service (Zoho)
- File storage for attachments
- Analytics and monitoring tools
- Backup and recovery systems

## Best Practices

### Team Management
- Clear role definitions
- Proper invitation workflows
- Regular team audits
- Secure invitation tokens

### Code Quality
- Comprehensive error handling
- Input validation
- Secure coding practices
- Performance optimization

### Documentation
- API documentation
- Code comments
- Process documentation
- Troubleshooting guides

## Troubleshooting

### Common Issues

1. **Email Delivery Failures**
   - Check SMTP configuration
   - Verify email service credentials
   - Review spam filters
   - Monitor delivery logs

2. **Invitation Token Issues**
   - Verify JWT secret configuration
   - Check token expiration settings
   - Validate token format
   - Review signing algorithm

3. **Database Connection Problems**
   - Check MongoDB connection
   - Verify network connectivity
   - Review connection pooling
   - Monitor database logs

4. **Permission Errors**
   - Validate user roles
   - Check middleware configuration
   - Review route protection
   - Verify JWT token validity

### Debug Tools
- MongoDB compass for database inspection
- Postman for API testing
- Email delivery logs
- Application performance monitoring
- Error tracking services

## Future Enhancements

### Planned Features
- Bulk team operations
- Advanced role hierarchies
- Team analytics dashboard
- Integration with external HR systems
- Mobile app support
- Advanced notification systems
- Team collaboration features
- Custom invitation templates