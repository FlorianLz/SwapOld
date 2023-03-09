import messageRepository from '../repository/message.repository';
import messageFactory from '../factory/message.factory';

const messageService = {
  getMessagesForArticle: async (articleId: string, userId: string) => {
    const rawMessages = await messageRepository.getMessagesForArticle(
      articleId,
      userId,
    );
    return await messageFactory.getMessagesForArticle(rawMessages, userId);
  },
  sendMessage: async (
    myId: string,
    otherId: string,
    msgInput: string,
    idArticle: number,
  ) => {
    return await messageRepository.sendMessage(
      myId,
      otherId,
      msgInput,
      idArticle,
    );
  },
};
export default messageService;