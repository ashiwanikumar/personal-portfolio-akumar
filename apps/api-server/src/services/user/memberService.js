//** User **//
const Member = require("@models/user/member");
const Admin = require("@models/user/admin");


class MemberService {
  // Find one member
  static findOneMember = async (query) => {
    try {
      const member = await Member.findOne(query).exec();

      return member;
    } catch (error) {
      throw error;
    }
  };

  // Find one member populated team
  static findOneMemberPopulatedTeam = async (query) => {
    try {
      // First get the member and their team
      const member = await Member.findOne(query)
        .populate({
          path: "team",
          select: "name email role isOnline isEngaged lastActive createdAt",
        })
        .sort({ createdAt: -1 })
        .exec();

      if (!member) {
        throw new Error("Member not found");
      }

      // Get admin information for billing admin status
      const adminInfo = await Admin.find({
        user: { $in: member.team.map((user) => user._id) },
      })
        .select("user billingAdmin")
        .lean();

      // Map billing admin status to team members
      const enrichedTeam = member.team.map((teamMember) => {
        const admin = adminInfo.find(
          (a) => a.user.toString() === teamMember._id.toString()
        );
        return {
          ...teamMember.toObject(),
          billingAdmin: admin ? admin.billingAdmin : false,
        };
      });

      return enrichedTeam;
    } catch (error) {
      console.error("FIND_MEMBER_TEAM_ERROR", error);
      throw error;
    }
  };

}

module.exports = MemberService;
