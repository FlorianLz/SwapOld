import {supabase} from '../lib/initSupabase';

const messageRepository = {
  getMessagesForArticle: async (articleId: string, userId: string) => {
    const {data} = await supabase
      .from('articles_chat_profiles')
      .select('*')
      .eq('id_article', articleId)
      .or('id_first_profile.eq.' + userId + ',id_second_profile.eq.' + userId);
    return data;
  },
  sendMessage: async (
    myId: string,
    otherId: string,
    msgInput: string,
    idArticle: number,
  ) => {
    const {data, error} = await supabase.from('articles_chat_profiles').insert({
      id_article: idArticle,
      id_first_profile: myId,
      id_second_profile: otherId,
      message: msgInput,
    });
    if (error) {
      return {error: true, message: error.message};
    }
    return {error: false, data: data};
  },
};
export default messageRepository;
