// Community Data Layer — UrbanPulse
// All data is persisted to localStorage (mock backend — swap for real API later)

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

const STORAGE_POSTS_KEY = 'urbanpulse_community_posts_v2';
const STORAGE_COMMENTS_KEY = 'urbanpulse_community_comments_v2';
const STORAGE_REPORTS_KEY = 'urbanpulse_community_reports_v2';

// ── Seed Data ──────────────────────────────────────────────────────────────────

const INITIAL_POSTS: Post[] = [];

const INITIAL_COMMENTS: Comment[] = [];

// ── Helpers ────────────────────────────────────────────────────────────────────

function computePriority(post: Pick<Post, 'netScore' | 'commentCount'>): PriorityLevel {
  if (post.netScore > 20 || post.commentCount > 10) return 'High';
  if (post.netScore < -5) return 'Low';
  return 'Medium';
}

function computeReputation(userId: string, posts: Post[], comments: Comment[]): UserReputation {
  const userPosts = posts.filter((p) => p.authorId === userId);
  const userComments = comments.filter((c) => c.authorId === userId && !c.isDeleted);
  const upvotesReceived =
    userPosts.reduce((sum, p) => sum + p.upvotes, 0) +
    userComments.reduce((sum, c) => sum + c.upvotes, 0);
  const reputationScore =
    userPosts.length * 5 + userComments.length * 2 + upvotesReceived;

  let badge: ContributorBadge;
  if (reputationScore >= 500) badge = 'Community Leader';
  else if (reputationScore >= 200) badge = 'Top Contributor';
  else if (reputationScore >= 50) badge = 'Active Contributor';
  else badge = 'New Contributor';

  return { userId, postCount: userPosts.length, commentCount: userComments.length, upvotesReceived, reputationScore, badge };
}

// ── Community Client ───────────────────────────────────────────────────────────

export const communityClient = {

  // ── Posts ──────────────────────────────────────────────────────────────────

  getPosts: async (): Promise<Post[]> => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_POSTS_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(stored);
  },

  getPost: async (id: string): Promise<Post | null> => {
    const posts = await communityClient.getPosts();
    return posts.find((p) => p.id === id) || null;
  },

  createPost: async (postData: Partial<Post>): Promise<Post> => {
    const posts = await communityClient.getPosts();
    const newPost: Post = {
      id: 'post-' + Math.random().toString(36).substr(2, 9),
      authorId: postData.authorId || 'unknown',
      authorName: postData.authorName || 'Anonymous',
      authorRole: postData.authorRole || 'user',
      title: postData.title || '',
      description: postData.description || '',
      categories: postData.categories || [],
      mediaUrls: postData.mediaUrls || [],
      mediaType: postData.mediaType || 'none',
      mediaFileNames: postData.mediaFileNames || [],
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      netScore: 0,
      commentCount: 0,
      shareCount: 0,
      priority: 'Medium',
      isSolved: false,
      savedBy: [],
      votedBy: {},
      reportedBy: [],
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    return newPost;
  },

  votePost: async (postId: string, userId: string, voteType: 'up' | 'down'): Promise<Post | null> => {
    const posts = await communityClient.getPosts();
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) return null;

    const post = posts[idx];
    const current = post.votedBy[userId];

    if (current === voteType) {
      delete post.votedBy[userId];
      if (voteType === 'up') post.upvotes--;
      else post.downvotes--;
    } else {
      if (current === 'up') post.upvotes--;
      else if (current === 'down') post.downvotes--;
      post.votedBy[userId] = voteType;
      if (voteType === 'up') post.upvotes++;
      else post.downvotes++;
    }

    post.netScore = post.upvotes - post.downvotes;
    post.priority = computePriority(post);
    posts[idx] = post;
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    return post;
  },

  toggleSavePost: async (postId: string, userId: string): Promise<Post | null> => {
    const posts = await communityClient.getPosts();
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) return null;

    const post = posts[idx];
    post.savedBy = post.savedBy.includes(userId)
      ? post.savedBy.filter((id) => id !== userId)
      : [...post.savedBy, userId];

    posts[idx] = post;
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    return post;
  },

  incrementShareCount: async (postId: string): Promise<void> => {
    const posts = await communityClient.getPosts();
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) return;
    posts[idx].shareCount++;
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
  },

  markAsSolved: async (postId: string): Promise<Post | null> => {
    const posts = await communityClient.getPosts();
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) return null;
    posts[idx].isSolved = !posts[idx].isSolved;
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    return posts[idx];
  },

  // ── Comments ───────────────────────────────────────────────────────────────

  getComments: async (postId: string): Promise<Comment[]> => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS));
      return INITIAL_COMMENTS.filter((c) => c.postId === postId);
    }
    const comments: Comment[] = JSON.parse(stored);
    // Ensure new fields exist for legacy comments
    return comments
      .filter((c) => c.postId === postId)
      .map((c) => ({
        isEdited: false,
        isDeleted: false,
        votedBy: {},
        ...c,
      }));
  },

  getAllComments: async (): Promise<Comment[]> => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS));
      return INITIAL_COMMENTS;
    }
    return JSON.parse(stored);
  },

  addComment: async (commentData: Partial<Comment>): Promise<Comment> => {
    if (typeof window === 'undefined') return null as any;
    const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
    const comments: Comment[] = stored ? JSON.parse(stored) : [...INITIAL_COMMENTS];

    const newComment: Comment = {
      id: 'comment-' + Math.random().toString(36).substr(2, 9),
      postId: commentData.postId || '',
      authorId: commentData.authorId || 'unknown',
      authorName: commentData.authorName || 'Anonymous',
      authorRole: commentData.authorRole || 'user',
      content: commentData.content || '',
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      parentId: commentData.parentId || null,
      isEdited: false,
      isDeleted: false,
      votedBy: {},
    };

    comments.push(newComment);
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));

    // Update post comment count + priority
    const posts = await communityClient.getPosts();
    const postIdx = posts.findIndex((p) => p.id === newComment.postId);
    if (postIdx !== -1) {
      posts[postIdx].commentCount++;
      posts[postIdx].priority = computePriority(posts[postIdx]);
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    }

    return newComment;
  },

  voteComment: async (commentId: string, userId: string, voteType: 'up' | 'down'): Promise<Comment | null> => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
    const comments: Comment[] = stored ? JSON.parse(stored) : [...INITIAL_COMMENTS];
    const idx = comments.findIndex((c) => c.id === commentId);
    if (idx === -1) return null;

    const comment = { votedBy: {}, ...comments[idx] };
    const current = comment.votedBy[userId];

    if (current === voteType) {
      delete comment.votedBy[userId];
      if (voteType === 'up') comment.upvotes--;
      else comment.downvotes--;
    } else {
      if (current === 'up') comment.upvotes--;
      else if (current === 'down') comment.downvotes--;
      comment.votedBy[userId] = voteType;
      if (voteType === 'up') comment.upvotes++;
      else comment.downvotes++;
    }

    comments[idx] = comment;
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
    return comment;
  },

  editComment: async (commentId: string, userId: string, content: string): Promise<Comment | null> => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
    const comments: Comment[] = stored ? JSON.parse(stored) : [...INITIAL_COMMENTS];
    const idx = comments.findIndex((c) => c.id === commentId && c.authorId === userId);
    if (idx === -1) return null;

    comments[idx] = {
      ...comments[idx],
      content,
      isEdited: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
    return comments[idx];
  },

  deleteComment: async (commentId: string, userId: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
    const comments: Comment[] = stored ? JSON.parse(stored) : [...INITIAL_COMMENTS];
    const idx = comments.findIndex((c) => c.id === commentId && c.authorId === userId);
    if (idx === -1) return false;

    const postId = comments[idx].postId;
    comments[idx] = { ...comments[idx], isDeleted: true, content: '[deleted]' };
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));

    const posts = await communityClient.getPosts();
    const postIdx = posts.findIndex((p) => p.id === postId);
    if (postIdx !== -1 && posts[postIdx].commentCount > 0) {
      posts[postIdx].commentCount--;
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    }

    return true;
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
    if (typeof window === 'undefined') return null as any;

    // Mark post as reported by this user
    const posts = await communityClient.getPosts();
    const postIdx = posts.findIndex((p) => p.id === postId);
    if (postIdx !== -1 && !posts[postIdx].reportedBy.includes(userId)) {
      posts[postIdx].reportedBy.push(userId);
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    }

    const stored = localStorage.getItem(STORAGE_REPORTS_KEY);
    const reports: Report[] = stored ? JSON.parse(stored) : [];

    const newReport: Report = {
      id: 'report-' + Math.random().toString(36).substr(2, 9),
      postId,
      postTitle,
      reportedByUserId: userId,
      reportedByUserName: userName,
      reason,
      details,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    reports.push(newReport);
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
    return newReport;
  },

  getReports: async (): Promise<Report[]> => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_REPORTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  updateReportStatus: async (reportId: string, status: Report['status']): Promise<void> => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (!stored) return;
    const reports: Report[] = JSON.parse(stored);
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx !== -1) {
      reports[idx].status = status;
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
    }
  },

  // ── Reputation ─────────────────────────────────────────────────────────────

  getUserReputation: async (userId: string): Promise<UserReputation> => {
    const posts = await communityClient.getPosts();
    const comments = await communityClient.getAllComments();
    return computeReputation(userId, posts, comments);
  },

  getTopContributors: async (limit = 5): Promise<(UserReputation & { name: string; role: string })[]> => {
    const posts = await communityClient.getPosts();
    const comments = await communityClient.getAllComments();

    const userMap: Record<string, { name: string; role: string }> = {};
    posts.forEach((p) => { userMap[p.authorId] = { name: p.authorName, role: p.authorRole }; });
    comments.forEach((c) => { userMap[c.authorId] = { name: c.authorName, role: c.authorRole }; });

    return Object.entries(userMap)
      .map(([userId, info]) => ({
        ...computeReputation(userId, posts, comments),
        name: info.name,
        role: info.role,
      }))
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
