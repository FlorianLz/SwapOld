const messageFactory = {
  getMessagesForArticle(rawMessages: any | null, userId: string) {
    return rawMessages.map((message: any) => {
      const isSender = message.id_first_profile === userId;
      return {
        id: message.id,
        message: message.message,
        isSender,
        createdAt: message.created_at,
        otherId: isSender
          ? message.id_second_profile
          : message.id_first_profile,
      };
    });
  },
  formatNewMessageReceived(message: any, userId: string) {
    const isSender = message.id_first_profile === userId;
    return {
      id: message.id,
      message: message.message,
      isSender,
      createdAt: message.created_at,
    };
  },
};
export default messageFactory;
