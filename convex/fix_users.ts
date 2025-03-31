import { mutation } from "./_generated/server";

export const fixUsers = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting user data fix...");
    const users = await ctx.db.query("users").collect();
    let updatedUsers = 0;
    
    for (const user of users) {
      try {
        // Vérifier si userId est manquant
        if (!user.userId) {
          await ctx.db.patch(user._id, {
            userId: user.email || `user-${user._id}`
          });
          console.log(`Added userId to user ${user._id}`);
        }
        
        // Corriger les stats pour qu'elles correspondent au schéma
        const stats = user.stats || {};
        await ctx.db.patch(user._id, {
          stats: {
            projectsCreated: stats.projectsCreated || 0.0,
            projectsLiked: stats.projectsLiked || 0.0,
            postsCreated: stats.postsCreated || 0.0,
            postsLiked: stats.postsLiked || 0.0,
            commentsCreated: stats.commentsCreated || 0.0,
            commentsLiked: stats.commentsLiked || 0.0,
            likedBy: Array.isArray(stats.likedBy) ? stats.likedBy : []
          }
        });
        
        updatedUsers++;
        console.log(`Fixed user ${user._id}`);
      } catch (error) {
        console.error(`Error fixing user ${user._id}:`, error);
      }
    }
    
    console.log(`Fix completed. Updated ${updatedUsers} users.`);
    return { updatedUsers };
  }
}); 