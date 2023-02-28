import {supabase} from '../lib/initSupabase';

const articleRepository = {
  getAllArticles: async () => {
    const {data} = await supabase.from('articles').select(`
    *,
    articles_images (
      id,
      image_name
    ),
    articles_profiles (
      id_profile,
      profiles (
        username
        )
    ),
    articles_favorites (
      id_profile
    )
  `);
    return data;
  },
  getArticleById: async (id: number) => {
    const {data} = await supabase
      .from('articles')
      .select(
        `
    *,
    articles_images (
      id,
      image_name
    ),
    articles_profiles (
      id_profile,
      profiles (
        username
        )
    ),
    articles_favorites (
      id_profile
    )
  `,
      )
      .eq('id', id);
    return data ? data[0] : {};
  },
  getFavoriteArticles: async (userId: number) => {
    const {data} = await supabase
      .from('articles')
      .select(
        '*, articles_favorites!inner (id_profile), articles_images (id, image_name), articles_profiles (id_profile, profiles (username))',
      )
      .eq('articles_favorites.id_profile', userId);
    return data;
  },
  toggleLikeArticle: async (articleId: number, userId: number) => {
    const {data} = await supabase
      .from('articles_favorites')
      .select('id')
      .eq('id_article', articleId)
      .eq('id_profile', userId);
    if (data && data.length > 0) {
      return supabase
        .from('articles_favorites')
        .delete()
        .eq('id_article', articleId)
        .eq('id_profile', userId);
    } else {
      return supabase.from('articles_favorites').insert([
        {
          id_article: articleId,
          id_profile: userId,
        },
      ]);
    }
  },
  searchArticles: async (search: string) => {
    const {data} = await supabase
      .from('articles')
      .select(
        `
    *,
    articles_images (
      id,
      image_name
    ),
    articles_profiles (
      id_profile,
      profiles (
        username
        )
    ),
    articles_favorites (
      id_profile
    )
  `,
      )
      .ilike('title', `%${search}%`);
    return data;
  },
};
export default articleRepository;
