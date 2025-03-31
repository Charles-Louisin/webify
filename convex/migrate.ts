import { mutation } from "./_generated/server";

export const migrate = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration...");
    const users = await ctx.db.query("users").collect();
    let updatedUsers = 0;
    
    for (const user of users) {
      try {
        // Récupérer les anciennes stats pour conserver les likedBy si possible
        const oldStats = user.stats || {};
        
        // Extraire likedBy ou initialiser un tableau vide
        const likedBy = Array.isArray(oldStats.likedBy) ? oldStats.likedBy : [];
        
        // Créer de nouvelles stats conformes au schéma
        await ctx.db.patch(user._id, {
          stats: {
            projectsCreated: oldStats.projectsCreated || 0.0,
            projectsLiked: oldStats.projectsLiked || 0.0,
            postsCreated: oldStats.postsCreated || 0.0,
            postsLiked: oldStats.postsLiked || 0.0,
            commentsCreated: oldStats.commentsCreated || 0.0,
            commentsLiked: oldStats.commentsLiked || 0.0,
            likedBy: likedBy
          }
        });

        // Assurer que userId existe
        if (!user.userId) {
          await ctx.db.patch(user._id, {
            userId: user.email || `user-${user._id}`
          });
        }
        
        updatedUsers++;
        console.log(`Updated user ${user._id}`);
      } catch (error) {
        console.error(`Error updating user ${user._id}:`, error);
      }
    }
    
    console.log(`Migration completed. Updated ${updatedUsers} users.`);
    return { updatedUsers };
  }
}); 