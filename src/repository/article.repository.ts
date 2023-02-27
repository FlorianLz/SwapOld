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
};
export default articleRepository;
