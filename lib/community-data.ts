import { supabase } from './supabase';

export type Category =
  | 'Transportation' | 'Traffic' | 'Waste Management' | 'Water'
  | 'Electricity' | 'Environment' | 'Infrastructure' | 'Public Safety'
  | 'Education' | 'Healthcare' | 'Sustainability' | 'Community Events' | 'Other';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type ReportReason =
  | 'Spam'
  | 'False Information'
  | 'Harassment'
  | 'Offensive Content'
  | 'Duplicate Content'
  | 'Other';

export type ContributorBadge =
  | 'New Contributor'
  | 'Active Contributor'
  | 'Top Contributor'
  | 'Community Leader';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  upvotes: number;
  downvotes: number;
  parentId: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  votedBy: Record<string, 'up' | 'down'>;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  description: string;
  categories: Category[];
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'mixed' | 'none';
  mediaFileNames?: string[];
  createdAt: string;
  upvotes: number;
  downvotes: number;
  netScore: number;
  commentCount: number;
  shareCount: number;
  priority: PriorityLevel;
  isSolved: boolean;
  savedBy: string[];
  votedBy: Record<string, 'up' | 'down'>;
  reportedBy: string[];
  // Moderation fields
  status: string;
  verificationStatus: string;
  verifiedBy?: string;
  verificationDate?: string;
  editHistory: any[];
  isDeleted: boolean;
  deletionReason?: string;
  deletedBy?: string;
  deletedAt?: string;
}

export interface Report {
  id: string;
  postId: string;
  postTitle: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reason: ReportReason;
  details?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface UserReputation {
  userId: string;
  postCount: number;
  commentCount: number;
  upvotesReceived: number;
  reputationScore: number;
  badge: ContributorBadge;
}

export interface TrendingTopic {
  category: Category;
  postCount: number;
}

export interface ContentRequest {
  id: string;
  contentId: string;
  contentType: 'post' | 'pulse_report';
  requestType: 'modification' | 'removal';
  requesterId: string;
  createdAt: string;
  requestedChanges?: any;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'More Information Requested';
  adminNotes?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function computePriority(netScore: number, commentCount: number): PriorityLevel {
  if (netScore > 20 || commentCount > 10) return 'High';
  if (netScore < -5) return 'Low';
  return 'Medium';
}

export function computeTrendingScore(post: Pick<Post, 'netScore' | 'commentCount' | 'shareCount' | 'createdAt'>): number {
  // Base weights
  const priorityWeight = 1.0;
  const commentWeight = 2.0;
  const shareWeight = 3.0;

  // Recency decay: Posts lose value as they age
  const ageMs = Date.now() - new Date(post.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  
  // Halflife logic: Score halves every 3 days. 
  // e.g. ageDays = 3 => decay = 0.5, ageDays = 6 => decay = 0.25
  const timeDecay = Math.pow(0.5, ageDays / 3); 

  // Base score
  const baseScore = 
    (post.netScore * priorityWeight) + 
    (post.commentCount * commentWeight) + 
    (post.shareCount * shareWeight);

  // Trending is heavily biased toward recency, but also overall activity
  return baseScore * timeDecay;
}

function getBadgeFromScore(score: number): ContributorBadge {
  if (score >= 500) return 'Community Leader';
  if (score >= 200) return 'Top Contributor';
  if (score >= 50) return 'Active Contributor';
  return 'New Contributor';
}

// ── Community Client ───────────────────────────────────────────────────────────

export const communityClient = {

  // ── Posts ──────────────────────────────────────────────────────────────────

  getPosts: async (includeDeleted = false): Promise<Post[]> => {
    let query = supabase
      .from('posts')
      .select(`
        *,
        post_votes(user_id, vote_type),
        saved_posts(user_id),
        reported_posts(user_id)
      `)
      .order('created_at', { ascending: false });
      
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }

    const { data: posts, error } = await query;

    if (error || !posts) return [];

    return posts.map(p => {
      const votedBy: Record<string, 'up' | 'down'> = {};
      p.post_votes?.forEach((v: any) => { votedBy[v.user_id] = v.vote_type; });
      return {
        id: p.id,
        authorId: p.author_id,
        authorName: p.author_name,
        authorRole: p.author_role,
        title: p.title,
        description: p.description,
        categories: p.categories as Category[],
        mediaUrls: p.media_urls || [],
        mediaType: p.media_type as any,
        mediaFileNames: p.media_file_names || [],
        createdAt: p.created_at,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        netScore: p.net_score,
        commentCount: p.comment_count,
        shareCount: p.share_count,
        priority: p.priority as PriorityLevel,
        isSolved: p.is_solved,
        savedBy: p.saved_posts?.map((s: any) => s.user_id) || [],
        votedBy,
        reportedBy: p.reported_posts?.map((r: any) => r.user_id) || [],
        status: p.status || 'Submitted',
        verificationStatus: p.verification_status || 'Pending Review',
        verifiedBy: p.verified_by,
        verificationDate: p.verification_date,
        editHistory: p.edit_history || [],
        isDeleted: p.is_deleted || false,
        deletionReason: p.deletion_reason,
        deletedBy: p.deleted_by,
        deletedAt: p.deleted_at
      };
    });
  },

  getPost: async (id: string): Promise<Post | null> => {
    const posts = await communityClient.getPosts();
    return posts.find((p) => p.id === id) || null;
  },

  createPost: async (postData: Partial<Post>): Promise<Post> => {
    const { data, error } = await supabase.from('posts').insert([{
      author_id: postData.authorId,
      author_name: postData.authorName,
      author_role: postData.authorRole,
      title: postData.title,
      description: postData.description,
      categories: postData.categories || [],
      media_urls: postData.mediaUrls || [],
      media_type: postData.mediaType || 'none',
      media_file_names: postData.mediaFileNames || [],
    }]).select().single();

    if (error || !data) throw error;
    
    return {
      id: data.id,
      authorId: data.author_id,
      authorName: data.author_name,
      authorRole: data.author_role,
      title: data.title,
      description: data.description,
      categories: data.categories as Category[],
      mediaUrls: data.media_urls || [],
      mediaType: data.media_type as any,
      mediaFileNames: data.media_file_names || [],
      createdAt: data.created_at,
      upvotes: data.upvotes,
      downvotes: data.downvotes,
      netScore: data.net_score,
      commentCount: data.comment_count,
      shareCount: data.share_count,
      priority: data.priority as PriorityLevel,
      isSolved: data.is_solved,
      savedBy: [],
      votedBy: {},
      reportedBy: [],
      status: data.status || 'Submitted',
      verificationStatus: data.verification_status || 'Pending Review',
      verifiedBy: data.verified_by,
      verificationDate: data.verification_date,
      editHistory: data.edit_history || [],
      isDeleted: data.is_deleted || false,
      deletionReason: data.deletion_reason,
      deletedBy: data.deleted_by,
      deletedAt: data.deleted_at
    };
  },

  editPost: async (postId: string, userId: string, updates: Partial<Post>, isAdmin: boolean = false): Promise<Post | null> => {
    const post = await communityClient.getPost(postId);
    if (!post || (!isAdmin && post.authorId !== userId)) return null;
    
    if (!isAdmin && post.verificationStatus !== 'Pending Review' && post.verificationStatus !== 'Rejected') {
      return null;
    }

    const { data, error } = await supabase.from('posts').update({
      title: updates.title !== undefined ? updates.title : post.title,
      description: updates.description !== undefined ? updates.description : post.description,
      categories: updates.categories !== undefined ? updates.categories : post.categories,
      media_urls: updates.mediaUrls !== undefined ? updates.mediaUrls : post.mediaUrls,
      media_type: updates.mediaType !== undefined ? updates.mediaType : post.mediaType,
      media_file_names: updates.mediaFileNames !== undefined ? updates.mediaFileNames : post.mediaFileNames,
      edit_history: [...post.editHistory, { date: new Date().toISOString(), changes: updates }]
    }).eq('id', postId).select().single();

    if (error || !data) return null;
    return communityClient.getPost(postId);
  },

  deletePost: async (postId: string, userId: string, isAdmin: boolean = false): Promise<boolean> => {
    const post = await communityClient.getPost(postId);
    if (!post || (!isAdmin && post.authorId !== userId)) return false;

    if (!isAdmin && post.verificationStatus !== 'Pending Review' && post.verificationStatus !== 'Rejected') {
      return false;
    }

    const { error } = await supabase.from('posts').update({
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date().toISOString()
    }).eq('id', postId);

    return !error;
  },

  requestModification: async (postId: string, userId: string, requestedChanges: any, reason: string): Promise<ContentRequest | null> => {
    const { data, error } = await supabase.from('content_requests').insert([{
      content_id: postId,
      content_type: 'post',
      request_type: 'modification',
      requester_id: userId,
      requested_changes: requestedChanges,
      reason,
      status: 'Pending'
    }]).select().single();

    if (error || !data) return null;
    return {
      id: data.id,
      contentId: data.content_id,
      contentType: data.content_type as any,
      requestType: data.request_type as any,
      requesterId: data.requester_id,
      createdAt: data.created_at,
      requestedChanges: data.requested_changes,
      reason: data.reason,
      status: data.status as any,
      adminNotes: data.admin_notes
    };
  },

  requestRemoval: async (postId: string, userId: string, reason: string): Promise<ContentRequest | null> => {
    const { data, error } = await supabase.from('content_requests').insert([{
      content_id: postId,
      content_type: 'post',
      request_type: 'removal',
      requester_id: userId,
      reason,
      status: 'Pending'
    }]).select().single();

    if (error || !data) return null;
    return {
      id: data.id,
      contentId: data.content_id,
      contentType: data.content_type as any,
      requestType: data.request_type as any,
      requesterId: data.requester_id,
      createdAt: data.created_at,
      requestedChanges: data.requested_changes,
      reason: data.reason,
      status: data.status as any,
      adminNotes: data.admin_notes
    };
  },

  verifyContent: async (postId: string, adminId: string, status: string): Promise<boolean> => {
    const { error } = await supabase.from('posts').update({
      verification_status: status,
      verified_by: adminId,
      verification_date: new Date().toISOString()
    }).eq('id', postId);
    
    return !error;
  },

  votePost: async (postId: string, userId: string, voteType: 'up' | 'down'): Promise<Post | null> => {
    const post = await communityClient.getPost(postId);
    if (!post) return null;

    const currentVote = post.votedBy[userId];
    
    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;

    // Delete existing vote if any
    if (currentVote) {
      await supabase.from('post_votes').delete().match({ post_id: postId, user_id: userId });
      if (currentVote === 'up') newUpvotes--;
      else newDownvotes--;
    }

    // Insert new vote if different
    if (currentVote !== voteType) {
      await supabase.from('post_votes').insert([{ post_id: postId, user_id: userId, vote_type: voteType }]);
      if (voteType === 'up') newUpvotes++;
      else newDownvotes++;
    }

    const netScore = newUpvotes - newDownvotes;
    const priority = computePriority(netScore, post.commentCount);

    await supabase.from('posts').update({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      net_score: netScore,
      priority: priority
    }).eq('id', postId);

    return communityClient.getPost(postId);
  },

  toggleSavePost: async (postId: string, userId: string): Promise<Post | null> => {
    const post = await communityClient.getPost(postId);
    if (!post) return null;

    const isSaved = post.savedBy.includes(userId);

    if (isSaved) {
      await supabase.from('saved_posts').delete().match({ post_id: postId, user_id: userId });
    } else {
      await supabase.from('saved_posts').insert([{ post_id: postId, user_id: userId }]);
    }

    return communityClient.getPost(postId);
  },

  incrementShareCount: async (postId: string): Promise<void> => {
    const post = await communityClient.getPost(postId);
    if (!post) return;
    await supabase.from('posts').update({ share_count: post.shareCount + 1 }).eq('id', postId);
  },

  markAsSolved: async (postId: string): Promise<Post | null> => {
    const post = await communityClient.getPost(postId);
    if (!post) return null;
    await supabase.from('posts').update({ is_solved: !post.isSolved }).eq('id', postId);
    return communityClient.getPost(postId);
  },

  // ── Comments ───────────────────────────────────────────────────────────────

  getComments: async (postId: string): Promise<Comment[]> => {
    const comments = await communityClient.getAllComments();
    return comments.filter(c => c.postId === postId);
  },

  getAllComments: async (): Promise<Comment[]> => {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`*, comment_votes(user_id, vote_type)`)
      .order('created_at', { ascending: true });

    if (error || !comments) return [];

    return comments.map(c => {
      const votedBy: Record<string, 'up' | 'down'> = {};
      c.comment_votes?.forEach((v: any) => { votedBy[v.user_id] = v.vote_type; });
      return {
        id: c.id,
        postId: c.post_id,
        authorId: c.author_id,
        authorName: c.author_name,
        authorRole: c.author_role,
        content: c.content,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        upvotes: c.upvotes,
        downvotes: c.downvotes,
        parentId: c.parent_id,
        isEdited: c.is_edited,
        isDeleted: c.is_deleted,
        votedBy
      };
    });
  },

  addComment: async (commentData: Partial<Comment>): Promise<Comment> => {
    const { data, error } = await supabase.from('comments').insert([{
      post_id: commentData.postId,
      author_id: commentData.authorId,
      author_name: commentData.authorName,
      author_role: commentData.authorRole,
      content: commentData.content,
      parent_id: commentData.parentId || null
    }]).select().single();

    if (error || !data) throw error;

    // Update post comment count
    const post = await communityClient.getPost(data.post_id);
    if (post) {
      await supabase.from('posts').update({ 
        comment_count: post.commentCount + 1,
        priority: computePriority(post.netScore, post.commentCount + 1)
      }).eq('id', post.id);
    }

    return {
      id: data.id,
      postId: data.post_id,
      authorId: data.author_id,
      authorName: data.author_name,
      authorRole: data.author_role,
      content: data.content,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      upvotes: data.upvotes,
      downvotes: data.downvotes,
      parentId: data.parent_id,
      isEdited: data.is_edited,
      isDeleted: data.is_deleted,
      votedBy: {}
    };
  },

  voteComment: async (commentId: string, userId: string, voteType: 'up' | 'down'): Promise<Comment | null> => {
    const comments = await communityClient.getAllComments();
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return null;

    const currentVote = comment.votedBy[userId];
    let newUpvotes = comment.upvotes;
    let newDownvotes = comment.downvotes;

    if (currentVote) {
      await supabase.from('comment_votes').delete().match({ comment_id: commentId, user_id: userId });
      if (currentVote === 'up') newUpvotes--;
      else newDownvotes--;
    }

    if (currentVote !== voteType) {
      await supabase.from('comment_votes').insert([{ comment_id: commentId, user_id: userId, vote_type: voteType }]);
      if (voteType === 'up') newUpvotes++;
      else newDownvotes++;
    }

    await supabase.from('comments').update({
      upvotes: newUpvotes,
      downvotes: newDownvotes
    }).eq('id', commentId);

    return { ...comment, upvotes: newUpvotes, downvotes: newDownvotes, votedBy: { ...comment.votedBy, [userId]: voteType } };
  },

  editComment: async (commentId: string, userId: string, content: string): Promise<Comment | null> => {
    const { data, error } = await supabase.from('comments').update({
      content,
      is_edited: true,
      updated_at: new Date().toISOString()
    }).match({ id: commentId, author_id: userId }).select().single();

    if (error || !data) return null;
    const comments = await communityClient.getAllComments();
    return comments.find(c => c.id === commentId) || null;
  },

  deleteComment: async (
    commentId: string,
    userId: string,
    isPrivileged = false,
  ): Promise<{ mode: 'hard' | 'soft'; purgedIds: string[] } | false> => {
    const allComments = await communityClient.getAllComments();
    const comment = isPrivileged
      ? allComments.find(c => c.id === commentId)
      : allComments.find(c => c.id === commentId && c.authorId === userId);
    if (!comment) return false;

    const hasReplies = allComments.some(c => c.parentId === commentId);

    if (hasReplies) {
      // Soft-delete: leave placeholder so replies stay visible
      await supabase.from('comments').update({ content: '[deleted]', is_deleted: true }).eq('id', commentId);
      return { mode: 'soft', purgedIds: [commentId] };
    }

    // Hard-delete: no replies, remove from DB entirely
    const purgedIds: string[] = [commentId];
    const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId);
    
    if (deleteError) {
      console.error("Failed to delete comment:", deleteError);
      return false;
    }

    // Cascade up: if parent is a soft-deleted orphan (no remaining replies), hard-delete it too
    let parentId = comment.parentId;
    while (parentId) {
      const parent = allComments.find(c => c.id === parentId);
      if (!parent) break;
      // Remaining replies for this parent (excluding IDs already purged)
      const remainingReplies = allComments.filter(
        c => c.parentId === parent.id && !purgedIds.includes(c.id),
      );
      if (parent.isDeleted && remainingReplies.length === 0) {
        const { error: cascadeError } = await supabase.from('comments').delete().eq('id', parent.id);
        if (cascadeError) {
          console.error("Failed to cascade delete:", cascadeError);
          break;
        }
        purgedIds.push(parent.id);
        parentId = parent.parentId;
      } else {
        break; // parent is still active or still has real replies, stop cascading
      }
    }

    // Decrement post commentCount by the number of hard-deleted entries
    const post = await communityClient.getPost(comment.postId);
    if (post && post.commentCount > 0) {
      await supabase
        .from('posts')
        .update({ comment_count: Math.max(0, post.commentCount - purgedIds.length) })
        .eq('id', post.id);
    }

    return { mode: 'hard', purgedIds };
  },

  // ── Reports ────────────────────────────────────────────────────────────────

  reportPost: async (
    postId: string,
    postTitle: string,
    userId: string,
    userName: string,
    reason: ReportReason,
    details?: string,
  ): Promise<Report> => {
    // Record user reported this post (in reported_posts for counting)
    try {
      await supabase.from('reported_posts').insert([{ post_id: postId, user_id: userId }]);
    } catch (e) {
      // Ignore if user already reported or constraint fails
    }

    // Create the actual report for admins to view
    const { data, error } = await supabase.from('reports').insert([{
      post_id: postId,
      post_title: postTitle,
      reported_by_user_id: userId,
      reported_by_user_name: userName,
      reason,
      details,
      status: 'pending'
    }]).select().single();

    if (error || !data) throw error;

    return {
      id: data.id,
      postId: data.post_id,
      postTitle: data.post_title,
      reportedByUserId: data.reported_by_user_id,
      reportedByUserName: data.reported_by_user_name,
      reason: data.reason as ReportReason,
      details: data.details,
      status: data.status as any,
      createdAt: data.created_at
    };
  },

  getReports: async (): Promise<Report[]> => {
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map(r => ({
      id: r.id,
      postId: r.post_id,
      postTitle: r.post_title,
      reportedByUserId: r.reported_by_user_id,
      reportedByUserName: r.reported_by_user_name,
      reason: r.reason as ReportReason,
      details: r.details,
      status: r.status as any,
      createdAt: r.created_at
    }));
  },

  updateReportStatus: async (reportId: string, status: Report['status']): Promise<void> => {
    await supabase.from('reports').update({ status }).eq('id', reportId);
  },

  // ── Reputation ─────────────────────────────────────────────────────────────

  getUserReputation: async (userId: string): Promise<UserReputation> => {
    const posts = await communityClient.getPosts();
    const comments = await communityClient.getAllComments();

    const userPosts = posts.filter((p) => p.authorId === userId);
    const userComments = comments.filter((c) => c.authorId === userId && !c.isDeleted);

    const upvotesReceived =
      userPosts.reduce((sum, p) => sum + p.upvotes, 0) +
      userComments.reduce((sum, c) => sum + c.upvotes, 0);

    const reputationScore = userPosts.length * 5 + userComments.length * 2 + upvotesReceived;

    return {
      userId,
      postCount: userPosts.length,
      commentCount: userComments.length,
      upvotesReceived,
      reputationScore,
      badge: getBadgeFromScore(reputationScore)
    };
  },

  getTopContributors: async (limit = 5): Promise<(UserReputation & { name: string; role: string })[]> => {
    const posts = await communityClient.getPosts();
    const comments = await communityClient.getAllComments();

    const userMap: Record<string, { name: string; role: string, score: number, upvotes: number, posts: number, comments: number }> = {};
    
    // Calculate for all users who posted
    posts.forEach((p) => { 
      if (!userMap[p.authorId]) userMap[p.authorId] = { name: p.authorName, role: p.authorRole, score: 0, upvotes: 0, posts: 0, comments: 0 };
      userMap[p.authorId].posts++;
      userMap[p.authorId].upvotes += p.upvotes;
    });

    // Calculate for all users who commented
    comments.forEach((c) => { 
      if (c.isDeleted) return;
      if (!userMap[c.authorId]) userMap[c.authorId] = { name: c.authorName, role: c.authorRole, score: 0, upvotes: 0, posts: 0, comments: 0 };
      userMap[c.authorId].comments++;
      userMap[c.authorId].upvotes += c.upvotes;
    });

    return Object.entries(userMap)
      .map(([id, info]) => {
        const score = info.posts * 5 + info.comments * 2 + info.upvotes;
        return {
          userId: id,
          name: info.name,
          role: info.role,
          postCount: info.posts,
          commentCount: info.comments,
          upvotesReceived: info.upvotes,
          reputationScore: score,
          badge: getBadgeFromScore(score)
        };
      })
      .sort((a, b) => b.reputationScore - a.reputationScore)
      .slice(0, limit);
  },

  // ── Trending Topics ────────────────────────────────────────────────────────

  getTrendingTopics: async (): Promise<TrendingTopic[]> => {
    const posts = await communityClient.getPosts();
    const counts: Partial<Record<Category, number>> = {};
    posts.forEach((p) => {
      p.categories.forEach((cat) => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    return (Object.entries(counts) as [Category, number][])
      .map(([category, postCount]) => ({ category, postCount }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 6);
  },
};
