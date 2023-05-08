import imagesHelper from '../helpers/images.helper';

const messageFactory = {
  /**
   * Cette fonction prend en entrée un tableau d'objets rawMessages, ainsi qu'un identifiant d'utilisateur userId.
   * Elle retourne un tableau d'objets messages formatés, triés par ordre décroissant d'identifiant, avec une indication de l'expéditeur et du destinataire.
   *
   * @param {Array} rawMessages - Un tableau d'objets contenant les messages bruts.
   * @param {String} userId - L'identifiant de l'utilisateur connecté.
   * @returns {Array} - Un tableau d'objets messages formatés.
   */
  getMessagesForArticle(rawMessages: any | null, userId: string) {
    return rawMessages
      .map((message: any) => {
        const isSender = message.id_first_profile === userId;
        return {
          _id: message.id,
          text: message.message,
          isSender,
          user: {
            _id: message.id_first_profile.id,
            name: message.id_first_profile.username,
            avatar: imagesHelper.getPublicUrlByImageName(
              message.id_first_profile.avatar_url,
            ),
          },
          createdAt: message.created_at,
          otherId: isSender
            ? message.id_second_profile
            : message.id_first_profile,
        };
      })
      .sort((a: any, b: any) => {
        return b._id - a._id;
      });
  },

  /**
   * Formatte un nouveau message reçu en ajoutant des informations supplémentaires.
   * @param {any} message - Le message reçu à formater.
   * @param {string} userId - L'identifiant de l'utilisateur courant.
   * @param {any} userToAdd - L'objet représentant l'utilisateur à ajouter.
   * @returns {Object} - Un objet contenant les informations formatées du message.
   */
  formatNewMessageReceived(message: any, userId: string, userToAdd: any) {
    const isSender = message.id_first_profile === userId;
    return {
      _id: message.id,
      text: message.message,
      isSender,
      user: {
        _id: userToAdd.id,
        name: userToAdd.name,
        avatar: userToAdd.avatar,
      },
      createdAt: message.created_at,
      otherId: isSender ? message.id_second_profile : message.id_first_profile,
    };
  },
};
export default messageFactory;
