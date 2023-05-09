import {supabase} from '../lib/initSupabase';

const messageRepository = {
  /**
   * Récupère les messages pour un article spécifié et un utilisateur spécifié.
   * @param {string} articleId - L'identifiant de l'article pour lequel récupérer les messages.
   * @param {string} userId - L'identifiant de l'utilisateur pour lequel récupérer les messages.
   * @returns {Promise<Array<Object>>} - Les données des messages récupérés pour l'article et l'utilisateur spécifiés.
   */
  getMessagesForArticle: async (articleId: string, userId: string) => {
    const {data} = await supabase
      .from('articles_chat_profiles')
      .select(
        '*, id_first_profile (id,username,avatar_url), id_second_profile (id,username,avatar_url)',
      )
      .eq('id_article', articleId)
      .or('id_first_profile.eq.' + userId + ',id_second_profile.eq.' + userId);
    return data;
  },

  /**
   * Envoie un message dans une conversation entre deux utilisateurs concernant un article.
   * @param myId - L'identifiant de l'utilisateur envoyant le message.
   * @param otherId - L'identifiant de l'utilisateur recevant le message.
   * @param msgInput - Le message à envoyer.
   * @param idArticle - L'identifiant de l'article concerné.
   * @param readByReceiver - Indique si le message a été lu par le destinataire.
   * @returns Un objet contenant un indicateur d'erreur et éventuellement des données.
   */
  sendMessage: async (
    myId: string,
    otherId: string,
    msgInput: string,
    idArticle: number,
    readByReceiver: boolean,
  ) => {
    const {data, error} = await supabase.from('articles_chat_profiles').insert({
      id_article: idArticle,
      id_first_profile: myId,
      id_second_profile: otherId,
      message: msgInput,
      read_by_receiver: readByReceiver,
    });
    if (error) {
      return {error: true, message: error.message};
    }
    return {error: false, data: data};
  },

  /**
   * Met à jour le champ `read_by_receiver` de tous les messages non-lus d'un utilisateur pour un article donné.
   * @param articleId - L'identifiant de l'article.
   * @param userId - L'identifiant de l'utilisateur.
   * @returns Un objet avec une propriété `error` qui vaut `true` si une erreur s'est produite lors de la mise à jour, ou `false` sinon, et une propriété `data` qui contient les données mises à jour.
   */
  updateReadMessagesForArticle: async (articleId: string, userId: string) => {
    const {data, error} = await supabase
      .from('articles_chat_profiles')
      .update({read_by_receiver: true})
      .eq('id_article', articleId)
      .eq('id_second_profile', userId);
    if (error) {
      return {error: true, message: error.message};
    }
    return {error: false, data: data};
  },
};
export default messageRepository;
