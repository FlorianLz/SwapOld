import { supabase } from "../lib/initSupabase";

const articleRepository = {
  getAllArticles: async () => {
    const { data } = await supabase.from("articles").select(`
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
};
export default articleRepository;
