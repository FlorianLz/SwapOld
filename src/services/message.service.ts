import messageRepository from '../repository/message.repository';
import messageFactory from '../factory/message.factory';

const messageService = {
  /**
   * getMessagesForArticle récupère les messages associés à un article et à un utilisateur donnés.
   * @param articleId L'identifiant de l'article associé aux messages.
   * @param userId L'identifiant de l'utilisateur associé aux messages.
   * @returns Une promesse résolue avec les messages associés à l'article et à l'utilisateur donnés.
   */
  getMessagesForArticle: async (articleId: string, userId: string) => {
    const rawMessages = await messageRepository.getMessagesForArticle(
      articleId,
      userId,
    );
    return await messageFactory.getMessagesForArticle(rawMessages, userId);
  },

  /**
   * sendMessage envoie un message entre deux utilisateurs concernant un article donné.
   * @param myId L'identifiant de l'utilisateur qui envoie le message.
   * @param otherId L'identifiant de l'utilisateur destinataire du message.
   * @param msgInput La chaîne de caractères correspondant au contenu du message.
   * @param idArticle L'identifiant de l'article associé au message.
   * @param readByReceiver Un booléen indiquant si le destinataire a lu le message.
   * @returns Une promesse résolue avec le résultat de l'envoi du message.
   */
  sendMessage: async (
    myId: string,
    otherId: string,
    msgInput: string,
    idArticle: number,
    readByReceiver: boolean,
  ) => {
    return await messageRepository.sendMessage(
      myId,
      otherId,
      msgInput,
      idArticle,
      readByReceiver,
    );
  },

  /**
   * updateReadMessagesForArticle met à jour le statut de lecture des messages associés à un article et à un utilisateur donnés.
   * @param articleId L'identifiant de l'article associé aux messages.
   * @param userId L'identifiant de l'utilisateur associé aux messages.
   * @returns Une promesse résolue avec le résultat de la mise à jour du statut de lecture des messages.
   */
  updateReadMessagesForArticle: (articleId: string, userId: string) => {
    return messageRepository.updateReadMessagesForArticle(articleId, userId);
  },
};
export default messageService;
