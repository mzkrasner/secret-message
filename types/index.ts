export type Profile = {
  id?: any;
  name?: string;
  username?: string;
  description?: string;
  gender?: string;
  emoji?: string;
};

export type Posts = {
  edges: Array<{
    node: {
      body: string;
      id: string;
      to: string;
      symKey: string;
      chain: string;
      accessControlConditions: string;
      accessControlConditionType: string;
    };
  }>;
};

export type PostProps = {
  author: Author;
  post: Post;
};

export type SidebarProps = {
  name?: string;
  username?: string;
  id?: string;
};

export type Author = {
  id: string;
  name: string;
  username: string;

  emoji: string;
};

type Post = {
  body: string;
  id: string;
  to: string;
  created: string;
  symKey: string;
  chain: string;
  accessControlConditions: string;
  accessControlConditionType: string;
};
