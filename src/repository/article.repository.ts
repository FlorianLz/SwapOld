import {supabase} from '../lib/initSupabase';

const articleRepository = {
  /**
   * Récupère tous les articles qui ne sont pas privés et ont le statut "0"
   * Si l'argument `userId` est fourni, retourne les articles favorisés par l'utilisateur
   * et publiés par d'autres utilisateurs que lui-même.
   * @param userId L'ID de l'utilisateur dont les articles favoris doivent être retournés
   * Si cet argument n'est pas fourni, tous les articles non privés sont retournés.
   * @returns Un tableau d'objets représentant les articles récupérés. Chaque objet contient les propriétés
   * de l'article ainsi que les propriétés des images liées, des profils associés et des favoris associés.
   */
  getAllArticles: async (userId: any) => {
    if (!userId) {
      // Si l'ID de l'utilisateur n'est pas fourni, récupère tous les articles non privés
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
        .eq('private', false)
        .eq('status', 0);
      return data;
    } else {
      // Si l'ID de l'utilisateur est fourni, récupère les articles favorisés par l'utilisateur
      // et publiés par d'autres utilisateurs que lui-même
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
        .eq('private', false)
        .eq('status', 0)
        .eq('articles_favorites.id_profile', userId)
        .neq('articles_profiles.id_profile', userId);
      return data;
    }
  },

  /**
   * Récupère les informations d'un article en fonction de son identifiant `id`.
   * @param {number} id - L'identifiant de l'article à récupérer.
   * @param {any} userId - L'identifiant de l'utilisateur qui effectue la demande ou `null` si l'utilisateur n'est pas connecté.
   * @returns {IArticleData} - Les informations de l'article correspondant à l'identifiant `id`.
   */
  getArticleById: async (id: number, userId: any) => {
    if (!userId) {
      // Sélectionne toutes les informations de l'article si l'utilisateur n'est pas connecté.
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
      return data ? data[0] : {}; // Retourne les informations de l'article ou un objet vide si l'article n'existe pas.
    } else {
      // Sélectionne les informations de l'article et vérifie que l'utilisateur connecté est bien autorisé à accéder à cet article.
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

  /**
   * Récupère tous les articles favoris pour un utilisateur donné.
   * @param userId L'ID de l'utilisateur.
   * @returns Une liste d'articles favoris avec leurs informations associées.
   */
  getFavoriteArticles: async (userId: string) => {
    const {data} = await supabase
      .from('articles')
      .select(
        '*, articles_favorites!inner (id_profile), articles_images (id, image_name), articles_profiles (id_profile, profiles (username))',
      )
      .eq('articles_favorites.id_profile', userId);
    return data;
  },

  /**
   * Cette fonction permet de marquer un article comme aimé ou non-aimé par un utilisateur donné.
   * @param articleId - L'identifiant de l'article à marquer comme aimé ou non-aimé.
   * @param userId - L'identifiant de l'utilisateur qui marque l'article comme aimé ou non-aimé.
   * @returns Une promesse qui se résoudra avec les résultats de la requête à la base de données.
   */
  toggleLikeArticle: async (articleId: number, userId: number) => {
    // Vérifie si l'article a déjà été aimé par l'utilisateur
    const {data} = await supabase
      .from('articles_favorites')
      .select('id')
      .eq('id_article', articleId)
      .eq('id_profile', userId);

    // Si l'article a déjà été aimé, supprime l'enregistrement correspondant
    if (data && data.length > 0) {
      return supabase
        .from('articles_favorites')
        .delete()
        .eq('id_article', articleId)
        .eq('id_profile', userId);
    }
    // Sinon, ajoute un nouvel enregistrement pour marquer l'article comme aimé
    else {
      return supabase.from('articles_favorites').insert([
        {
          id_article: articleId,
          id_profile: userId,
        },
      ]);
    }
  },

  /**
   * Cette fonction permet de rechercher des articles en fonction d'un terme de recherche donné.
   * @param search - Le terme de recherche à utiliser pour trouver des articles.
   * @param userId - L'identifiant de l'utilisateur effectuant la recherche.
   * @returns Une promesse qui se résoudra avec les résultats de la recherche.
   */
  searchArticles: async (search: string, userId: string) => {
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
      .ilike('title', `%${search}%`)
      .eq('private', false)
      .eq('status', 0)
      .eq('articles_favorites.id_profile', userId)
      .neq('articles_profiles.id_profile', userId);
    return data;
  },

  /**
   * Cette fonction permet d'ajouter un nouvel article à la base de données.
   * @param idUser - L'identifiant de l'utilisateur qui crée l'article.
   * @param title - Le titre de l'article à ajouter.
   * @param description - La description de l'article à ajouter.
   * @param location - L'emplacement de l'article à ajouter (latitude, longitude et nom de la ville).
   * @param privateArticle - Un indicateur booléen indiquant si l'article doit être privé ou public.
   * @returns Une promesse qui se résoudra avec un objet contenant l'identifiant de l'article nouvellement créé s'il est ajouté avec succès, sinon renvoie une erreur avec un message.
   */
  addArticle: async (
    idUser: string,
    title: string,
    description: string,
    location: any,
    privateArticle: boolean,
  ) => {
    const {data, error} = await supabase.rpc('insert_articles', {
      title,
      description,
      location: {
        latitude: location?.latitude,
        longitude: location.longitude,
        cityName: location.cityName,
      },
      private: privateArticle,
      id_profile: idUser,
    });
    if (data !== null && data > 0) {
      return {error: false, id_article: data};
    } else {
      return {error: true, message: error?.message};
    }
  },

  /**
   * Cette fonction permet de récupérer tous les articles publiés par l'utilisateur donné.
   * @param idUser - L'identifiant de l'utilisateur dont les articles publiés doivent être récupérés.
   * @returns Une promesse qui se résoudra avec un tableau d'objets contenant les articles publiés par l'utilisateur donné, ou une erreur le cas échéant.
   */
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
      .eq('articles_profiles.id_profile', idUser)
      .eq('status', 0);
    return data;
  },

  /**
   * Cette fonction permet de supprimer un article de la base de données, ainsi que toutes les images associées à cet article.
   * @param articleId - L'identifiant de l'article à supprimer.
   * @param idUser - L'identifiant de l'utilisateur qui a publié l'article.
   * @returns Une promesse qui se résoudra avec un objet indiquant si la suppression s'est bien passée ou s'il y a eu une erreur.
   */
  deleteArticle: async (articleId: number, idUser: string) => {
    let {error} = await supabase.from('articles').delete().eq('id', articleId);
    if (error) {
      return {error: true, message: error.message};
    } else {
      let del = await supabase
        .from('articles_images')
        .delete()
        .like('image_name', idUser + '/' + articleId + '/%');
      if (del.error) {
        return {error: true, message: del.error.message};
      } else {
        return {error: false};
      }
    }
  },

  /**
   Ajoute une image à un article dans la base de données.
   @param {number} articleId - L'identifiant de l'article dans la base de données.
   @param {string} imagePath - Le chemin de l'image à ajouter.
   @returns {Promise<Object>} - Un objet indiquant si l'opération s'est déroulée avec succès ou s'il y a eu une erreur.
   @property {boolean} error - Indique s'il y a eu une erreur lors de l'opération.
   @property {string} message - Le message d'erreur, s'il y en a un.
   */
  addImageToArticle: async (articleId: number, imagePath: string) => {
    const {error} = await supabase.from('articles_images').insert([
      {
        article_id: articleId,
        image_name: imagePath,
      },
    ]);
    if (error) {
      return {error: true, message: error.message};
    }
    return {error: false};
  },

  /**
   * Effectue l'échange d'articles entre deux profils.
   * @param id_profile_sender L'ID du profil de l'utilisateur qui envoie la demande d'échange.
   * @param id_profile_receiver L'ID du profil de l'utilisateur qui reçoit la demande d'échange.
   * @param id_article_sender L'ID de l'article que l'utilisateur qui envoie la demande d'échange souhaite échanger.
   * @param id_article_receiver L'ID de l'article que l'utilisateur qui reçoit la demande d'échange souhaite échanger.
   * @returns Un objet avec une propriété "error" indiquant s'il y a eu une erreur, et une propriété "message" contenant un message d'erreur si nécessaire.
   */
  swapArticle: async (
    id_profile_sender: string,
    id_profile_receiver: string,
    id_article_sender: number,
    id_article_receiver: number,
  ) => {
    // Vérifier si l'échange existe déjà dans la base de données
    const {data: existingSwap, error: selectError} = await supabase
      .from('swap')
      .select('*')
      .eq('id_profile_sender', id_profile_sender)
      .eq('id_profile_receiver', id_profile_receiver)
      .eq('id_article_sender', id_article_sender)
      .eq('id_article_receiver', id_article_receiver);

    if (selectError) {
      return {error: true, message: selectError.message};
    }

    if (existingSwap && existingSwap.length > 0) {
      // L'échange existe déjà, ne rien faire et retourner une erreur
      return {
        error: true,
        message: 'Cet échange existe déjà dans la base de données.',
      };
    }

    // Insérer l'échange dans la base de données
    const {error: insertError} = await supabase.from('swap').insert([
      {
        id_profile_sender: id_profile_sender,
        id_profile_receiver: id_profile_receiver,
        id_article_sender: id_article_sender,
        id_article_receiver: id_article_receiver,
      },
    ]);

    if (insertError) {
      return {error: true, message: insertError.message};
    }

    return {error: false};
  },

  /**
   * Récupère tous les échanges en fonction de l'état et du profil spécifiés.
   * @param id_profile L'ID du profil pour lequel récupérer les échanges.
   * @param state L'état des échanges à récupérer (0 pour "en attente", 1 pour "en cours", 2 pour "terminé").
   * @returns Un objet contenant un tableau de données et une indication d'erreur (true si une erreur s'est produite, false sinon).
   */
  getSwapsByStateAndProfile: async (id_profile: string, state: 0 | 1 | 2) => {
    // Effectue la requête pour récupérer les échanges correspondants
    const {data, error} = await supabase
      .from('swap')
      .select(
        `
    *,
    id_article_sender (
      *,
      articles_images (
        id,
        image_name
      ),
      articles_profiles (
        id_profile,
        profiles (
          username,
          avatar_url
        )
      ),
      articles_favorites (
        id_profile
      )
    ),
    id_article_receiver (
      *,
      articles_images (
        id,
        image_name
      ),
      articles_profiles (
        id_profile,
        profiles (
          username,
          avatar_url
        )
      ),
      articles_favorites (
        id_profile
      )
    )
  `,
      )
      .eq('state', state)
      .or(
        `id_profile_sender.eq.${id_profile},id_profile_receiver.eq.${id_profile}`,
      );

    if (error) {
      // Retourne une indication d'erreur s'il y a eu un problème lors de la récupération des données
      return {error: true, message: error.message, data: []};
    }
    // Retourne les données récupérées
    return {error: false, data};
  },

  /**
   * Met à jour l'état (state) d'un échange (swap) dans la base de données Supabase.
   * @param id_swap Le numéro d'identification de l'échange à mettre à jour.
   * @param id_profile L'identifiant du profil qui reçoit l'échange.
   * @param state L'état (1 ou 2) à attribuer à l'échange.
   * @returns Une promesse qui résout avec un objet contenant les propriétés `error` et `data`.
   */
  changeStateSwapArticle: async (
    id_swap: number,
    id_profile: string,
    state: 1 | 2,
  ) => {
    const {data, error} = await supabase
      .from('swap')
      .update({state})
      .eq('id', id_swap)
      .eq('id_profile_receiver', id_profile)
      .select('*');

    if (error) {
      return {error: true, message: error.message};
    }

    return {error: false, data};
  },

  /**
   * Met à jour l'état (status) d'un ou deux articles dans la base de données Supabase.
   * @param id_article_sender L'identifiant de l'article envoyé à mettre à jour. Peut être null.
   * @param id_article_receiver L'identifiant de l'article reçu à mettre à jour. Peut être null.
   * @param status L'état (1 ou 2) à attribuer à l'article.
   * @returns Une promesse qui résout avec un objet contenant la propriété `error`.
   */
  changeStateArticle: async (
    id_article_sender: string,
    id_article_receiver: string,
    status: 1 | 2,
  ) => {
    if (id_article_sender) {
      const {error} = await supabase
        .from('articles')
        .update({status})
        .eq('id', id_article_sender);
      if (error) {
        return {error: true, message: error.message};
      }
    }

    if (id_article_receiver) {
      const {error} = await supabase
        .from('articles')
        .update({status})
        .eq('id', id_article_receiver);
      if (error) {
        return {error: true, message: error.message};
      }
    }

    return {error: false};
  },

  /**
   * Récupère les identifiants des articles associés à des messages non lus par un profil donné.
   * @param id_profile L'identifiant du profil pour lequel récupérer les messages non lus.
   * @returns Une promesse qui résout avec un objet contenant la propriété `error`.
   */
  getArticlesIdWhereMessageNotRead: async (id_profile: string) => {
    const {data, error} = await supabase
      .from('articles_chat_profiles')
      .select('id_article')
      .eq('id_second_profile', id_profile)
      .eq('read_by_receiver', false);

    if (error) {
      return {error: true, message: error.message, data: []};
    }

    return {error: false, data};
  },

  /**
   * Récupère toutes les propositions d'échange envoyées par un utilisateur dans la base de données Supabase.
   * @param idUser L'identifiant de l'utilisateur dont on veut récupérer les propositions d'échange.
   * @returns Une promesse qui résout avec un tableau d'objets représentant les propositions d'échange.
   */
  getAllMyPropositionsToSwap: async (idUser: string) => {
    const {data} = await supabase
      .from('swap')
      .select(
        `
    *
  `,
      )
      .eq('id_profile_sender', idUser);
    return data;
  },

  /**
   * Récupère la date de création du dernier message envoyé pour chaque article dans la base de données Supabase.
   * @returns Une promesse qui résout avec un tableau d'objets représentant les messages de chaque article.
   */
  async getDateLastMessageByIdArticle() {
    const {data} = await supabase
      .from('articles_chat_profiles')
      .select(
        `
    *
  `,
      )
      .order('created_at', {ascending: false});
    return data;
  },

  /**
   * Récupère les états de toutes les propositions de swap associées à un article spécifié dans la base de données Supabase.
   * @param {string} idArticle - L'identifiant de l'article dont on veut récupérer les propositions de swap associées.
   * @returns Une promesse qui résout avec un tableau d'objets représentant les propositions de swap associées à l'article.
   * Chaque objet contient une propriété `state` indiquant l'état de la proposition (1 = non acceptée, 2 = acceptée).
   */
  getAllArticlesIdsWithSwap: async (idArticle: string) => {
    const {data} = await supabase
      .from('swap')
      .select(
        `
    state
  `,
      )
      .or(
        `id_article_sender.eq.${idArticle},id_article_receiver.eq.${idArticle}`,
      )
      .neq('state', 1);
    return data;
  },

  /**
   * Met à jour l'état d'échange validé d'un article dans la base de données Supabase.
   * @param {number} id - L'identifiant de l'article dont on veut mettre à jour l'état d'échange validé.
   * @returns Une promesse qui résout avec un objet contenant une propriété `error` indiquant si une erreur est survenue lors de la mise à jour, une propriété `data` contenant les données de l'article mis à jour si la mise à jour a réussi, et éventuellement une propriété `message` contenant un message d'erreur si `error` est vrai.
   */
  updateArticleEchangeValide: async (id: number) => {
    const {data, error} = await supabase
      .from('articles')
      .update({echange_valide: true})
      .eq('id', id);
    if (error) {
      return {error: true, message: error.message};
    }
    return {error: false, data};
  },

  /**
   * Met à jour le statut d'un article dans la base de données Supabase.
   * @param {number} id - L'identifiant de l'article dont on veut mettre à jour le statut.
   * @returns Une promesse qui résout avec un objet contenant une propriété `error` indiquant si une erreur est survenue lors de la mise à jour, une propriété `data` contenant les données de l'article mis à jour si la mise à jour a réussi, et éventuellement une propriété `message` contenant un message d'erreur si `error` est vrai.
   */
  updateArticleStatus: async (id: number) => {
    const {data, error} = await supabase
      .from('articles')
      .update({status: 2})
      .eq('id', id);
    if (error) {
      return {error: true, message: error.message};
    }
    return {error: false, data};
  },

  /**
   * Récupère la valeur de la propriété "echange_valide" d'un article spécifié par son identifiant.
   * @param {number} id - L'identifiant de l'article.
   * @returns {Promise<{data: {echange_valide: boolean}}>} - Une promesse qui contient un objet avec la propriété "echange_valide" de l'article.
   */
  getEchangeValide: async (id: number) => {
    const {data} = await supabase
      .from('articles')
      .select(
        `
    echange_valide
  `,
      )
      .eq('id', id);
    return {data};
  },
};
export default articleRepository;
