import {supabase} from '../lib/initSupabase';

const articleRepository = {
  getAllArticles: async (userId: any) => {
    if (!userId) {
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
    )
  `);
      return data;
    } else {
      const {data} = await supabase
        .from('articles')
        .select(
          `
    *,
    articles_images (
      id,
      image_name
    ),
    articles_profiles!inner (
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
        .eq('articles_favorites.id_profile', userId)
        .neq('articles_profiles.id_profile', userId);
      return data;
    }
  },
  getArticleById: async (id: number, userId: any) => {
    if (!userId) {
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
    )
  `,
        )
        .eq('id', id);
      return data ? data[0] : {};
    } else {
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
        .eq('id', id)
        .eq('articles_favorites.id_profile', userId);
      return data ? data[0] : {};
    }
  },
  getFavoriteArticles: async (userId: string) => {
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
  addArticle: async (idUser: string, title: string, description: string) => {
    const {data, error} = await supabase.rpc('insert_articles', {
      title,
      description,
      location: {latitude: 0, longitude: 0},
      id_profile: idUser,
    });
    // @ts-ignore
    if (data !== null && data === 1) {
      return {error: false};
    } else {
      return {error: true, message: error?.message};
    }
  },
  getAllMyPublishedArticles: async (idUser: string) => {
    const {data} = await supabase
      .from('articles')
      .select(
        `
    *,
    articles_images (
      id,
      image_name
    ),
    articles_profiles!inner (
      id_profile,
      profiles (
        username
        )
    )
  `,
      )
      .eq('articles_profiles.id_profile', idUser);
    return data;
  },
  deleteArticle: async (articleId: number) => {
    const {data, error} = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);
    console.log('ici', data);
    if (error) {
      return {error: true, message: error.message};
    } else {
      return {error: false};
    }
  },
};
export default articleRepository;
